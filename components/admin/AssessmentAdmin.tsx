"use client";

import {
  Archive,
  Award,
  BookOpenCheck,
  Check,
  ClipboardCheck,
  Copy,
  Edit3,
  FileQuestion,
  Link2,
  LoaderCircle,
  MessageCircle,
  Plus,
  RefreshCw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserCheck,
  X,
} from "lucide-react";
import { FormEvent, useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  assessmentAssignmentStatusLabels,
  assessmentDifficultyOptions,
  assessmentQuestionCountOptions,
  assessmentQuestionTypeOptions,
  assessmentScopeOptions,
  assessmentTrackOptions,
  delegableAssessmentRanks,
} from "@/lib/assessments";
import { graduationLabels, graduationOptions, rankGroups, rankLabels } from "@/lib/member-access";
import type {
  Assessment,
  AssessmentAssignment,
  AssessmentDifficulty,
  AssessmentManagerPermission,
  AssessmentQuestion,
  AssessmentQuestionType,
  AssessmentScopeType,
  AssessmentTrack,
  DkRank,
  GraduationLevel,
} from "@/lib/types";

type AdminTab = "resumo" | "questoes" | "avaliacoes" | "indicacoes" | "correcoes" | "resultados" | "permissoes";
type MemberSummary = { id: string; full_name: string; nickname: string; rank: DkRank; status: string };
type PendingReview = {
  assignment_id: string;
  item_id: string;
  open_answer: string;
  reviewer_feedback?: string | null;
  answered_at: string;
  item: { id: string; assessment_id: string; prompt: string; expected_answer: string; source_manual_title: string; source_chapter?: string | null; source_page?: string | null };
  assignment: AssessmentAssignment;
};
type AssessmentAdminData = {
  actor: { id: string; nickname: string; rank: DkRank; canDelegate: boolean };
  questions: AssessmentQuestion[];
  assessments: Assessment[];
  assignments: AssessmentAssignment[];
  members: MemberSummary[];
  permissions: AssessmentManagerPermission[];
  reviews: PendingReview[];
};

type QuestionForm = {
  prompt: string;
  question_type: AssessmentQuestionType;
  options: string[];
  correct_option: number;
  expected_answer: string;
  explanation: string;
  manual_title: string;
  source_chapter: string;
  source_page: string;
  scope_type: AssessmentScopeType;
  rank_scopes: DkRank[];
  graduation_scopes: GraduationLevel[];
  track: AssessmentTrack;
  difficulty: AssessmentDifficulty;
  active: boolean;
};

type AssessmentForm = {
  title: string;
  description: string;
  target_type: AssessmentScopeType;
  target_rank: DkRank;
  target_graduation: GraduationLevel;
  track: AssessmentTrack;
  question_count: number;
  passing_score: number;
  duration_minutes: string;
  content_type: AssessmentScopeType;
  content_ranks: DkRank[];
  content_graduations: GraduationLevel[];
};

const emptyQuestion: QuestionForm = {
  prompt: "",
  question_type: "objetiva",
  options: ["", "", "", "", ""],
  correct_option: 0,
  expected_answer: "",
  explanation: "",
  manual_title: "",
  source_chapter: "",
  source_page: "",
  scope_type: "patente",
  rank_scopes: ["terceiro_sargento"],
  graduation_scopes: [],
  track: "geral",
  difficulty: "basica",
  active: true,
};

const emptyAssessment: AssessmentForm = {
  title: "",
  description: "",
  target_type: "patente",
  target_rank: "primeiro_sargento",
  target_graduation: "bronze",
  track: "geral",
  question_count: 10,
  passing_score: 70,
  duration_minutes: "",
  content_type: "patente",
  content_ranks: ["terceiro_sargento", "segundo_sargento", "primeiro_sargento"],
  content_graduations: [],
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error || "Não foi possível concluir a operação.");
  return result;
}

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value)) : "Sem prazo";
}

function toggleValue<T extends string>(current: T[], value: T) {
  return current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
}

export default function AssessmentAdmin() {
  const [tab, setTab] = useState<AdminTab>("resumo");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [questionForm, setQuestionForm] = useState<QuestionForm>(emptyQuestion);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [questionSearch, setQuestionSearch] = useState("");
  const [assessmentForm, setAssessmentForm] = useState<AssessmentForm>(emptyAssessment);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [assignmentAssessmentId, setAssignmentAssessmentId] = useState("");
  const [assignmentMemberIds, setAssignmentMemberIds] = useState<Set<string>>(new Set());
  const [assignmentExpiresAt, setAssignmentExpiresAt] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState<Record<string, string>>({});

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 4500);
  }, []);

  const assessmentQuery = useQuery({
    queryKey: ["assessment-admin"],
    queryFn: () => requestJson<AssessmentAdminData>("/api/admin/assessments", { cache: "no-store" }),
  });
  const data = assessmentQuery.data ?? null;
  const loading = assessmentQuery.isPending || assessmentQuery.isFetching;
  const effectiveAssignmentAssessmentId = assignmentAssessmentId || data?.assessments.find((assessment) => assessment.status === "publicado")?.id || "";

  const memberById = useMemo(() => new Map(data?.members.map((member) => [member.id, member]) ?? []), [data?.members]);
  const assessmentById = useMemo(() => new Map(data?.assessments.map((assessment) => [assessment.id, assessment]) ?? []), [data?.assessments]);
  const permissionByUser = useMemo(() => new Map(data?.permissions.map((permission) => [permission.user_id, permission]) ?? []), [data?.permissions]);

  const eligibleQuestions = useMemo(() => (data?.questions ?? []).filter((question) => {
    if (!question.active || question.scope_type !== assessmentForm.content_type) return false;
    const scopeMatches = question.scope_type === "patente"
      ? question.rank_scopes.some((rank) => assessmentForm.content_ranks.includes(rank))
      : question.graduation_scopes.some((level) => assessmentForm.content_graduations.includes(level));
    const trackMatches = assessmentForm.track === "geral"
      ? question.track === "geral"
      : question.track === "geral" || question.track === assessmentForm.track;
    return scopeMatches && trackMatches;
  }), [data?.questions, assessmentForm.content_type, assessmentForm.content_ranks, assessmentForm.content_graduations, assessmentForm.track]);

  const filteredQuestions = useMemo(() => {
    const search = questionSearch.trim().toLocaleLowerCase("pt-BR");
    if (!search) return data?.questions ?? [];
    return (data?.questions ?? []).filter((question) => `${question.prompt} ${question.manual_title} ${question.source_chapter ?? ""}`.toLocaleLowerCase("pt-BR").includes(search));
  }, [data?.questions, questionSearch]);

  async function saveQuestion(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const url = editingQuestion ? `/api/admin/assessments/questions/${editingQuestion}` : "/api/admin/assessments/questions";
      await requestJson(url, { method: editingQuestion ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(questionForm) });
      setQuestionForm(emptyQuestion);
      setEditingQuestion(null);
      showNotice(editingQuestion ? "Questão atualizada. As avaliações já publicadas preservam a versão anterior." : "Questão cadastrada no banco.");
      await assessmentQuery.refetch();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar a questão.");
    } finally {
      setBusy(false);
    }
  }

  function editQuestion(question: AssessmentQuestion) {
    setQuestionForm({
      prompt: question.prompt,
      question_type: question.question_type,
      options: question.question_type === "objetiva" ? question.options : ["", "", "", "", ""],
      correct_option: question.correct_option ?? 0,
      expected_answer: question.expected_answer ?? "",
      explanation: question.explanation ?? "",
      manual_title: question.manual_title,
      source_chapter: question.source_chapter ?? "",
      source_page: question.source_page ?? "",
      scope_type: question.scope_type,
      rank_scopes: question.rank_scopes,
      graduation_scopes: question.graduation_scopes,
      track: question.track,
      difficulty: question.difficulty,
      active: question.active,
    });
    setEditingQuestion(question.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deactivateQuestion(id: string) {
    if (!window.confirm("Desativar esta questão? Avaliações já publicadas não serão alteradas.")) return;
    setBusy(true);
    try {
      await requestJson(`/api/admin/assessments/questions/${id}`, { method: "DELETE" });
      showNotice("Questão desativada.");
      await assessmentQuery.refetch();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível desativar a questão.");
    } finally {
      setBusy(false);
    }
  }

  function selectAutomatically() {
    if (eligibleQuestions.length < assessmentForm.question_count) {
      setError(`Há ${eligibleQuestions.length} questão(ões) compatíveis. Cadastre pelo menos ${assessmentForm.question_count}.`);
      return;
    }
    const shuffled = [...eligibleQuestions].sort(() => Math.random() - 0.5);
    setSelectedQuestionIds(new Set(shuffled.slice(0, assessmentForm.question_count).map((question) => question.id)));
    setError("");
    showNotice(`${assessmentForm.question_count} questões selecionadas automaticamente. Revise antes de publicar.`);
  }

  async function createAssessment(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await requestJson("/api/admin/assessments/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: assessmentForm.title,
          description: assessmentForm.description,
          target_type: assessmentForm.target_type,
          target_rank: assessmentForm.target_type === "patente" ? assessmentForm.target_rank : null,
          target_graduation: assessmentForm.target_type === "graduacao" ? assessmentForm.target_graduation : null,
          content_type: assessmentForm.content_type,
          content_rank_scopes: assessmentForm.content_type === "patente" ? assessmentForm.content_ranks : [],
          content_graduation_scopes: assessmentForm.content_type === "graduacao" ? assessmentForm.content_graduations : [],
          track: assessmentForm.track,
          question_count: assessmentForm.question_count,
          passing_score: assessmentForm.passing_score,
          duration_minutes: assessmentForm.duration_minutes,
          question_ids: Array.from(selectedQuestionIds),
        }),
      });
      setAssessmentForm(emptyAssessment);
      setSelectedQuestionIds(new Set());
      showNotice("Avaliação publicada e pronta para receber indicações.");
      await assessmentQuery.refetch();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível criar a avaliação.");
    } finally {
      setBusy(false);
    }
  }

  async function createAssignments(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await requestJson<{ assignments: AssessmentAssignment[] }>("/api/admin/assessments/assignments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessment_id: effectiveAssignmentAssessmentId,
          member_ids: Array.from(assignmentMemberIds),
          expires_at: assignmentExpiresAt ? new Date(assignmentExpiresAt).toISOString() : null,
        }),
      });
      setAssignmentMemberIds(new Set());
      showNotice(`${result.assignments.length} indicação(ões) criada(s). Os links individuais já podem ser compartilhados.`);
      await assessmentQuery.refetch();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível criar as indicações.");
    } finally {
      setBusy(false);
    }
  }

  function assignmentUrl(assignment: AssessmentAssignment) {
    return `${window.location.origin}/membro/simulados/${assignment.access_token}`;
  }

  async function copyAssignmentLink(assignment: AssessmentAssignment) {
    await navigator.clipboard.writeText(assignmentUrl(assignment));
    showNotice("Link individual copiado.");
  }

  function shareAssignment(assignment: AssessmentAssignment) {
    const member = memberById.get(assignment.member_id);
    const assessment = assessmentById.get(assignment.assessment_id);
    const text = `Olá, ${member?.nickname ?? "integrante"}! Você recebeu uma indicação para a avaliação “${assessment?.title ?? "Avaliação do DK"}”. Acesse com sua conta do DK: ${assignmentUrl(assignment)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  }

  async function changeAssignment(assignment: AssessmentAssignment, action: "cancel" | "reset") {
    let reason = "";
    if (action === "cancel" && !window.confirm("Cancelar esta indicação antes do início? O link deixará de funcionar.")) return;
    if (action === "reset") {
      if (!window.confirm("A liberação excepcional apagará as respostas e o resultado desta tentativa. Deseja continuar?")) return;
      reason = window.prompt("Informe o motivo técnico ou administrativo da nova liberação:")?.trim() ?? "";
      if (reason.length < 10) return setError("A justificativa precisa ter pelo menos 10 caracteres.");
    }
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/admin/assessments/assignments/${assignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      showNotice(action === "cancel" ? "Indicação cancelada." : "Tentativa liberada excepcionalmente e registrada na auditoria.");
      await assessmentQuery.refetch();
    } catch (reasonCaught) {
      setError(reasonCaught instanceof Error ? reasonCaught.message : "Não foi possível alterar a indicação.");
    } finally {
      setBusy(false);
    }
  }

  async function reviewAnswer(review: PendingReview, isCorrect: boolean) {
    const key = `${review.assignment_id}:${review.item_id}`;
    setBusy(true);
    setError("");
    try {
      await requestJson("/api/admin/assessments/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignment_id: review.assignment_id, item_id: review.item_id, is_correct: isCorrect, feedback: reviewFeedback[key] ?? "" }),
      });
      showNotice("Correção registrada. O resultado foi recalculado.");
      await assessmentQuery.refetch();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível corrigir a resposta.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePermission(userId: string, active: boolean) {
    setBusy(true);
    setError("");
    try {
      await requestJson("/api/admin/assessments/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, active }),
      });
      showNotice(active ? "Permissão de Gestor de Avaliações concedida." : "Permissão de Gestor de Avaliações removida.");
      await assessmentQuery.refetch();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível alterar a permissão.");
    } finally {
      setBusy(false);
    }
  }

  if (loading && !data) return <div className="assessment-loading"><LoaderCircle className="spin" /><p>Carregando o módulo de avaliações…</p></div>;
  if (!data) return <div className="empty-state"><FileQuestion /><h2>Módulo indisponível</h2><p>{error || (assessmentQuery.error instanceof Error ? assessmentQuery.error.message : "Aplique a migração 009 no Supabase para ativar esta área.")}</p><button className="button button-primary" type="button" onClick={() => void assessmentQuery.refetch()}><RefreshCw /> Tentar novamente</button></div>;

  const publishedAssessments = data.assessments.filter((assessment) => assessment.status === "publicado");
  const completedAssignments = data.assignments.filter((assignment) => assignment.status === "corrigido");
  const seniorOfficers = data.members.filter((member) => delegableAssessmentRanks.includes(member.rank));

  return <div className="assessment-admin-module">
    {notice && <div className="admin-notice">{notice}</div>}
    <div className="assessment-module-heading">
      <div><p className="eyebrow">Formação e progressão</p><h2>Avaliações e simulados</h2><p>Banco de questões, indicações individuais, correções e histórico.</p></div>
      <button className="button button-ghost" type="button" onClick={() => void assessmentQuery.refetch()} disabled={loading}><RefreshCw className={loading ? "spin" : ""} /> Atualizar</button>
    </div>
    {error && <div className="assessment-admin-error"><X /><span>{error}</span><button type="button" onClick={() => setError("")}>Fechar</button></div>}

    <nav className="assessment-admin-tabs" aria-label="Seções das avaliações">
      <AssessmentTab label="Resumo" icon={<ClipboardCheck />} active={tab === "resumo"} onClick={() => setTab("resumo")} />
      <AssessmentTab label="Questões" icon={<FileQuestion />} active={tab === "questoes"} onClick={() => setTab("questoes")} count={data.questions.filter((question) => question.active).length} />
      <AssessmentTab label="Avaliações" icon={<BookOpenCheck />} active={tab === "avaliacoes"} onClick={() => setTab("avaliacoes")} count={publishedAssessments.length} />
      <AssessmentTab label="Indicações" icon={<Send />} active={tab === "indicacoes"} onClick={() => setTab("indicacoes")} count={data.assignments.length} />
      <AssessmentTab label="Correções" icon={<Edit3 />} active={tab === "correcoes"} onClick={() => setTab("correcoes")} count={data.reviews.length} />
      <AssessmentTab label="Resultados" icon={<Award />} active={tab === "resultados"} onClick={() => setTab("resultados")} count={completedAssignments.length} />
      {data.actor.canDelegate && <AssessmentTab label="Permissões" icon={<ShieldCheck />} active={tab === "permissoes"} onClick={() => setTab("permissoes")} />}
    </nav>

    {tab === "resumo" && <section className="assessment-admin-panel">
      <div className="assessment-metric-grid">
        <Metric icon={<FileQuestion />} value={data.questions.filter((question) => question.active).length} label="Questões ativas" />
        <Metric icon={<BookOpenCheck />} value={publishedAssessments.length} label="Avaliações publicadas" />
        <Metric icon={<UserCheck />} value={data.assignments.filter((assignment) => assignment.status === "em_andamento" || assignment.status === "convidado").length} label="Indicações abertas" />
        <Metric icon={<Edit3 />} value={data.reviews.length} label="Respostas a corrigir" />
      </div>
      <div className="assessment-guidance-card"><ShieldCheck /><div><h3>Permissão independente</h3><p>Você acessa este módulo como {rankLabels[data.actor.rank]}. Ser ADM Principal não concede automaticamente a criação de avaliações; esta regra segue a hierarquia definida para o DK.</p></div></div>
      <div className="assessment-workflow-list">
        <span><b>1</b> Cadastre as questões com a fonte do manual.</span>
        <span><b>2</b> Monte e publique uma avaliação com 10 a 100 questões.</span>
        <span><b>3</b> Selecione os indicados e compartilhe os links individuais.</span>
        <span><b>4</b> Corrija as respostas abertas e consulte os resultados.</span>
      </div>
    </section>}

    {tab === "questoes" && <section className="assessment-admin-panel">
      <form className="assessment-builder-form" onSubmit={saveQuestion}>
        <header><div><p className="eyebrow">Banco de questões</p><h3>{editingQuestion ? "Editar questão" : "Cadastrar questão"}</h3></div>{editingQuestion && <button className="button button-ghost" type="button" onClick={() => { setEditingQuestion(null); setQuestionForm(emptyQuestion); }}><X /> Cancelar edição</button>}</header>
        <div className="field full"><label htmlFor="question-prompt">Enunciado</label><textarea id="question-prompt" rows={5} value={questionForm.prompt} onChange={(event) => setQuestionForm({ ...questionForm, prompt: event.target.value })} placeholder="Digite a pergunta exatamente como o indicado deverá recebê-la." required /></div>
        <div className="assessment-form-grid">
          <label className="field"><span>Tipo</span><select value={questionForm.question_type} onChange={(event) => setQuestionForm({ ...questionForm, question_type: event.target.value as AssessmentQuestionType })}>{assessmentQuestionTypeOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
          <label className="field"><span>Manual de origem</span><input value={questionForm.manual_title} onChange={(event) => setQuestionForm({ ...questionForm, manual_title: event.target.value })} placeholder="Ex.: Manual DK — Nível 3" required /></label>
          <label className="field"><span>Capítulo ou tópico</span><input value={questionForm.source_chapter} onChange={(event) => setQuestionForm({ ...questionForm, source_chapter: event.target.value })} placeholder="Ex.: Capítulo 4" /></label>
          <label className="field"><span>Página</span><input value={questionForm.source_page} onChange={(event) => setQuestionForm({ ...questionForm, source_page: event.target.value })} placeholder="Ex.: 28" /></label>
          <label className="field"><span>Categoria</span><select value={questionForm.scope_type} onChange={(event) => setQuestionForm({ ...questionForm, scope_type: event.target.value as AssessmentScopeType, rank_scopes: event.target.value === "patente" ? ["terceiro_sargento"] : [], graduation_scopes: event.target.value === "graduacao" ? ["bronze"] : [] })}>{assessmentScopeOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
          <label className="field"><span>Área</span><select value={questionForm.track} onChange={(event) => setQuestionForm({ ...questionForm, track: event.target.value as AssessmentTrack })}>{assessmentTrackOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
          <label className="field"><span>Dificuldade</span><select value={questionForm.difficulty} onChange={(event) => setQuestionForm({ ...questionForm, difficulty: event.target.value as AssessmentDifficulty })}>{assessmentDifficultyOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
        </div>
        <fieldset className="assessment-checkbox-fieldset"><legend>{questionForm.scope_type === "patente" ? "Patentes relacionadas" : "Graduações relacionadas"}</legend>
          {questionForm.scope_type === "patente" ? rankGroups.map((group) => <div className="assessment-checkbox-group" key={group.category}><strong>{group.category}</strong><div>{group.ranks.map((rank) => <label key={rank.value}><input type="checkbox" checked={questionForm.rank_scopes.includes(rank.value)} onChange={() => setQuestionForm({ ...questionForm, rank_scopes: toggleValue(questionForm.rank_scopes, rank.value) })} /> {rank.label}</label>)}</div></div>) : <div className="assessment-checkbox-group"><div>{graduationOptions.filter((item) => item.value !== "sem_graduacao").map((level) => <label key={level.value}><input type="checkbox" checked={questionForm.graduation_scopes.includes(level.value)} onChange={() => setQuestionForm({ ...questionForm, graduation_scopes: toggleValue(questionForm.graduation_scopes, level.value) })} /> {level.label}</label>)}</div></div>}
        </fieldset>
        {questionForm.question_type === "objetiva" ? <fieldset className="assessment-options-editor"><legend>Alternativas — marque uma resposta correta</legend>{questionForm.options.map((option, index) => <label key={index} className={questionForm.correct_option === index ? "correct" : ""}><input type="radio" name="correct-option" checked={questionForm.correct_option === index} onChange={() => setQuestionForm({ ...questionForm, correct_option: index })} /><span>{String.fromCharCode(65 + index)}</span><input value={option} onChange={(event) => setQuestionForm({ ...questionForm, options: questionForm.options.map((current, optionIndex) => optionIndex === index ? event.target.value : current) })} placeholder={`Alternativa ${String.fromCharCode(65 + index)}`} required /></label>)}</fieldset> : <label className="field full"><span>Gabarito esperado</span><textarea rows={5} value={questionForm.expected_answer} onChange={(event) => setQuestionForm({ ...questionForm, expected_answer: event.target.value })} placeholder="Descreva os elementos que precisam aparecer na resposta." required /></label>}
        <label className="field full"><span>Explicação do gabarito (opcional)</span><textarea rows={3} value={questionForm.explanation} onChange={(event) => setQuestionForm({ ...questionForm, explanation: event.target.value })} placeholder="Justificativa interna para os responsáveis pela correção." /></label>
        {editingQuestion && <label className="check-field"><input type="checkbox" checked={questionForm.active} onChange={(event) => setQuestionForm({ ...questionForm, active: event.target.checked })} /> Questão ativa e disponível para novas avaliações</label>}
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : editingQuestion ? <Check /> : <Plus />} {editingQuestion ? "Salvar alterações" : "Cadastrar questão"}</button>
      </form>

      <div className="assessment-list-heading"><div><h3>Questões cadastradas</h3><p>{data.questions.filter((question) => question.active).length} ativas · {data.questions.filter((question) => !question.active).length} desativadas</p></div><label className="assessment-search"><Search /><input value={questionSearch} onChange={(event) => setQuestionSearch(event.target.value)} placeholder="Buscar enunciado ou manual" /></label></div>
      <div className="assessment-question-bank-list">{filteredQuestions.map((question) => <article className={!question.active ? "inactive" : ""} key={question.id}><header><span>{question.question_type === "objetiva" ? "Objetiva" : "Aberta"}</span><span>{assessmentTrackOptions.find((item) => item.value === question.track)?.label}</span><span>{assessmentDifficultyOptions.find((item) => item.value === question.difficulty)?.label}</span>{!question.active && <span>Desativada</span>}</header><h4>{question.prompt}</h4><p>{question.manual_title}{question.source_chapter ? ` · ${question.source_chapter}` : ""}{question.source_page ? ` · p. ${question.source_page}` : ""}</p><footer><div>{question.scope_type === "patente" ? question.rank_scopes.map((rank) => <small key={rank}>{rankLabels[rank]}</small>) : question.graduation_scopes.map((level) => <small key={level}>{graduationLabels[level]}</small>)}</div><div className="row-actions"><button type="button" onClick={() => editQuestion(question)} aria-label="Editar questão"><Edit3 /></button>{question.active && <button type="button" onClick={() => void deactivateQuestion(question.id)} aria-label="Desativar questão"><Archive /></button>}</div></footer></article>)}</div>
    </section>}

    {tab === "avaliacoes" && <section className="assessment-admin-panel">
      <form className="assessment-builder-form" onSubmit={createAssessment}>
        <header><div><p className="eyebrow">Montagem</p><h3>Criar avaliação</h3><p>O objetivo e os conteúdos cobrados são independentes.</p></div></header>
        <div className="assessment-form-grid">
          <label className="field full"><span>Título</span><input value={assessmentForm.title} onChange={(event) => setAssessmentForm({ ...assessmentForm, title: event.target.value })} placeholder="Ex.: Avaliação de indicação para 1º Sargento" required /></label>
          <label className="field full"><span>Descrição</span><textarea rows={3} value={assessmentForm.description} onChange={(event) => setAssessmentForm({ ...assessmentForm, description: event.target.value })} placeholder="Orientações que aparecerão antes do início." /></label>
          <label className="field"><span>Tipo do objetivo</span><select value={assessmentForm.target_type} onChange={(event) => setAssessmentForm({ ...assessmentForm, target_type: event.target.value as AssessmentScopeType })}>{assessmentScopeOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
          {assessmentForm.target_type === "patente" ? <label className="field"><span>Patente pretendida</span><select value={assessmentForm.target_rank} onChange={(event) => setAssessmentForm({ ...assessmentForm, target_rank: event.target.value as DkRank })}>{rankGroups.flatMap((group) => group.ranks).map((rank) => <option value={rank.value} key={rank.value}>{rank.label}</option>)}</select></label> : <label className="field"><span>Graduação pretendida</span><select value={assessmentForm.target_graduation} onChange={(event) => setAssessmentForm({ ...assessmentForm, target_graduation: event.target.value as GraduationLevel })}>{graduationOptions.filter((item) => item.value !== "sem_graduacao").map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>}
          <label className="field"><span>Área</span><select value={assessmentForm.track} onChange={(event) => { setAssessmentForm({ ...assessmentForm, track: event.target.value as AssessmentTrack }); setSelectedQuestionIds(new Set()); }}>{assessmentTrackOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
          <label className="field"><span>Quantidade</span><select value={assessmentForm.question_count} onChange={(event) => { setAssessmentForm({ ...assessmentForm, question_count: Number(event.target.value) }); setSelectedQuestionIds(new Set()); }}>{assessmentQuestionCountOptions.map((count) => <option value={count} key={count}>{count} questões</option>)}</select></label>
          <label className="field"><span>Percentual de aprovação</span><input type="number" min="0" max="100" value={assessmentForm.passing_score} onChange={(event) => setAssessmentForm({ ...assessmentForm, passing_score: Number(event.target.value) })} /></label>
          <label className="field"><span>Tempo em minutos (opcional)</span><input type="number" min="5" max="360" value={assessmentForm.duration_minutes} onChange={(event) => setAssessmentForm({ ...assessmentForm, duration_minutes: event.target.value })} placeholder="Sem limite" /></label>
          <label className="field"><span>Tipo dos conteúdos</span><select value={assessmentForm.content_type} onChange={(event) => { const type = event.target.value as AssessmentScopeType; setAssessmentForm({ ...assessmentForm, content_type: type, content_ranks: type === "patente" ? ["terceiro_sargento"] : [], content_graduations: type === "graduacao" ? ["bronze"] : [] }); setSelectedQuestionIds(new Set()); }}>{assessmentScopeOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></label>
        </div>
        <fieldset className="assessment-checkbox-fieldset"><legend>Conteúdos cobrados</legend>{assessmentForm.content_type === "patente" ? rankGroups.map((group) => <div className="assessment-checkbox-group" key={group.category}><strong>{group.category}</strong><div>{group.ranks.map((rank) => <label key={rank.value}><input type="checkbox" checked={assessmentForm.content_ranks.includes(rank.value)} onChange={() => { setAssessmentForm({ ...assessmentForm, content_ranks: toggleValue(assessmentForm.content_ranks, rank.value) }); setSelectedQuestionIds(new Set()); }} /> {rank.label}</label>)}</div></div>) : <div className="assessment-checkbox-group"><div>{graduationOptions.filter((item) => item.value !== "sem_graduacao").map((level) => <label key={level.value}><input type="checkbox" checked={assessmentForm.content_graduations.includes(level.value)} onChange={() => { setAssessmentForm({ ...assessmentForm, content_graduations: toggleValue(assessmentForm.content_graduations, level.value) }); setSelectedQuestionIds(new Set()); }} /> {level.label}</label>)}</div></div>}</fieldset>
        <div className="assessment-selection-heading"><div><h4>Seleção das questões</h4><p>{eligibleQuestions.length} compatíveis · {selectedQuestionIds.size} de {assessmentForm.question_count} selecionadas</p></div><button className="button button-ghost" type="button" onClick={selectAutomatically}><Sparkles /> Selecionar automaticamente</button></div>
        <div className="assessment-question-selector">{eligibleQuestions.length ? eligibleQuestions.map((question) => <label className={selectedQuestionIds.has(question.id) ? "selected" : ""} key={question.id}><input type="checkbox" checked={selectedQuestionIds.has(question.id)} disabled={!selectedQuestionIds.has(question.id) && selectedQuestionIds.size >= assessmentForm.question_count} onChange={() => setSelectedQuestionIds((current) => { const next = new Set(current); if (next.has(question.id)) next.delete(question.id); else next.add(question.id); return next; })} /><span><strong>{question.prompt}</strong><small>{question.manual_title} · {question.question_type === "objetiva" ? "Objetiva" : "Aberta"}</small></span></label>) : <div className="assessment-inline-empty"><FileQuestion /><p>Nenhuma questão ativa corresponde aos conteúdos e à área escolhidos.</p></div>}</div>
        <button className="button button-primary" type="submit" disabled={busy || selectedQuestionIds.size !== assessmentForm.question_count}>{busy ? <LoaderCircle className="spin" /> : <BookOpenCheck />} Publicar avaliação</button>
      </form>
      <div className="assessment-list-heading"><div><h3>Avaliações publicadas</h3><p>As questões ficam congeladas na versão utilizada na publicação.</p></div></div>
      <div className="assessment-template-grid">{publishedAssessments.map((assessment) => <article key={assessment.id}><header><BookOpenCheck /><span>{assessment.question_count} questões</span></header><h4>{assessment.title}</h4><p>{assessment.description || "Sem descrição adicional."}</p><dl><div><dt>Objetivo</dt><dd>{assessment.target_type === "patente" ? rankLabels[assessment.target_rank!] : graduationLabels[assessment.target_graduation!]}</dd></div><div><dt>Conteúdos</dt><dd>{assessment.content_type === "patente" ? assessment.content_rank_scopes.map((rank) => rankLabels[rank]).join(", ") : assessment.content_graduation_scopes.map((level) => graduationLabels[level]).join(", ")}</dd></div><div><dt>Área</dt><dd>{assessmentTrackOptions.find((item) => item.value === assessment.track)?.label}</dd></div><div><dt>Aprovação</dt><dd>{Number(assessment.passing_score)}%</dd></div><div><dt>Tempo</dt><dd>{assessment.duration_minutes ? `${assessment.duration_minutes} min` : "Livre"}</dd></div></dl></article>)}</div>
    </section>}

    {tab === "indicacoes" && <section className="assessment-admin-panel">
      <form className="assessment-builder-form" onSubmit={createAssignments}>
        <header><div><p className="eyebrow">Convocação individual</p><h3>Criar nova indicação</h3><p>Cada integrante receberá um link exclusivo e uma única tentativa.</p></div></header>
        <div className="assessment-form-grid">
          <label className="field"><span>Avaliação</span><select value={effectiveAssignmentAssessmentId} onChange={(event) => setAssignmentAssessmentId(event.target.value)} required><option value="">Selecione</option>{publishedAssessments.map((assessment) => <option value={assessment.id} key={assessment.id}>{assessment.title}</option>)}</select></label>
          <label className="field"><span>Data limite (opcional)</span><input type="datetime-local" value={assignmentExpiresAt} onChange={(event) => setAssignmentExpiresAt(event.target.value)} /></label>
        </div>
        <fieldset className="assessment-member-selector"><legend>Integrantes indicados</legend><div>{data.members.map((member) => <label className={assignmentMemberIds.has(member.id) ? "selected" : ""} key={member.id}><input type="checkbox" checked={assignmentMemberIds.has(member.id)} onChange={() => setAssignmentMemberIds((current) => { const next = new Set(current); if (next.has(member.id)) next.delete(member.id); else next.add(member.id); return next; })} /><span><strong>{member.nickname}</strong><small>{member.full_name} · {rankLabels[member.rank]}</small></span></label>)}</div></fieldset>
        <button className="button button-primary" type="submit" disabled={busy || !effectiveAssignmentAssessmentId || !assignmentMemberIds.size}>{busy ? <LoaderCircle className="spin" /> : <Link2 />} Gerar {assignmentMemberIds.size || ""} link(s)</button>
      </form>
      <div className="assessment-list-heading"><div><h3>Indicações registradas</h3><p>O mesmo integrante pode receber uma nova indicação posteriormente.</p></div></div>
      <div className="table-wrap assessment-table"><table><thead><tr><th>Integrante</th><th>Avaliação</th><th>Indicação</th><th>Situação</th><th>Prazo</th><th>Ações</th></tr></thead><tbody>{data.assignments.map((assignment) => <tr key={assignment.id}><td><strong>{memberById.get(assignment.member_id)?.nickname ?? "Membro"}</strong><small>{rankLabels[memberById.get(assignment.member_id)?.rank ?? "recruta"]}</small></td><td>{assessmentById.get(assignment.assessment_id)?.title ?? "Avaliação"}</td><td>nº {assignment.indication_number}</td><td><span className={`assessment-status status-${assignment.status}`}>{assessmentAssignmentStatusLabels[assignment.status]}</span></td><td>{formatDate(assignment.expires_at)}</td><td className="row-actions"><button type="button" onClick={() => void copyAssignmentLink(assignment)} aria-label="Copiar link"><Copy /></button><button type="button" onClick={() => shareAssignment(assignment)} aria-label="Compartilhar no WhatsApp"><MessageCircle /></button>{assignment.status === "convidado" && <button type="button" onClick={() => void changeAssignment(assignment, "cancel")} aria-label="Cancelar indicação"><X /></button>}{data.actor.canDelegate && assignment.status !== "convidado" && <button type="button" onClick={() => void changeAssignment(assignment, "reset")} aria-label="Liberar nova tentativa excepcional"><RefreshCw /></button>}</td></tr>)}</tbody></table></div>
    </section>}

    {tab === "correcoes" && <section className="assessment-admin-panel">
      <div className="assessment-list-heading"><div><h3>Respostas abertas pendentes</h3><p>O resultado final só será liberado depois que todas forem classificadas.</p></div></div>
      {data.reviews.length ? <div className="assessment-review-list">{data.reviews.map((review) => { const key = `${review.assignment_id}:${review.item_id}`; const member = memberById.get(review.assignment.member_id); const assessment = assessmentById.get(review.assignment.assessment_id); return <article key={key}><header><div><span>{member?.nickname ?? "Integrante"}</span><small>{assessment?.title ?? "Avaliação"} · indicação nº {review.assignment.indication_number}</small></div><span>{review.item.source_manual_title}</span></header><h4>{review.item.prompt}</h4><div className="assessment-review-comparison"><section><strong>Resposta do integrante</strong><p>{review.open_answer}</p></section><section><strong>Gabarito esperado</strong><p>{review.item.expected_answer}</p></section></div><label className="field"><span>Comentário para registro (opcional)</span><textarea rows={3} value={reviewFeedback[key] ?? ""} onChange={(event) => setReviewFeedback((current) => ({ ...current, [key]: event.target.value }))} /></label><footer><button className="button button-ghost" type="button" onClick={() => void reviewAnswer(review, false)} disabled={busy}><X /> Marcar incorreta</button><button className="button button-primary" type="button" onClick={() => void reviewAnswer(review, true)} disabled={busy}><Check /> Marcar correta</button></footer></article>; })}</div> : <div className="empty-state"><Check /><h2>Nenhuma correção pendente</h2><p>As respostas abertas entregues aparecerão aqui.</p></div>}
    </section>}

    {tab === "resultados" && <section className="assessment-admin-panel">
      <div className="assessment-list-heading"><div><h3>Histórico de resultados</h3><p>Resultados vinculados ao perfil e à indicação de cada integrante.</p></div></div>
      <div className="table-wrap assessment-table"><table><thead><tr><th>Integrante</th><th>Avaliação</th><th>Indicação</th><th>Acertos</th><th>Erros</th><th>Resultado</th><th>Conclusão</th></tr></thead><tbody>{data.assignments.filter((assignment) => assignment.status === "corrigido" || assignment.status === "aguardando_correcao").map((assignment) => <tr key={assignment.id}><td><strong>{memberById.get(assignment.member_id)?.nickname ?? "Membro"}</strong><small>{rankLabels[memberById.get(assignment.member_id)?.rank ?? "recruta"]}</small></td><td>{assessmentById.get(assignment.assessment_id)?.title ?? "Avaliação"}</td><td>nº {assignment.indication_number}</td><td>{assignment.correct_count ?? "—"}</td><td>{assignment.incorrect_count ?? "—"}</td><td>{assignment.status === "aguardando_correcao" ? <span className="assessment-status status-aguardando_correcao">Aguardando correção</span> : <><strong>{Number(assignment.score_percent ?? 0).toFixed(1)}%</strong><small>{assignment.passed ? "Aprovado" : "Não aprovado"}</small></>}</td><td>{formatDate(assignment.graded_at ?? assignment.submitted_at)}</td></tr>)}</tbody></table></div>
    </section>}

    {tab === "permissoes" && data.actor.canDelegate && <section className="assessment-admin-panel">
      <div className="assessment-list-heading"><div><h3>Gestores de Avaliações</h3><p>Generais possuem acesso automático. A delegação abaixo é exclusiva para Oficiais Superiores.</p></div></div>
      {seniorOfficers.length ? <div className="assessment-permission-list">{seniorOfficers.map((member) => { const permission = permissionByUser.get(member.id); const active = Boolean(permission?.active); return <article key={member.id}><div className="assessment-permission-avatar">{member.nickname.slice(0, 2).toUpperCase()}</div><div><strong>{member.nickname}</strong><span>{member.full_name} · {rankLabels[member.rank]}</span></div><button className={`assessment-permission-toggle ${active ? "active" : ""}`} type="button" onClick={() => void togglePermission(member.id, !active)} disabled={busy} aria-pressed={active}><span>{active ? "Autorizado" : "Sem acesso"}</span><i /></button></article>; })}</div> : <div className="empty-state"><ShieldCheck /><h2>Nenhum Oficial Superior disponível</h2><p>Majores, Tenentes-Coronéis e Coronéis aprovados aparecerão aqui.</p></div>}
    </section>}
  </div>;
}

function AssessmentTab({ label, icon, active, onClick, count }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void; count?: number }) {
  return <button type="button" className={active ? "active" : ""} onClick={onClick}>{icon}<span>{label}</span>{count !== undefined && <small>{count}</small>}</button>;
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return <article><span>{icon}</span><div><strong>{value}</strong><small>{label}</small></div></article>;
}
