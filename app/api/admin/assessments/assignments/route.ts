import { NextResponse } from "next/server";
import { requireAssessmentManager } from "@/lib/assessment-server";
import { uniqueStrings } from "@/lib/assessments";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const actor = await requireAssessmentManager();
  if (!actor) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || !uuid.test(String(body.assessment_id ?? ""))) return NextResponse.json({ error: "Avaliação inválida." }, { status: 400 });
  const memberIds = uniqueStrings(body.member_ids);
  if (!memberIds.length || memberIds.length > 50 || memberIds.some((id) => !uuid.test(id))) {
    return NextResponse.json({ error: "Selecione de 1 a 50 integrantes válidos." }, { status: 400 });
  }
  const expiresAt = body.expires_at ? new Date(String(body.expires_at)) : null;
  if (expiresAt && (!Number.isFinite(expiresAt.getTime()) || expiresAt <= new Date())) {
    return NextResponse.json({ error: "A data limite precisa estar no futuro." }, { status: 400 });
  }

  const assessmentId = String(body.assessment_id);
  const [{ data: assessment }, { data: members }] = await Promise.all([
    actor.admin.from("assessments").select("id,status,title").eq("id", assessmentId).maybeSingle(),
    actor.admin.from("profiles").select("id,nickname,status").in("id", memberIds).eq("status", "aprovado"),
  ]);
  if (!assessment || assessment.status !== "publicado") return NextResponse.json({ error: "A avaliação precisa estar publicada." }, { status: 400 });
  if (!members || members.length !== memberIds.length) return NextResponse.json({ error: "Um dos integrantes não está aprovado." }, { status: 400 });

  const rows = memberIds.map((memberId) => ({
    assessment_id: assessmentId,
    member_id: memberId,
    indication_number: 1,
    assigned_by: actor.user.id,
    expires_at: expiresAt?.toISOString() ?? null,
  }));
  const { data: assignments, error } = await actor.admin.from("assessment_assignments").insert(rows).select("*");
  if (error || !assignments) return NextResponse.json({ error: "Não foi possível criar as indicações." }, { status: 400 });

  await actor.admin.from("assessment_audit_log").insert(assignments.map((assignment) => ({
    action: "indicacao_criada",
    actor_id: actor.user.id,
    subject_user_id: assignment.member_id,
    assessment_id: assessmentId,
    assignment_id: assignment.id,
    details: { indication_number: assignment.indication_number },
  })));

  return NextResponse.json({
    assignments: assignments.map((assignment) => ({ ...assignment, path: `/membro/simulados/${assignment.access_token}` })),
  }, { status: 201 });
}
