import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Award, CheckCircle2, ClipboardCheck, Clock3, LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { assessmentAssignmentStatusLabels, assessmentTrackOptions } from "@/lib/assessments";
import { graduationLabels, rankLabels } from "@/lib/member-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Assessment, AssessmentAssignment, MemberProfile } from "@/lib/types";

export const metadata: Metadata = { title: "Avaliações e simulados" };

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value)) : "Sem prazo";
}

export default async function MemberAssessmentsPage() {
  const supabase = await createClient();
  if (!supabase) return <section className="section"><div className="container info-band"><strong>Banco ainda não conectado</strong><p>Configure o Supabase para ativar as avaliações internas.</p></div></section>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/area-do-membro/login");
  const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const profile = profileData as MemberProfile | null;
  if (!profile || profile.status !== "aprovado") redirect("/area-do-membro/login");

  const admin = createAdminClient();
  if (!admin) return <section className="section"><div className="container info-band"><strong>Servidor ainda não configurado</strong><p>Inclua a chave secreta do Supabase para ativar as avaliações.</p></div></section>;
  const { data: assignmentData } = await admin.from("assessment_assignments").select("*").eq("member_id", user.id).order("created_at", { ascending: false });
  const assignments = (assignmentData ?? []) as AssessmentAssignment[];
  const assessmentIds = [...new Set(assignments.map((assignment) => assignment.assessment_id))];
  const { data: assessmentData } = assessmentIds.length
    ? await admin.from("assessments").select("*").in("id", assessmentIds)
    : { data: [] };
  const assessments = new Map(((assessmentData ?? []) as Assessment[]).map((assessment) => [assessment.id, assessment]));

  return (
    <>
      <section className="member-heading">
        <div className="container member-heading-inner">
          <div><p className="eyebrow">Formação interna</p><h1>Avaliações e simulados</h1><p>Acompanhe suas indicações, tentativas e resultados registrados no DK.</p></div>
          <Link className="button button-ghost" href="/membro"><ArrowLeft size={18} /> Voltar</Link>
        </div>
      </section>
      <section className="section assessment-list-section">
        <div className="container">
          {assignments.length ? <div className="assessment-assignment-grid">
            {assignments.map((assignment) => {
              const assessment = assessments.get(assignment.assessment_id);
              if (!assessment) return null;
              const target = assessment.target_type === "patente"
                ? rankLabels[assessment.target_rank!]
                : graduationLabels[assessment.target_graduation!];
              const track = assessmentTrackOptions.find((item) => item.value === assessment.track)?.label ?? assessment.track;
              const canOpen = assignment.status === "convidado" || assignment.status === "em_andamento" || assignment.status === "aguardando_correcao" || assignment.status === "corrigido";
              return <article className={`assessment-assignment-card status-${assignment.status}`} key={assignment.id}>
                <header>
                  <span className="assessment-card-icon"><ClipboardCheck /></span>
                  <span className={`assessment-status status-${assignment.status}`}>{assessmentAssignmentStatusLabels[assignment.status]}</span>
                </header>
                <h2>{assessment.title}</h2>
                <p>{assessment.description || `Avaliação de indicação para ${target}.`}</p>
                <dl>
                  <div><dt>Objetivo</dt><dd>{target}</dd></div>
                  <div><dt>Área</dt><dd>{track}</dd></div>
                  <div><dt>Questões</dt><dd>{assessment.question_count}</dd></div>
                  <div><dt>Indicação</dt><dd>nº {assignment.indication_number}</dd></div>
                  <div><dt>Prazo</dt><dd>{formatDate(assignment.expires_at)}</dd></div>
                  <div><dt>Aprovação</dt><dd>{Number(assessment.passing_score)}%</dd></div>
                </dl>
                {assignment.status === "corrigido" && <div className={`assessment-result-strip ${assignment.passed ? "passed" : "failed"}`}>
                  {assignment.passed ? <Award /> : <CheckCircle2 />}
                  <div><strong>{Number(assignment.score_percent ?? 0).toFixed(1)}%</strong><span>{assignment.correct_count ?? 0} acertos · {assignment.incorrect_count ?? 0} erros</span></div>
                </div>}
                {assignment.status === "aguardando_correcao" && <div className="assessment-result-strip pending"><Clock3 /><div><strong>Correção pendente</strong><span>{assignment.pending_open_count} resposta(s) aberta(s)</span></div></div>}
                {canOpen
                  ? <Link className="button button-primary" href={`/membro/simulados/${assignment.access_token}`}>{assignment.status === "convidado" ? "Abrir indicação" : assignment.status === "em_andamento" ? "Continuar avaliação" : "Consultar resultado"}</Link>
                  : <span className="assessment-locked"><LockKeyhole size={16} /> Esta indicação não está disponível</span>}
              </article>;
            })}
          </div> : <div className="empty-state"><ClipboardCheck /><h2>Nenhuma indicação disponível</h2><p>Quando um responsável indicar você para uma avaliação, ela aparecerá aqui.</p></div>}
        </div>
      </section>
    </>
  );
}
