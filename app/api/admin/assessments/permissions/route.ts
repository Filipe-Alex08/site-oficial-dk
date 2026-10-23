import { NextResponse } from "next/server";
import { requireAssessmentManager } from "@/lib/assessment-server";
import { isDelegableAssessmentRank } from "@/lib/assessments";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const actor = await requireAssessmentManager();
  if (!actor?.canDelegate) return NextResponse.json({ error: "Somente um General pode delegar esta permissão." }, { status: 403 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const userId = String(body?.user_id ?? "");
  const active = body?.active;
  if (!uuid.test(userId) || typeof active !== "boolean") return NextResponse.json({ error: "Permissão inválida." }, { status: 400 });

  const { data: target } = await actor.admin.from("profiles").select("id,rank,status").eq("id", userId).maybeSingle();
  if (!target || target.status !== "aprovado" || !isDelegableAssessmentRank(target.rank)) {
    return NextResponse.json({ error: "A permissão só pode ser delegada a Major, Tenente-Coronel ou Coronel aprovados." }, { status: 400 });
  }
  const now = new Date().toISOString();
  const { error } = await actor.admin.from("assessment_manager_permissions").upsert({
    user_id: userId,
    granted_by: actor.user.id,
    active,
    granted_at: active ? now : undefined,
    revoked_at: active ? null : now,
  }, { onConflict: "user_id" });
  if (error) return NextResponse.json({ error: "Não foi possível alterar a permissão." }, { status: 400 });

  await actor.admin.from("assessment_audit_log").insert({
    action: active ? "gestor_delegado" : "gestor_revogado",
    actor_id: actor.user.id,
    subject_user_id: userId,
  });
  return NextResponse.json({ success: true });
}
