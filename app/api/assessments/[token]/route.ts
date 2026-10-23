import { NextResponse } from "next/server";
import { getApprovedAssessmentActor } from "@/lib/assessment-server";
import { submitAssessmentAttempt } from "@/lib/assessment-scoring";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type CandidateContext = {
  actor: NonNullable<Awaited<ReturnType<typeof getApprovedAssessmentActor>>>;
  assignment: Record<string, any>;
  assessment: Record<string, any>;
};

async function getContext(token: string): Promise<CandidateContext | null> {
  const actor = await getApprovedAssessmentActor();
  if (!actor || !uuid.test(token)) return null;
  const { data: assignment } = await actor.admin
    .from("assessment_assignments")
    .select("*")
    .eq("access_token", token)
    .eq("member_id", actor.user.id)
    .maybeSingle();
  if (!assignment) return null;
  const { data: assessment } = await actor.admin.from("assessments").select("*").eq("id", assignment.assessment_id).maybeSingle();
  if (!assessment) return null;
  return { actor, assignment, assessment };
}

function getDeadline(assignment: Record<string, any>, assessment: Record<string, any>) {
  const limits: number[] = [];
  if (assignment.expires_at) limits.push(new Date(assignment.expires_at).getTime());
  if (assignment.started_at && assessment.duration_minutes) {
    limits.push(new Date(assignment.started_at).getTime() + Number(assessment.duration_minutes) * 60_000);
  }
  return limits.length ? new Date(Math.min(...limits)).toISOString() : null;
}

async function expireOrSubmitIfNeeded(context: CandidateContext) {
  const deadline = getDeadline(context.assignment, context.assessment);
  if (!deadline || new Date(deadline).getTime() > Date.now()) return context;
  if (context.assignment.status === "convidado") {
    await context.actor.admin.from("assessment_assignments").update({ status: "expirado" }).eq("id", context.assignment.id).eq("status", "convidado");
  } else if (context.assignment.status === "em_andamento") {
    await submitAssessmentAttempt(context.actor.admin, context.assignment.id);
  }
  const { data } = await context.actor.admin.from("assessment_assignments").select("*").eq("id", context.assignment.id).single();
  return { ...context, assignment: data };
}

async function candidatePayload(initialContext: CandidateContext) {
  const context = await expireOrSubmitIfNeeded(initialContext);
  const { assignment, assessment, actor } = context;
  const payload: Record<string, unknown> = {
    assessment: {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      target_type: assessment.target_type,
      target_rank: assessment.target_rank,
      target_graduation: assessment.target_graduation,
      content_type: assessment.content_type,
      content_rank_scopes: assessment.content_rank_scopes,
      content_graduation_scopes: assessment.content_graduation_scopes,
      track: assessment.track,
      question_count: assessment.question_count,
      passing_score: Number(assessment.passing_score),
      duration_minutes: assessment.duration_minutes,
    },
    assignment: {
      id: assignment.id,
      indication_number: assignment.indication_number,
      status: assignment.status,
      expires_at: assignment.expires_at,
      started_at: assignment.started_at,
      submitted_at: assignment.submitted_at,
      graded_at: assignment.graded_at,
      score_percent: assignment.score_percent === null ? null : Number(assignment.score_percent),
      correct_count: assignment.correct_count,
      incorrect_count: assignment.incorrect_count,
      pending_open_count: assignment.pending_open_count,
      passed: assignment.passed,
    },
    deadline_at: getDeadline(assignment, assessment),
    member: { nickname: actor.profile.nickname },
  };

  if (assignment.status === "em_andamento") {
    const [{ data: items }, { data: answers }] = await Promise.all([
      actor.admin.from("assessment_items").select("id,sort_order,prompt,question_type,options,source_manual_title,source_chapter,source_page").eq("assessment_id", assessment.id).order("sort_order"),
      actor.admin.from("assessment_answers").select("item_id,selected_option,open_answer").eq("assignment_id", assignment.id),
    ]);
    payload.questions = (items ?? []).map((item) => ({ ...item, options: item.question_type === "objetiva" ? item.options : [] }));
    payload.answers = answers ?? [];
  }
  return payload;
}

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const context = await getContext(token);
  if (!context) return NextResponse.json({ error: "Indicação não encontrada para este usuário." }, { status: 404 });
  return NextResponse.json(await candidatePayload(context), { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const context = await getContext(token);
  if (!context) return NextResponse.json({ error: "Indicação não encontrada para este usuário." }, { status: 404 });
  const body = await request.json().catch(() => ({})) as Record<string, unknown>;

  if (body.action === "start") {
    const checked = await expireOrSubmitIfNeeded(context);
    if (checked.assignment.status === "em_andamento") return NextResponse.json(await candidatePayload(checked));
    if (checked.assignment.status !== "convidado") return NextResponse.json({ error: "Esta tentativa não pode mais ser iniciada." }, { status: 409 });
    const startedAt = new Date().toISOString();
    const { data, error } = await checked.actor.admin
      .from("assessment_assignments")
      .update({ status: "em_andamento", started_at: startedAt })
      .eq("id", checked.assignment.id)
      .eq("status", "convidado")
      .select("*")
      .maybeSingle();
    if (error || !data) return NextResponse.json({ error: "Não foi possível iniciar a avaliação." }, { status: 409 });
    await checked.actor.admin.from("assessment_audit_log").insert({
      action: "avaliacao_iniciada",
      actor_id: checked.actor.user.id,
      subject_user_id: checked.actor.user.id,
      assessment_id: checked.assessment.id,
      assignment_id: data.id,
    });
    return NextResponse.json(await candidatePayload({ ...checked, assignment: data }));
  }

  if (body.action === "submit") {
    const checked = await expireOrSubmitIfNeeded(context);
    if (["aguardando_correcao", "corrigido"].includes(checked.assignment.status)) return NextResponse.json(await candidatePayload(checked));
    if (checked.assignment.status !== "em_andamento") return NextResponse.json({ error: "Esta avaliação não está em andamento." }, { status: 409 });
    try {
      await submitAssessmentAttempt(checked.actor.admin, checked.assignment.id);
      const { data } = await checked.actor.admin.from("assessment_assignments").select("*").eq("id", checked.assignment.id).single();
      await checked.actor.admin.from("assessment_audit_log").insert({
        action: "avaliacao_entregue",
        actor_id: checked.actor.user.id,
        subject_user_id: checked.actor.user.id,
        assessment_id: checked.assessment.id,
        assignment_id: checked.assignment.id,
      });
      return NextResponse.json(await candidatePayload({ ...checked, assignment: data }));
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error ? error.message : "Não foi possível entregar a avaliação." }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const context = await getContext(token);
  if (!context) return NextResponse.json({ error: "Indicação não encontrada para este usuário." }, { status: 404 });
  const checked = await expireOrSubmitIfNeeded(context);
  if (checked.assignment.status !== "em_andamento") return NextResponse.json({ error: "A tentativa já foi encerrada." }, { status: 409 });
  if (checked.assignment.submitted_at) return NextResponse.json({ error: "A tentativa já foi entregue e está sendo processada." }, { status: 409 });

  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const itemId = String(body?.item_id ?? "");
  if (!uuid.test(itemId)) return NextResponse.json({ error: "Questão inválida." }, { status: 400 });
  const { data: item } = await checked.actor.admin
    .from("assessment_items")
    .select("id,question_type")
    .eq("id", itemId)
    .eq("assessment_id", checked.assessment.id)
    .maybeSingle();
  if (!item) return NextResponse.json({ error: "Questão não encontrada nesta avaliação." }, { status: 404 });

  const answer: Record<string, unknown> = {
    assignment_id: checked.assignment.id,
    item_id: itemId,
    selected_option: null,
    open_answer: null,
    is_correct: null,
    answered_at: new Date().toISOString(),
  };
  if (item.question_type === "objetiva") {
    const selectedOption = Number(body?.selected_option);
    if (!Number.isInteger(selectedOption) || selectedOption < 0 || selectedOption > 4) return NextResponse.json({ error: "Alternativa inválida." }, { status: 400 });
    answer.selected_option = selectedOption;
  } else {
    const openAnswer = String(body?.open_answer ?? "").trim();
    if (openAnswer.length > 10000) return NextResponse.json({ error: "A resposta deve ter até 10.000 caracteres." }, { status: 400 });
    answer.open_answer = openAnswer || null;
  }

  const { error } = await checked.actor.admin.from("assessment_answers").upsert(answer, { onConflict: "assignment_id,item_id" });
  if (error) return NextResponse.json({ error: "Não foi possível salvar a resposta." }, { status: 400 });
  return NextResponse.json({ success: true, saved_at: new Date().toISOString() });
}
