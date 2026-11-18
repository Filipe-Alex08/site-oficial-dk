import type { Metadata } from "next";
import Link from "next/link";
import { Award, CheckCircle2, ClipboardCheck, Clock3, LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import { assessmentAssignmentStatusLabels, assessmentTrackOptions } from "@/lib/assessments";
import { graduationLabels, rankLabels } from "@/lib/member-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAuth, getMember } from "@/lib/viewer";
import type { Assessment, AssessmentAssignment } from "@/lib/types";
import { GraduationInsignia, RankInsignia } from "@/components/member/Insignia";
import AppPageHeader from "@/components/member/AppPageHeader";
import Unavailable from "@/components/member/Unavailable";
import LiveRefresh from "@/components/LiveRefresh";

export const metadata: Metadata = { title: "Avaliações e simulados" };

function formatDate(value?: string | null) {
  return value ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" }).format(new Date(value)) : "Sem prazo";
}

export default async function MemberAssessmentsPage() {
  const { supabase, user } = await getAuth();
  if (!supabase) return <Unavailable />;
  if (!user) redirect("/area-do-membro/login");
  const admin = createAdminClient();
  if (!admin) return <Unavailable />;

  // As atribuições são filtradas por user.id, então não precisam esperar o perfil.
  // Só são usadas depois da checagem de aprovação abaixo.
  const [{ profile }, { data: assignmentData }] = await Promise.all([
    getMember(),
    admin.from("assessment_assignments").select("*").eq("member_id", user.id).order("created_at", { ascending: false }),
  ]);
  if (!profile || profile.status !== "aprovado") redirect("/area-do-membro/login");
  const assignments = (assignmentData ?? []) as AssessmentAssignment[];
  const assessmentIds = [...new Set(assignments.map((assignment) => assignment.assessment_id))];
  const { data: assessmentData } = assessmentIds.length
    ? await admin.from("assessments").select("*").in("id", assessmentIds)
    : { data: [] };
  const assessments = new Map(((assessmentData ?? []) as Assessment[]).map((assessment) => [assessment.id, assessment]));

  // O que depende do membro vem primeiro.
  const todo = assignments.filter((assignment) => assignment.status === "convidado" || assignment.status === "em_andamento");
  const reviewing = assignments.filter((assignment) => assignment.status === "aguardando_correcao");
  const groups = [
    { title: "Para fazer", items: todo },
    { title: "Em correção", items: reviewing },
    { title: "Concluídas e encerradas", items: assignments.filter((assignment) => !todo.includes(assignment) && !reviewing.includes(assignment)) },
  ].filter((group) => group.items.length);

  return (
    <>
      <LiveRefresh tables={["assessment_assignments"]} />
      <AppPageHeader title="Avaliações" crumbs={[{ label: "Painel", href: "/membro" }]} />
      <section className="section assessment-list-section">
        <div className="container">
          {assignments.length ? groups.map((group) => <section className="m-assessment-group" key={group.title} aria-label={group.title}>
            <h2 className="m-group-title">{group.title}<span className="count-pill">{group.items.length}</span></h2>
            <div className="assessment-assignment-grid">
            {group.items.map((assignment) => {
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
                {assessment.description && <p>{assessment.description}</p>}
                <dl>
                  <div><dt>Objetivo</dt><dd>{assessment.target_type === "patente" && assessment.target_rank
                    ? <RankInsignia rank={assessment.target_rank} />
                    : assessment.target_graduation
                      ? <GraduationInsignia level={assessment.target_graduation} track={assessment.track === "geral" ? undefined : assessment.track} />
                      : target}</dd></div>
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
                  : <span className="assessment-locked"><LockKeyhole size={16} /> Indisponível</span>}
              </article>;
            })}
            </div>
          </section>) : <div className="empty-state"><ClipboardCheck /><h2>Nenhuma avaliação para você</h2><p>Quando um administrador indicar uma avaliação, ela aparece aqui.</p></div>}
        </div>
      </section>
    </>
  );
}
