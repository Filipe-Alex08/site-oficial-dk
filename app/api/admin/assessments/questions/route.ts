import { NextResponse } from "next/server";
import { requireAssessmentManager } from "@/lib/assessment-server";
import { validateAssessmentQuestion } from "@/lib/assessment-validation";

export async function POST(request: Request) {
  const actor = await requireAssessmentManager();
  if (!actor) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });

  const validation = validateAssessmentQuestion(await request.json().catch(() => null));
  if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });

  const { data, error } = await actor.admin
    .from("assessment_questions")
    .insert({ ...validation.value, created_by: actor.user.id })
    .select("*")
    .single();
  if (error) return NextResponse.json({ error: "Não foi possível cadastrar a questão." }, { status: 400 });

  await actor.admin.from("assessment_audit_log").insert({
    action: "questao_criada",
    actor_id: actor.user.id,
    details: { question_id: data.id, question_type: data.question_type },
  });
  return NextResponse.json({ question: data }, { status: 201 });
}
