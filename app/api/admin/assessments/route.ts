import { NextResponse } from "next/server";
import { requireAssessmentManager } from "@/lib/assessment-server";

export const dynamic = "force-dynamic";

export async function GET() {
  const actor = await requireAssessmentManager();
  if (!actor) return NextResponse.json({ error: "Acesso permitido somente aos responsáveis pelas avaliações." }, { status: 403 });

  const [questionsResult, assessmentsResult, assignmentsResult, membersResult, permissionsResult, openItemsResult, pendingAnswersResult] = await Promise.all([
    actor.admin.from("assessment_questions").select("*").order("created_at", { ascending: false }),
    actor.admin.from("assessments").select("*").order("created_at", { ascending: false }),
    actor.admin.from("assessment_assignments").select("*").order("created_at", { ascending: false }),
    actor.admin.from("profiles").select("id,full_name,nickname,rank,status").eq("status", "aprovado").order("nickname"),
    actor.canDelegate
      ? actor.admin.from("assessment_manager_permissions").select("*").order("granted_at", { ascending: false })
      : Promise.resolve({ data: [], error: null }),
    actor.admin.from("assessment_items").select("id,assessment_id,prompt,expected_answer,source_manual_title,source_chapter,source_page").eq("question_type", "aberta"),
    actor.admin.from("assessment_answers").select("assignment_id,item_id,open_answer,is_correct,reviewer_feedback,answered_at").is("is_correct", null).not("open_answer", "is", null),
  ]);

  const firstError = [questionsResult, assessmentsResult, assignmentsResult, membersResult, permissionsResult, openItemsResult, pendingAnswersResult]
    .find((result) => result.error)?.error;
  if (firstError) return NextResponse.json({ error: "Não foi possível carregar o módulo de avaliações." }, { status: 500 });

  const openItems = new Map((openItemsResult.data ?? []).map((item) => [item.id, item]));
  const assignments = new Map((assignmentsResult.data ?? []).map((assignment) => [assignment.id, assignment]));
  const reviews = (pendingAnswersResult.data ?? [])
    .map((answer) => ({ ...answer, item: openItems.get(answer.item_id), assignment: assignments.get(answer.assignment_id) }))
    .filter((review) => review.item && review.assignment?.status === "aguardando_correcao");

  return NextResponse.json({
    actor: {
      id: actor.user.id,
      nickname: actor.profile.nickname,
      rank: actor.profile.rank,
      canDelegate: actor.canDelegate,
    },
    questions: questionsResult.data ?? [],
    assessments: assessmentsResult.data ?? [],
    assignments: assignmentsResult.data ?? [],
    members: membersResult.data ?? [],
    permissions: permissionsResult.data ?? [],
    reviews,
  }, { headers: { "Cache-Control": "no-store" } });
}
