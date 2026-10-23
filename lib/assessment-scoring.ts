import { createAdminClient } from "@/lib/supabase/admin";

type AssessmentAdmin = NonNullable<ReturnType<typeof createAdminClient>>;

export async function recalculateAssessmentResult(admin: AssessmentAdmin, assignmentId: string) {
  const { data: assignment } = await admin
    .from("assessment_assignments")
    .select("id,assessment_id,status")
    .eq("id", assignmentId)
    .maybeSingle();
  if (!assignment) throw new Error("Indicação não encontrada.");

  const [{ data: assessment }, { data: items }, { data: answers }] = await Promise.all([
    admin.from("assessments").select("passing_score").eq("id", assignment.assessment_id).single(),
    admin.from("assessment_items").select("id,question_type").eq("assessment_id", assignment.assessment_id),
    admin.from("assessment_answers").select("item_id,is_correct,open_answer").eq("assignment_id", assignmentId),
  ]);
  if (!assessment || !items) throw new Error("Avaliação incompleta.");

  const answersByItem = new Map((answers ?? []).map((answer) => [answer.item_id, answer]));
  let correctCount = 0;
  let pendingCount = 0;
  for (const item of items) {
    const answer = answersByItem.get(item.id);
    if (answer?.is_correct === true) correctCount++;
    if (item.question_type === "aberta" && answer?.open_answer?.trim() && answer.is_correct === null) pendingCount++;
  }
  const incorrectCount = items.length - correctCount - pendingCount;
  const scorePercent = pendingCount ? null : Number(((correctCount / Math.max(items.length, 1)) * 100).toFixed(2));
  const passed = scorePercent === null ? null : scorePercent >= Number(assessment.passing_score);
  const status = pendingCount ? "aguardando_correcao" : "corrigido";
  const update = {
    status,
    pending_open_count: pendingCount,
    correct_count: correctCount,
    incorrect_count: incorrectCount,
    score_percent: scorePercent,
    passed,
    graded_at: pendingCount ? null : new Date().toISOString(),
  };
  const { error } = await admin.from("assessment_assignments").update(update).eq("id", assignmentId);
  if (error) throw new Error("Não foi possível calcular o resultado.");
  return update;
}

export async function submitAssessmentAttempt(admin: AssessmentAdmin, assignmentId: string) {
  const { data: assignment } = await admin
    .from("assessment_assignments")
    .select("id,assessment_id,status,submitted_at")
    .eq("id", assignmentId)
    .maybeSingle();
  if (!assignment) throw new Error("Indicação não encontrada.");
  if (["aguardando_correcao", "corrigido"].includes(assignment.status)) {
    return recalculateAssessmentResult(admin, assignmentId);
  }
  if (assignment.status !== "em_andamento") throw new Error("Esta avaliação não está em andamento.");

  const [{ data: items }, { data: answers }] = await Promise.all([
    admin.from("assessment_items").select("id,question_type,correct_option").eq("assessment_id", assignment.assessment_id).order("sort_order"),
    admin.from("assessment_answers").select("item_id,selected_option,open_answer").eq("assignment_id", assignmentId),
  ]);
  if (!items?.length) throw new Error("A avaliação não possui questões.");

  const answersByItem = new Map((answers ?? []).map((answer) => [answer.item_id, answer]));
  const gradedAnswers = items.map((item) => {
    const answer = answersByItem.get(item.id);
    const selectedOption = answer?.selected_option;
    const openAnswer = String(answer?.open_answer ?? "").trim();
    return {
      assignment_id: assignmentId,
      item_id: item.id,
      selected_option: item.question_type === "objetiva" && typeof selectedOption === "number" && Number.isInteger(selectedOption) ? selectedOption : null,
      open_answer: item.question_type === "aberta" && openAnswer ? openAnswer : null,
      is_correct: item.question_type === "objetiva"
        ? answer?.selected_option === item.correct_option
        : openAnswer
          ? null
          : false,
      answered_at: new Date().toISOString(),
    };
  });

  const submittedAt = assignment.submitted_at ?? new Date().toISOString();
  const { error: submissionError } = await admin
    .from("assessment_assignments")
    .update({ submitted_at: submittedAt })
    .eq("id", assignmentId)
    .eq("status", "em_andamento");
  if (submissionError) throw new Error("Não foi possível bloquear a tentativa para entrega.");

  const { error: answerError } = await admin
    .from("assessment_answers")
    .upsert(gradedAnswers, { onConflict: "assignment_id,item_id" });
  if (answerError) throw new Error("Não foi possível consolidar as respostas.");
  return recalculateAssessmentResult(admin, assignmentId);
}
