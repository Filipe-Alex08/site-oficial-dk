import { NextResponse } from "next/server";
import { requireAssessmentManager } from "@/lib/assessment-server";
import { recalculateAssessmentResult } from "@/lib/assessment-scoring";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const actor = await requireAssessmentManager();
  if (!actor) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const assignmentId = String(body?.assignment_id ?? "");
  const itemId = String(body?.item_id ?? "");
  if (!uuid.test(assignmentId) || !uuid.test(itemId) || typeof body?.is_correct !== "boolean") {
    return NextResponse.json({ error: "Correção inválida." }, { status: 400 });
  }
  const feedback = String(body.feedback ?? "").trim();
  if (feedback.length > 3000) return NextResponse.json({ error: "O comentário deve ter até 3.000 caracteres." }, { status: 400 });

  const [{ data: assignment }, { data: item }, { data: answer }] = await Promise.all([
    actor.admin.from("assessment_assignments").select("id,status,member_id,assessment_id").eq("id", assignmentId).maybeSingle(),
    actor.admin.from("assessment_items").select("id,assessment_id,question_type").eq("id", itemId).maybeSingle(),
    actor.admin.from("assessment_answers").select("assignment_id,item_id,open_answer").eq("assignment_id", assignmentId).eq("item_id", itemId).maybeSingle(),
  ]);
  if (!assignment || assignment.status !== "aguardando_correcao" || !item || item.assessment_id !== assignment.assessment_id || item.question_type !== "aberta" || !answer?.open_answer?.trim()) {
    return NextResponse.json({ error: "Resposta aberta não encontrada ou já encerrada." }, { status: 404 });
  }

  const now = new Date().toISOString();
  const { error } = await actor.admin.from("assessment_answers").update({
    is_correct: body.is_correct,
    reviewer_feedback: feedback || null,
    graded_by: actor.user.id,
    graded_at: now,
  }).eq("assignment_id", assignmentId).eq("item_id", itemId);
  if (error) return NextResponse.json({ error: "Não foi possível registrar a correção." }, { status: 400 });

  const result = await recalculateAssessmentResult(actor.admin, assignmentId);
  await actor.admin.from("assessment_audit_log").insert({
    action: "resposta_aberta_corrigida",
    actor_id: actor.user.id,
    subject_user_id: assignment.member_id,
    assessment_id: assignment.assessment_id,
    assignment_id: assignmentId,
    details: { item_id: itemId, is_correct: body.is_correct },
  });
  return NextResponse.json({ result });
}
