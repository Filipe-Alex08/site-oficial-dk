import { NextResponse } from "next/server";
import { requireAssessmentManager } from "@/lib/assessment-server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAssessmentManager();
  if (!actor) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { id } = await params;
  if (!uuid.test(id)) return NextResponse.json({ error: "Indicação inválida." }, { status: 400 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const action = body?.action;

  const { data: assignment } = await actor.admin.from("assessment_assignments").select("*").eq("id", id).maybeSingle();
  if (!assignment) return NextResponse.json({ error: "Indicação não encontrada." }, { status: 404 });

  if (action === "cancel") {
    if (assignment.status !== "convidado") return NextResponse.json({ error: "Somente uma indicação ainda não iniciada pode ser cancelada." }, { status: 409 });
    const { error } = await actor.admin.from("assessment_assignments").update({ status: "cancelado" }).eq("id", id).eq("status", "convidado");
    if (error) return NextResponse.json({ error: "Não foi possível cancelar a indicação." }, { status: 400 });
    await actor.admin.from("assessment_audit_log").insert({ action: "indicacao_cancelada", actor_id: actor.user.id, subject_user_id: assignment.member_id, assessment_id: assignment.assessment_id, assignment_id: id });
    return NextResponse.json({ success: true });
  }

  if (action === "reset") {
    if (!actor.canDelegate) return NextResponse.json({ error: "Somente um General pode liberar uma repetição excepcional." }, { status: 403 });
    const reason = String(body?.reason ?? "").trim();
    if (reason.length < 10 || reason.length > 1000) return NextResponse.json({ error: "Registre uma justificativa de 10 a 1.000 caracteres." }, { status: 400 });
    if (assignment.status === "convidado") return NextResponse.json({ error: "Esta indicação ainda não foi iniciada." }, { status: 409 });
    const rawExpiresAt = body?.expires_at ? new Date(String(body.expires_at)) : null;
    if (rawExpiresAt && (!Number.isFinite(rawExpiresAt.getTime()) || rawExpiresAt <= new Date())) return NextResponse.json({ error: "O novo prazo precisa estar no futuro." }, { status: 400 });

    const { data: lockedAssignment, error: lockError } = await actor.admin
      .from("assessment_assignments")
      .update({ status: "cancelado" })
      .eq("id", id)
      .eq("status", assignment.status)
      .select("id")
      .maybeSingle();
    if (lockError || !lockedAssignment) {
      return NextResponse.json({ error: "A tentativa mudou enquanto era processada. Atualize a página e tente novamente." }, { status: 409 });
    }
    const { error: answerError } = await actor.admin.from("assessment_answers").delete().eq("assignment_id", id);
    if (answerError) return NextResponse.json({ error: "A tentativa foi bloqueada, mas as respostas não puderam ser limpas." }, { status: 500 });
    const { error: resetError } = await actor.admin.from("assessment_assignments").update({
      status: "convidado",
      expires_at: rawExpiresAt?.toISOString() ?? null,
      started_at: null,
      submitted_at: null,
      graded_at: null,
      score_percent: null,
      correct_count: null,
      incorrect_count: null,
      pending_open_count: 0,
      passed: null,
    }).eq("id", id).eq("status", "cancelado");
    if (resetError) return NextResponse.json({ error: "A tentativa anterior foi bloqueada, mas a nova liberação não foi concluída." }, { status: 500 });
    await actor.admin.from("assessment_audit_log").insert({
      action: "tentativa_reaberta_excepcionalmente",
      actor_id: actor.user.id,
      subject_user_id: assignment.member_id,
      assessment_id: assignment.assessment_id,
      assignment_id: id,
      details: { reason, previous_status: assignment.status },
    });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Ação inválida." }, { status: 400 });
}
