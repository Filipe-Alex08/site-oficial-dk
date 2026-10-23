"use client";

import Link from "next/link";
import { AlertTriangle, Bookmark, Check, ChevronLeft, ChevronRight, Clock3, LoaderCircle, LockKeyhole, Send, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { assessmentAssignmentStatusLabels, assessmentTrackOptions } from "@/lib/assessments";
import { graduationLabels, rankLabels } from "@/lib/member-access";
import type { AssessmentAssignmentStatus, AssessmentQuestionType, AssessmentScopeType, AssessmentTrack, DkRank, GraduationLevel } from "@/lib/types";

type SafeQuestion = {
  id: string;
  sort_order: number;
  prompt: string;
  question_type: AssessmentQuestionType;
  options: string[];
  source_manual_title: string;
  source_chapter?: string | null;
  source_page?: string | null;
};

type SavedAnswer = { item_id: string; selected_option?: number | null; open_answer?: string | null };
type AssessmentPayload = {
  assessment: {
    id: string;
    title: string;
    description?: string | null;
    target_type: AssessmentScopeType;
    target_rank?: DkRank | null;
    target_graduation?: GraduationLevel | null;
    content_type: AssessmentScopeType;
    content_rank_scopes: DkRank[];
    content_graduation_scopes: GraduationLevel[];
    track: AssessmentTrack;
    question_count: number;
    passing_score: number;
    duration_minutes?: number | null;
  };
  assignment: {
    id: string;
    indication_number: number;
    status: AssessmentAssignmentStatus;
    expires_at?: string | null;
    started_at?: string | null;
    submitted_at?: string | null;
    graded_at?: string | null;
    score_percent?: number | null;
    correct_count?: number | null;
    incorrect_count?: number | null;
    pending_open_count: number;
    passed?: boolean | null;
  };
  deadline_at?: string | null;
  questions?: SafeQuestion[];
  answers?: SavedAnswer[];
  member: { nickname: string };
};

function formatRemaining(milliseconds: number) {
  const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
}

export default function AssessmentRunner({ token }: { token: string }) {
  const assessmentQuery = useQuery({
    queryKey: ["assessment-attempt", token],
    queryFn: async () => {
      const response = await fetch(`/api/assessments/${token}`, { cache: "no-store" });
      const result = await response.json() as AssessmentPayload & { error?: string };
      if (!response.ok) throw new Error(result.error || "Não foi possível abrir a avaliação.");
      return result;
    },
  });

  if (assessmentQuery.isPending) return <div className="assessment-loading"><LoaderCircle className="spin" /><p>Carregando sua indicação…</p></div>;
  if (!assessmentQuery.data) return <div className="empty-state"><AlertTriangle /><h2>Avaliação indisponível</h2><p>{assessmentQuery.error instanceof Error ? assessmentQuery.error.message : "Este link não pertence ao usuário conectado."}</p></div>;
  return <AssessmentRunnerLoaded token={token} initialPayload={assessmentQuery.data} />;
}

function AssessmentRunnerLoaded({ token, initialPayload }: { token: string; initialPayload: AssessmentPayload }) {
  const [payload, setPayload] = useState(initialPayload);
  const [answers, setAnswers] = useState<Record<string, SavedAnswer>>(() => Object.fromEntries((initialPayload.answers ?? []).map((answer) => [answer.item_id, answer])));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [marked, setMarked] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState<number | null>(null);
  const autoSubmitted = useRef(false);
  const pendingSaves = useRef(0);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  const applyPayload = useCallback((next: AssessmentPayload) => {
    setPayload(next);
    const mapped: Record<string, SavedAnswer> = {};
    next.answers?.forEach((answer) => { mapped[answer.item_id] = answer; });
    setAnswers(mapped);
  }, []);

  useEffect(() => {
    if (!payload?.deadline_at || payload.assignment.status !== "em_andamento") return;
    const timeout = window.setTimeout(() => setNow(Date.now()), 0);
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => { window.clearTimeout(timeout); window.clearInterval(interval); };
  }, [payload?.deadline_at, payload?.assignment.status]);

  const questions = useMemo(() => payload.questions ?? [], [payload.questions]);
  const current = questions[currentIndex];
  const remaining = payload.deadline_at && now !== null ? new Date(payload.deadline_at).getTime() - now : null;
  const answeredCount = useMemo(() => questions.filter((question) => {
    const answer = answers[question.id];
    return question.question_type === "objetiva" ? Number.isInteger(answer?.selected_option) : Boolean(answer?.open_answer?.trim());
  }).length, [questions, answers]);

  const requestAction = useCallback(async (action: "start" | "submit") => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/assessments/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível concluir a ação.");
      applyPayload(result);
      setCurrentIndex(0);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível concluir a ação.");
    } finally {
      setBusy(false);
    }
  }, [token, applyPayload]);

  const saveAnswer = useCallback(async (question: SafeQuestion, value: SavedAnswer) => {
    setAnswers((currentAnswers) => ({ ...currentAnswers, [question.id]: { ...value, item_id: question.id } }));
    pendingSaves.current += 1;
    setSaving(true);
    setError("");
    const queuedSave = saveQueue.current.then(async () => {
      const response = await fetch(`/api/assessments/${token}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ item_id: question.id, selected_option: value.selected_option, open_answer: value.open_answer }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar a resposta.");
    });
    saveQueue.current = queuedSave.catch(() => undefined);
    try {
      await queuedSave;
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar a resposta.");
    } finally {
      pendingSaves.current -= 1;
      if (pendingSaves.current === 0) setSaving(false);
    }
  }, [token]);

  const saveCurrentOpen = useCallback(async () => {
    if (!current || current.question_type !== "aberta") return;
    await saveAnswer(current, answers[current.id] ?? { item_id: current.id, open_answer: "" });
  }, [current, answers, saveAnswer]);

  useEffect(() => {
    if (remaining === null || remaining > 0 || autoSubmitted.current || payload.assignment.status !== "em_andamento") return;
    autoSubmitted.current = true;
    void (async () => {
      await saveCurrentOpen();
      await saveQueue.current;
      await requestAction("submit");
    })();
  }, [remaining, payload.assignment.status, requestAction, saveCurrentOpen]);

  async function navigate(nextIndex: number) {
    await saveCurrentOpen();
    setCurrentIndex(Math.min(Math.max(nextIndex, 0), questions.length - 1));
  }

  async function submit() {
    await saveCurrentOpen();
    await saveQueue.current;
    if (!window.confirm(`Entregar a avaliação agora? Você respondeu ${answeredCount} de ${questions.length} questões e não poderá alterar as respostas depois.`)) return;
    await requestAction("submit");
  }

  const target = payload.assessment.target_type === "patente"
    ? rankLabels[payload.assessment.target_rank!]
    : graduationLabels[payload.assessment.target_graduation!];
  const content = payload.assessment.content_type === "patente"
    ? payload.assessment.content_rank_scopes.map((rank) => rankLabels[rank]).join(", ")
    : payload.assessment.content_graduation_scopes.map((level) => graduationLabels[level]).join(", ");
  const track = assessmentTrackOptions.find((item) => item.value === payload.assessment.track)?.label ?? payload.assessment.track;

  if (payload.assignment.status === "convidado") return <article className="assessment-intro-card">
    <span className="assessment-intro-icon"><ShieldCheck /></span>
    <p className="eyebrow">Indicação nº {payload.assignment.indication_number}</p>
    <h2>{payload.assessment.title}</h2>
    <p>{payload.assessment.description || `Avaliação de indicação para ${target}.`}</p>
    <div className="assessment-intro-facts">
      <span><strong>{payload.assessment.question_count}</strong> questões</span>
      <span><strong>{payload.assessment.duration_minutes ? `${payload.assessment.duration_minutes} min` : "Livre"}</strong> duração</span>
      <span><strong>{payload.assessment.passing_score}%</strong> aprovação</span>
      <span><strong>{track}</strong> área</span>
      <span><strong>{content}</strong> conteúdos</span>
    </div>
    <div className="assessment-warning"><LockKeyhole /><p><strong>Tentativa única.</strong> Depois de iniciar, esta indicação ficará vinculada ao seu perfil. Se fechar a página, você poderá continuar a mesma tentativa enquanto houver prazo.</p></div>
    {error && <p className="assessment-error">{error}</p>}
    <button className="button button-primary assessment-start" type="button" onClick={() => requestAction("start")} disabled={busy}>{busy ? <LoaderCircle className="spin" /> : <ClipboardIcon />} Iniciar avaliação</button>
  </article>;

  if (payload.assignment.status !== "em_andamento") return <article className={`assessment-result-card ${payload.assignment.passed ? "passed" : payload.assignment.status === "corrigido" ? "failed" : "pending"}`}>
    <span className="assessment-intro-icon">{payload.assignment.status === "aguardando_correcao" ? <Clock3 /> : <ShieldCheck />}</span>
    <p className="eyebrow">{assessmentAssignmentStatusLabels[payload.assignment.status]}</p>
    <h2>{payload.assessment.title}</h2>
    {payload.assignment.status === "aguardando_correcao" ? <p>Suas respostas foram entregues. O resultado final será registrado após a correção de {payload.assignment.pending_open_count} questão(ões) aberta(s).</p> : payload.assignment.status === "corrigido" ? <>
      <strong className="assessment-final-score">{Number(payload.assignment.score_percent ?? 0).toFixed(1)}%</strong>
      <p>{payload.assignment.correct_count ?? 0} acertos · {payload.assignment.incorrect_count ?? 0} erros</p>
      <span className="assessment-decision">{payload.assignment.passed ? "Resultado aprovado" : "Resultado abaixo do percentual de aprovação"}</span>
    </> : <p>Esta indicação está {assessmentAssignmentStatusLabels[payload.assignment.status].toLocaleLowerCase("pt-BR")} e não pode ser respondida.</p>}
    <Link className="button button-primary" href="/membro/simulados">Voltar ao histórico</Link>
  </article>;

  return <div className="assessment-exam-shell">
    <header className="assessment-exam-header">
      <div><p className="eyebrow">{target} · {track}</p><h2>{payload.assessment.title}</h2><span>{answeredCount} de {questions.length} respondidas</span></div>
      <div className={`assessment-timer ${remaining !== null && remaining < 5 * 60_000 ? "urgent" : ""}`}><Clock3 /><div><small>Tempo restante</small><strong>{payload.deadline_at ? remaining === null ? "Calculando…" : formatRemaining(remaining) : "Sem limite"}</strong></div></div>
    </header>
    <div className="assessment-progress"><span style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }} /></div>
    <div className="assessment-exam-layout">
      <aside className="assessment-question-map" aria-label="Navegação das questões">
        {questions.map((question, index) => {
          const answer = answers[question.id];
          const answered = question.question_type === "objetiva" ? Number.isInteger(answer?.selected_option) : Boolean(answer?.open_answer?.trim());
          return <button key={question.id} type="button" className={`${index === currentIndex ? "current" : ""} ${answered ? "answered" : ""} ${marked.has(question.id) ? "marked" : ""}`} onClick={() => void navigate(index)} aria-label={`Questão ${index + 1}`}><span>{index + 1}</span>{marked.has(question.id) && <Bookmark />}</button>;
        })}
      </aside>
      {current && <article className="assessment-question-card">
        <header><div><span>Questão {currentIndex + 1} de {questions.length}</span><strong>{current.question_type === "objetiva" ? "Escolha uma alternativa" : "Resposta aberta"}</strong></div><button type="button" className={marked.has(current.id) ? "active" : ""} onClick={() => setMarked((currentMarked) => { const next = new Set(currentMarked); if (next.has(current.id)) next.delete(current.id); else next.add(current.id); return next; })}><Bookmark /> {marked.has(current.id) ? "Marcada" : "Revisar depois"}</button></header>
        <h3>{current.prompt}</h3>
        {current.question_type === "objetiva" ? <div className="assessment-options">
          {current.options.map((option, index) => <label className={answers[current.id]?.selected_option === index ? "selected" : ""} key={`${current.id}-${index}`}><input type="radio" name={`question-${current.id}`} checked={answers[current.id]?.selected_option === index} onChange={() => void saveAnswer(current, { item_id: current.id, selected_option: index })} /><span className="assessment-option-letter">{String.fromCharCode(65 + index)}</span><span>{option}</span>{answers[current.id]?.selected_option === index && <Check />}</label>)}
        </div> : <textarea className="assessment-open-answer" rows={10} value={answers[current.id]?.open_answer ?? ""} onChange={(event) => setAnswers((currentAnswers) => ({ ...currentAnswers, [current.id]: { item_id: current.id, open_answer: event.target.value } }))} onBlur={() => void saveCurrentOpen()} placeholder="Escreva sua resposta com clareza…" maxLength={10000} />}
        <footer><span>Fonte: {current.source_manual_title}{current.source_chapter ? ` · ${current.source_chapter}` : ""}{current.source_page ? ` · p. ${current.source_page}` : ""}</span><span className={saving ? "saving" : "saved"}>{saving ? <><LoaderCircle className="spin" /> Salvando…</> : <><Check /> Respostas salvas</>}</span></footer>
      </article>}
    </div>
    {error && <p className="assessment-error">{error}</p>}
    <nav className="assessment-exam-actions">
      <button className="button button-ghost" type="button" onClick={() => void navigate(currentIndex - 1)} disabled={currentIndex === 0 || busy}><ChevronLeft /> Anterior</button>
      {currentIndex < questions.length - 1
        ? <button className="button button-primary" type="button" onClick={() => void navigate(currentIndex + 1)} disabled={busy}>Próxima <ChevronRight /></button>
        : <button className="button button-primary" type="button" onClick={() => void submit()} disabled={busy || saving}>{busy ? <LoaderCircle className="spin" /> : <Send />} Entregar avaliação</button>}
    </nav>
  </div>;
}

function ClipboardIcon() {
  return <ShieldCheck />;
}
