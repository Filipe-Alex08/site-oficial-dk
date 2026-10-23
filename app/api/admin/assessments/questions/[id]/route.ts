import { NextResponse } from "next/server";
import { requireAssessmentManager } from "@/lib/assessment-server";
import { validateAssessmentQuestion } from "@/lib/assessment-validation";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAssessmentManager();
  if (!actor) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { id } = await params;
  if (!uuid.test(id)) return NextResponse.json({ error: "Questão inválida." }, { status: 400 });

  const validation = validateAssessmentQuestion(await request.json().catch(() => null));
  if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });
  const { data, error } = await actor.admin
    .from("assessment_questions")
    .update(validation.value)
    .eq("id", id)
    .select("*")
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Questão não encontrada ou não pôde ser atualizada." }, { status: 404 });

  await actor.admin.from("assessment_audit_log").insert({ action: "questao_atualizada", actor_id: actor.user.id, details: { question_id: id } });
  return NextResponse.json({ question: data });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const actor = await requireAssessmentManager();
  if (!actor) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { id } = await params;
  if (!uuid.test(id)) return NextResponse.json({ error: "Questão inválida." }, { status: 400 });

  const { data, error } = await actor.admin
    .from("assessment_questions")
    .update({ active: false })
    .eq("id", id)
    .select("id")
    .maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Questão não encontrada." }, { status: 404 });
  await actor.admin.from("assessment_audit_log").insert({ action: "questao_desativada", actor_id: actor.user.id, details: { question_id: id } });
  return NextResponse.json({ success: true });
}
