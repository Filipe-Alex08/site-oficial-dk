"use client";

import {
  Archive,
  Award,
  BookOpenCheck,
  Check,
  ClipboardCheck,
  Copy,
  PenLine,
  Pencil,
  FileQuestion,
  Link2,
  LoaderCircle,
  MessageCircle,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  ShieldCheck,
  Shuffle,
  Square,
  UserCheck,
  X,
} from "lucide-react";
import { FormEvent, useId, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminDialog from "@/components/admin/AdminDialog";
import AdminTitle from "@/components/admin/AdminTitle";
import AssessmentCreateForm, { type AssessmentPayload } from "@/components/admin/AssessmentCreateForm";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import { useToast } from "@/components/admin/ToastProvider";
import { onTabListKeyDown } from "@/components/admin/ui/tabKeys";
import Select from "@/components/ui/Select";
import {
  assessmentAssignmentStatusLabels,
  assessmentDifficultyOptions,
  assessmentQuestionTypeOptions,
  assessmentScopeOptions,
  assessmentTrackOptions,
  delegableAssessmentRanks,
} from "@/lib/assessments";
import { graduationLabels, graduationOptions, rankGroups, rankLabels, rankShortLabels } from "@/lib/member-access";
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

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const result = await response.json() as T & { error?: string };
  if (!response.ok) throw new Error(result.error || "Não foi possível concluir a operação.");
  return result;
}

/** Compartilhada com o AdminDashboard (badge de correções) pela mesma chave de cache. */
export const assessmentAdminQueryKey = ["assessment-admin"] as const;
export function fetchAssessmentAdminData() {
  return requestJson<AssessmentAdminData>("/api/admin/assessments", { cache: "no-store" });
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
  const toast = useToast();
  const confirm = useConfirm();
  const [resetDialog, setResetDialog] = useState<{ assignment: AssessmentAssignment; reason: string } | null>(null);
  const [questionForm, setQuestionForm] = useState<QuestionForm>(emptyQuestion);
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null);
  const [questionSearch, setQuestionSearch] = useState("");
  const [creatingAssessment, setCreatingAssessment] = useState(false);
  const [assignmentAssessmentId, setAssignmentAssessmentId] = useState("");
  const [assignmentMemberIds, setAssignmentMemberIds] = useState<Set<string>>(new Set());
  const [assignmentExpiresAt, setAssignmentExpiresAt] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState<Record<string, string>>({});

  // Avisos pela pilha única do painel; setError("") continua valendo como "limpar", sem aviso.
  const showNotice = (message: string) => toast.success(message);
  const setError = (message: string) => { if (message) toast.error(message); };

  const assessmentQuery = useQuery({
    queryKey: assessmentAdminQueryKey,
    queryFn: fetchAssessmentAdminData,
    // O tempo real (AdminDashboard) atualiza esta mesma consulta na hora; o intervalo
    // é só uma rede de segurança para quando o Realtime não está disponível.
    refetchInterval: tab === "indicacoes" ? 30_000 : false,
  });
  const data = assessmentQuery.data ?? null;
  const loading = assessmentQuery.isPending || assessmentQuery.isFetching;
  const effectiveAssignmentAssessmentId = assignmentAssessmentId || data?.assessments.find((assessment) => assessment.status === "publicado")?.id || "";

  const memberById = useMemo(() => new Map(data?.members.map((member) => [member.id, member]) ?? []), [data?.members]);
  const assessmentById = useMemo(() => new Map(data?.assessments.map((assessment) => [assessment.id, assessment]) ?? []), [data?.assessments]);
  const permissionByUser = useMemo(() => new Map(data?.permissions.map((permission) => [permission.user_id, permission]) ?? []), [data?.permissions]);

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
      showNotice(editingQuestion ? "Questão atualizada." : "Questão cadastrada.");
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

  async function createAssessment(body: AssessmentPayload) {
    setBusy(true);
    setError("");
    try {
      await requestJson("/api/admin/assessments/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      showNotice("Avaliação publicada.");
      setCreatingAssessment(false);
      await assessmentQuery.refetch();
      return true;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível criar a avaliação.");
      return false;
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

  async function changeAssignment(assignment: AssessmentAssignment, action: "cancel" | "close" | "reset") {
    if (action === "cancel" && !(await confirm({ title: "Cancelar esta indicação?", message: "Ela ainda não começou. O link deixará de funcionar.", confirmLabel: "Cancelar indicação", cancelLabel: "Voltar", danger: true }))) return;
    if (action === "close" && !(await confirm({ title: "Encerrar esta avaliação agora?", message: "As respostas já salvas serão corrigidas e as não respondidas contarão como erro.", confirmLabel: "Encerrar", cancelLabel: "Voltar", danger: true }))) return;
    if (action === "reset") {
      // O motivo é pedido num diálogo próprio; a ação segue em applyAssignmentChange.
      setResetDialog({ assignment, reason: "" });
      return;
    }
    await applyAssignmentChange(assignment, action, "");
  }

  async function applyAssignmentChange(assignment: AssessmentAssignment, action: "cancel" | "close" | "reset", reason: string) {
    setBusy(true);
    setError("");
    try {
      await requestJson(`/api/admin/assessments/assignments/${assignment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      showNotice(action === "cancel"
        ? "Indicação cancelada."
        : action === "close"
          ? "Avaliação encerrada pelo responsável e resultado calculado."
          : "Tentativa liberada.");
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

  if (loading && !data) return <div className="assessment-loading"><LoaderCircle className="spin" /><p>Carregando avaliações…</p></div>;
  if (!data) return <div className="empty-state"><FileQuestion /><h2>Avaliações indisponíveis</h2><p>Tente novamente em alguns instantes.</p><button className="button button-primary" type="button" onClick={() => void assessmentQuery.refetch()}><RefreshCw /> Tentar novamente</button></div>;

  const publishedAssessments = data.assessments.filter((assessment) => assessment.status === "publicado");
  const completedAssignments = data.assignments.filter((assignment) => assignment.status === "corrigido");
  const seniorOfficers = data.members.filter((member) => delegableAssessmentRanks.includes(member.rank));

  return <div className="assessment-admin-module">
    <AdminTitle
      eyebrow="Gestão"
      title="Avaliações"
      action={<button className="icon-button" type="button" onClick={() => void assessmentQuery.refetch()} disabled={loading} title={loading ? "Atualizando…" : "Atualizar"} aria-label="Atualizar avaliações"><RefreshCw className={loading ? "spin" : ""} aria-hidden="true" /></button>}
    />

    <div className="admin-subtabs" role="tablist" aria-label="Seções das avaliações" onKeyDown={onTabListKeyDown}>
      <AssessmentTab label="Resumo" icon={<ClipboardCheck />} active={tab === "resumo"} onClick={() => setTab("resumo")} />
      <AssessmentTab label="Questões" icon={<FileQuestion />} active={tab === "questoes"} onClick={() => setTab("questoes")} count={data.questions.filter((question) => question.active).length} />
      <AssessmentTab label="Avaliações" icon={<BookOpenCheck />} active={tab === "avaliacoes"} onClick={() => setTab("avaliacoes")} count={publishedAssessments.length} />
      <AssessmentTab label="Indicações" icon={<Send />} active={tab === "indicacoes"} onClick={() => setTab("indicacoes")} count={data.assignments.length} />
      <AssessmentTab label="Correções" icon={<PenLine />} active={tab === "correcoes"} onClick={() => setTab("correcoes")} count={data.reviews.length} alert />
      <AssessmentTab label="Resultados" icon={<Award />} active={tab === "resultados"} onClick={() => setTab("resultados")} count={completedAssignments.length} />
      {data.actor.canDelegate && <AssessmentTab label="Permissões" icon={<ShieldCheck />} active={tab === "permissoes"} onClick={() => setTab("permissoes")} />}
    </div>

    {tab === "resumo" && <section className="assessment-admin-panel">
      <div className="kpi-strip">
        <Metric icon={<FileQuestion />} value={data.questions.filter((question) => question.active).length} label="Questões ativas" />
        <Metric icon={<BookOpenCheck />} value={publishedAssessments.length} label="Avaliações publicadas" />
        <Metric icon={<UserCheck />} value={data.assignments.filter((assignment) => assignment.status === "em_andamento" || assignment.status === "convidado").length} label="Indicações abertas" />
        <Metric icon={<PenLine />} value={data.reviews.length} label="Respostas a corrigir" />
      </div>
      </section>}

    {tab === "questoes" && <section className="assessment-admin-panel">
      <form className="assessment-builder-form" onSubmit={saveQuestion}>
        <header><div><h3>{editingQuestion ? "Editar questão" : "Cadastrar questão"}</h3></div>{editingQuestion && <button className="button button-ghost" type="button" onClick={() => { setEditingQuestion(null); setQuestionForm(emptyQuestion); }}><X /> Cancelar</button>}</header>
        <div className="field full"><label htmlFor="question-prompt">Enunciado</label><textarea id="question-prompt" rows={5} value={questionForm.prompt} onChange={(event) => setQuestionForm({ ...questionForm, prompt: event.target.value })} placeholder="Texto da pergunta" required /></div>
        <div className="assessment-form-grid">
          <SelectField label="Tipo" value={questionForm.question_type} options={assessmentQuestionTypeOptions} onChange={(value) => setQuestionForm({ ...questionForm, question_type: value as AssessmentQuestionType })} />
          <label className="field"><span>Manual de origem</span><input value={questionForm.manual_title} onChange={(event) => setQuestionForm({ ...questionForm, manual_title: event.target.value })} placeholder="Ex.: Manual DK — Nível 3" required /></label>
          <label className="field"><span>Capítulo ou tópico</span><input value={questionForm.source_chapter} onChange={(event) => setQuestionForm({ ...questionForm, source_chapter: event.target.value })} placeholder="Ex.: Capítulo 4" /></label>
          <label className="field"><span>Página</span><input value={questionForm.source_page} onChange={(event) => setQuestionForm({ ...questionForm, source_page: event.target.value })} placeholder="Ex.: 28" /></label>
          <SelectField label="Categoria" value={questionForm.scope_type} options={assessmentScopeOptions} onChange={(value) => setQuestionForm({ ...questionForm, scope_type: value as AssessmentScopeType, rank_scopes: value === "patente" ? ["terceiro_sargento"] : [], graduation_scopes: value === "graduacao" ? ["bronze"] : [] })} />
          <SelectField label="Área" value={questionForm.track} options={assessmentTrackOptions} onChange={(value) => setQuestionForm({ ...questionForm, track: value as AssessmentTrack })} />
          <SelectField label="Dificuldade" value={questionForm.difficulty} options={assessmentDifficultyOptions} onChange={(value) => setQuestionForm({ ...questionForm, difficulty: value as AssessmentDifficulty })} />
        </div>
        <fieldset className="assessment-checkbox-fieldset"><legend>{questionForm.scope_type === "patente" ? "Patentes relacionadas" : "Graduações relacionadas"}</legend>
          {questionForm.scope_type === "patente" ? rankGroups.map((group) => <div className="assessment-checkbox-group" key={group.category}><strong>{group.category}</strong><div>{group.ranks.map((rank) => <label key={rank.value}><input type="checkbox" checked={questionForm.rank_scopes.includes(rank.value)} onChange={() => setQuestionForm({ ...questionForm, rank_scopes: toggleValue(questionForm.rank_scopes, rank.value) })} /> {rank.label}</label>)}</div></div>) : <div className="assessment-checkbox-group"><div>{graduationOptions.filter((item) => item.value !== "sem_graduacao").map((level) => <label key={level.value}><input type="checkbox" checked={questionForm.graduation_scopes.includes(level.value)} onChange={() => setQuestionForm({ ...questionForm, graduation_scopes: toggleValue(questionForm.graduation_scopes, level.value) })} /> {level.label}</label>)}</div></div>}
        </fieldset>
        {questionForm.question_type === "objetiva" ? <fieldset className="assessment-options-editor"><legend>Alternativas — marque uma resposta correta</legend>{questionForm.options.map((option, index) => <label key={index} className={questionForm.correct_option === index ? "correct" : ""}><input type="radio" name="correct-option" checked={questionForm.correct_option === index} onChange={() => setQuestionForm({ ...questionForm, correct_option: index })} /><span>{String.fromCharCode(65 + index)}</span><input value={option} onChange={(event) => setQuestionForm({ ...questionForm, options: questionForm.options.map((current, optionIndex) => optionIndex === index ? event.target.value : current) })} placeholder={`Alternativa ${String.fromCharCode(65 + index)}`} required /></label>)}</fieldset> : <label className="field full"><span>Gabarito esperado</span><textarea rows={5} value={questionForm.expected_answer} onChange={(event) => setQuestionForm({ ...questionForm, expected_answer: event.target.value })} placeholder="Descreva os elementos que precisam aparecer na resposta." required /></label>}
        <label className="field full"><span>Explicação do gabarito (opcional)</span><textarea rows={3} value={questionForm.explanation} onChange={(event) => setQuestionForm({ ...questionForm, explanation: event.target.value })} placeholder="Justificativa para a correção" /></label>
        {editingQuestion && <label className="check-field"><input type="checkbox" checked={questionForm.active} onChange={(event) => setQuestionForm({ ...questionForm, active: event.target.checked })} /> Questão ativa e disponível para novas avaliações</label>}
        <button className="button button-primary" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" /> : editingQuestion ? <Check /> : <Plus />} {editingQuestion ? "Salvar" : "Cadastrar"}</button>
      </form>

      <div className="assessment-list-heading"><div><h3>Questões cadastradas</h3><p>{data.questions.filter((question) => question.active).length} ativas · {data.questions.filter((question) => !question.active).length} desativadas</p></div><label className="assessment-search"><Search /><input value={questionSearch} onChange={(event) => setQuestionSearch(event.target.value)} placeholder="Buscar enunciado ou manual" /></label></div>
      <div className="assessment-question-bank-list">{filteredQuestions.map((question) => <article className={!question.active ? "inactive" : ""} key={question.id}><header><span>{question.question_type === "objetiva" ? "Objetiva" : "Aberta"}</span><span>{assessmentTrackOptions.find((item) => item.value === question.track)?.label}</span><span>{assessmentDifficultyOptions.find((item) => item.value === question.difficulty)?.label}</span>{!question.active && <span>Desativada</span>}</header><h4>{question.prompt}</h4><p>{question.manual_title}{question.source_chapter ? ` · ${question.source_chapter}` : ""}{question.source_page ? ` · p. ${question.source_page}` : ""}</p><footer><div>{question.scope_type === "patente" ? question.rank_scopes.map((rank) => <small key={rank} title={rankLabels[rank]}>{rankShortLabels[rank]}</small>) : question.graduation_scopes.map((level) => <small key={level}>{graduationLabels[level]}</small>)}</div><div className="row-actions"><button type="button" onClick={() => editQuestion(question)} aria-label="Editar questão" title="Editar"><Pencil /></button>{question.active && <button type="button" onClick={() => void deactivateQuestion(question.id)} aria-label="Desativar questão" title="Desativar"><Archive /></button>}</div></footer></article>)}</div>
    </section>}

    {tab === "avaliacoes" && !creatingAssessment && <section className="assessment-admin-panel">
      <div className="assessment-list-heading is-first">
        <div><h3>Avaliações publicadas <span className="assessment-count-pill">{publishedAssessments.length}</span></h3></div>
        <button className="button button-primary" type="button" onClick={() => setCreatingAssessment(true)}><Plus /> Nova avaliação</button>
      </div>
      {publishedAssessments.length
        ? <div className="assessment-template-grid">{publishedAssessments.map((assessment) => <article key={assessment.id}><header>{assessment.selection_mode === "sorteio_individual" ? <Shuffle /> : <BookOpenCheck />}<span>{assessment.question_count} questões</span></header><h4>{assessment.title}</h4>{assessment.description && <p>{assessment.description}</p>}<dl><div><dt>Objetivo</dt><dd>{assessment.target_type === "patente" ? rankLabels[assessment.target_rank!] : graduationLabels[assessment.target_graduation!]}</dd></div><div><dt>Conteúdos</dt><dd>{assessment.content_type === "patente" ? assessment.content_rank_scopes.map((rank) => rankShortLabels[rank]).join(", ") : assessment.content_graduation_scopes.map((level) => graduationLabels[level]).join(", ")}</dd></div><div><dt>Montagem</dt><dd>{assessment.selection_mode === "sorteio_individual" ? "Sorteio individual" : "Questões fixas"}</dd></div><div><dt>Área</dt><dd>{assessmentTrackOptions.find((item) => item.value === assessment.track)?.label}</dd></div><div><dt>Aprovação</dt><dd>{Number(assessment.passing_score)}%</dd></div><div><dt>Tempo</dt><dd>{assessment.duration_minutes ? `${assessment.duration_minutes} min` : "Livre"}</dd></div></dl></article>)}</div>
        : <div className="empty-state"><BookOpenCheck /><h2>Nenhuma avaliação publicada</h2><button className="button button-primary" type="button" onClick={() => setCreatingAssessment(true)}><Plus /> Nova avaliação</button></div>}
    </section>}

    {creatingAssessment && <section className="assessment-admin-panel" hidden={tab !== "avaliacoes"}>
      <AssessmentCreateForm questions={data.questions} busy={busy} onPublish={createAssessment} onCancel={() => setCreatingAssessment(false)} />
    </section>}

    {tab === "indicacoes" && <section className="assessment-admin-panel">
      <form className="assessment-builder-form" onSubmit={createAssignments}>
        <header><div><h3>Criar nova indicação</h3></div></header>
        <div className="assessment-form-grid">
          <SelectField label="Avaliação" value={effectiveAssignmentAssessmentId} options={[{ value: "", label: "Selecione" }, ...publishedAssessments.map((assessment) => ({ value: assessment.id, label: assessment.title }))]} onChange={setAssignmentAssessmentId} />
          <label className="field"><span>Data limite (opcional)</span><input type="datetime-local" value={assignmentExpiresAt} onChange={(event) => setAssignmentExpiresAt(event.target.value)} /></label>
        </div>
        <fieldset className="assessment-member-selector"><legend>Integrantes indicados</legend><div>{data.members.map((member) => <label className={assignmentMemberIds.has(member.id) ? "selected" : ""} key={member.id}><input type="checkbox" checked={assignmentMemberIds.has(member.id)} onChange={() => setAssignmentMemberIds((current) => { const next = new Set(current); if (next.has(member.id)) next.delete(member.id); else next.add(member.id); return next; })} /><span><strong>{member.nickname}</strong><small>{member.full_name} · {rankShortLabels[member.rank]}</small></span></label>)}</div></fieldset>
        <button className="button button-primary" type="submit" disabled={busy || !effectiveAssignmentAssessmentId || !assignmentMemberIds.size}>{busy ? <LoaderCircle className="spin" /> : <Link2 />} Gerar {assignmentMemberIds.size || ""} link(s)</button>
      </form>
      <div className="assessment-list-heading"><div><h3>Indicações registradas</h3></div></div>
      <div className="table-wrap assessment-table"><table><thead><tr><th>Integrante</th><th>Avaliação</th><th>Indicação</th><th>Situação</th><th>Início / conclusão</th><th>Prazo</th><th>Ações</th></tr></thead><tbody>{data.assignments.map((assignment) => <tr key={assignment.id}><td><strong>{memberById.get(assignment.member_id)?.nickname ?? "Membro"}</strong><small>{rankShortLabels[memberById.get(assignment.member_id)?.rank ?? "recruta"]}</small></td><td>{assessmentById.get(assignment.assessment_id)?.title ?? "Avaliação"}</td><td>nº {assignment.indication_number}</td><td><span className={`assessment-status status-${assignment.status}`}>{assessmentAssignmentStatusLabels[assignment.status]}</span></td><td><small>{assignment.started_at ? `Início: ${formatDate(assignment.started_at)}` : "Ainda não iniciou"}</small><small>{assignment.submitted_at ? `Fim: ${formatDate(assignment.submitted_at)}` : "Ainda não concluiu"}</small></td><td>{formatDate(assignment.expires_at)}</td><td className="row-actions"><button type="button" onClick={() => void copyAssignmentLink(assignment)} aria-label="Copiar link" title="Copiar link"><Copy /></button><button type="button" onClick={() => shareAssignment(assignment)} aria-label="Compartilhar no WhatsApp" title="WhatsApp"><MessageCircle /></button>{assignment.status === "convidado" && <button type="button" onClick={() => void changeAssignment(assignment, "cancel")} aria-label="Cancelar indicação" title="Cancelar indicação"><X /></button>}{assignment.status === "em_andamento" && <button type="button" onClick={() => void changeAssignment(assignment, "close")} aria-label="Encerrar avaliação e calcular resultado" title="Encerrar e calcular"><Square /></button>}{data.actor.canDelegate && assignment.status !== "convidado" && assignment.status !== "em_andamento" && <button type="button" onClick={() => void changeAssignment(assignment, "reset")} aria-label="Liberar nova tentativa excepcional" title="Liberar nova tentativa"><RotateCcw /></button>}</td></tr>)}</tbody></table></div>
    </section>}

    {tab === "correcoes" && <section className="assessment-admin-panel">
      <div className="assessment-list-heading"><div><h3>Respostas abertas pendentes</h3></div></div>
      {data.reviews.length ? <div className="assessment-review-list">{data.reviews.map((review) => { const key = `${review.assignment_id}:${review.item_id}`; const member = memberById.get(review.assignment.member_id); const assessment = assessmentById.get(review.assignment.assessment_id); return <article key={key}><header><div><span>{member?.nickname ?? "Integrante"}</span><small>{assessment?.title ?? "Avaliação"} · indicação nº {review.assignment.indication_number}</small></div><span>{review.item.source_manual_title}</span></header><h4>{review.item.prompt}</h4><div className="assessment-review-comparison"><section><strong>Resposta do integrante</strong><p>{review.open_answer}</p></section><section><strong>Gabarito esperado</strong><p>{review.item.expected_answer}</p></section></div><label className="field"><span>Comentário para registro (opcional)</span><textarea rows={3} value={reviewFeedback[key] ?? ""} onChange={(event) => setReviewFeedback((current) => ({ ...current, [key]: event.target.value }))} /></label><footer><button className="button button-ghost" type="button" onClick={() => void reviewAnswer(review, false)} disabled={busy}><X /> Incorreta</button><button className="button button-primary" type="button" onClick={() => void reviewAnswer(review, true)} disabled={busy}><Check /> Correta</button></footer></article>; })}</div> : <div className="empty-state"><Check /><h2>Nenhuma correção pendente</h2><p>As respostas abertas entregues aparecerão aqui.</p></div>}
    </section>}

    {tab === "resultados" && <section className="assessment-admin-panel">
      <div className="assessment-list-heading"><div><h3>Histórico de resultados</h3></div></div>
      <div className="table-wrap assessment-table"><table><thead><tr><th>Integrante</th><th>Avaliação</th><th>Indicação</th><th>Acertos</th><th>Erros</th><th>Resultado</th><th>Conclusão</th></tr></thead><tbody>{data.assignments.filter((assignment) => assignment.status === "corrigido" || assignment.status === "aguardando_correcao").map((assignment) => <tr key={assignment.id}><td><strong>{memberById.get(assignment.member_id)?.nickname ?? "Membro"}</strong><small>{rankShortLabels[memberById.get(assignment.member_id)?.rank ?? "recruta"]}</small></td><td>{assessmentById.get(assignment.assessment_id)?.title ?? "Avaliação"}</td><td>nº {assignment.indication_number}</td><td>{assignment.correct_count ?? "—"}</td><td>{assignment.incorrect_count ?? "—"}</td><td>{assignment.status === "aguardando_correcao" ? <span className="assessment-status status-aguardando_correcao">Aguardando correção</span> : <><strong>{Number(assignment.score_percent ?? 0).toFixed(1)}%</strong><small>{assignment.passed ? "Aprovado" : "Não aprovado"}</small></>}</td><td>{formatDate(assignment.graded_at ?? assignment.submitted_at)}</td></tr>)}</tbody></table></div>
    </section>}

    {tab === "permissoes" && data.actor.canDelegate && <section className="assessment-admin-panel">
      <div className="assessment-list-heading"><div><h3>Gestores de Avaliações</h3><p>Generais possuem acesso automático. A delegação abaixo é exclusiva para Oficiais Superiores.</p></div></div>
      {seniorOfficers.length ? <div className="assessment-permission-list">{seniorOfficers.map((member) => { const permission = permissionByUser.get(member.id); const active = Boolean(permission?.active); return <article key={member.id}><div className="assessment-permission-avatar">{member.nickname.slice(0, 2).toUpperCase()}</div><div><strong>{member.nickname}</strong><span>{member.full_name} · {rankShortLabels[member.rank]}</span></div><button className={`assessment-permission-toggle ${active ? "active" : ""}`} type="button" onClick={() => void togglePermission(member.id, !active)} disabled={busy} aria-pressed={active}><span>{active ? "Autorizado" : "Sem acesso"}</span><i /></button></article>; })}</div> : <div className="empty-state"><ShieldCheck /><h2>Nenhum Oficial Superior disponível</h2><p>Majores, Tenentes-Coronéis e Coronéis aprovados aparecerão aqui.</p></div>}
    </section>}
    {resetDialog && <AdminDialog
      size="sm"
      title="Liberar nova tentativa?"
      description="Exceção: apaga as respostas e o resultado desta tentativa."
      onClose={() => setResetDialog(null)}
      onSubmit={(event) => {
        event.preventDefault();
        const reason = resetDialog.reason.trim();
        if (reason.length < 10) return toast.error("A justificativa precisa ter pelo menos 10 caracteres.");
        const { assignment } = resetDialog;
        setResetDialog(null);
        void applyAssignmentChange(assignment, "reset", reason);
      }}
      footer={<><button className="button button-ghost" type="button" onClick={() => setResetDialog(null)}>Cancelar</button><button className="button button-danger" type="submit">Liberar tentativa</button></>}
    >
      <div className="field">
        <label htmlFor="reset-reason">Motivo técnico ou administrativo</label>
        <textarea id="reset-reason" rows={3} value={resetDialog.reason} onChange={(event) => setResetDialog({ ...resetDialog, reason: event.target.value })} minLength={10} required />
        <p className="field-hint">Fica registrado no histórico. Mínimo de 10 caracteres.</p>
      </div>
    </AdminDialog>}
  </div>;
}

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: Array<{ value: string; label: string; group?: string }>; onChange: (value: string) => void }) {
  const id = useId();
  return <div className="field"><label htmlFor={id}>{label}</label><Select id={id} value={value} options={options} onChange={onChange} /></div>;
}

function AssessmentTab({ label, icon, active, onClick, count, alert = false }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void; count?: number; alert?: boolean }) {
  return <button type="button" role="tab" aria-selected={active} tabIndex={active ? 0 : -1} className={active ? "active" : ""} onClick={onClick}>{icon}<span>{label}</span>{count !== undefined && <small className={alert && count > 0 ? "is-alert" : undefined}>{count}</small>}</button>;
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return <div className="kpi"><span className="kpi-label"><span aria-hidden="true">{icon}</span>{label}</span><strong>{value}</strong></div>;
}
