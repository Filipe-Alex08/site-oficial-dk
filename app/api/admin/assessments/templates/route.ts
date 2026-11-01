import { NextResponse } from "next/server";
import { requireAssessmentManager } from "@/lib/assessment-server";
import { validateAssessmentDefinition } from "@/lib/assessment-validation";
import type { DkRank, GraduationLevel } from "@/lib/types";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  const actor = await requireAssessmentManager();
  if (!actor) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const validation = validateAssessmentDefinition(await request.json().catch(() => null));
  if ("error" in validation) return NextResponse.json({ error: validation.error }, { status: 400 });
  if (validation.value.questionIds.some((id) => !uuid.test(id))) return NextResponse.json({ error: "Uma das questões selecionadas é inválida." }, { status: 400 });

  const definition = validation.value.assessment;
  const selectedRanks = definition.content_rank_scopes as DkRank[];
  const selectedGraduations = definition.content_graduation_scopes as GraduationLevel[];
  const selectionMode = definition.selection_mode as "manual" | "sorteio_individual";

  const questionQuery = actor.admin
    .from("assessment_questions")
    .select("*")
    .eq("active", true);
  const { data: questionCandidates, error: questionError } = selectionMode === "manual"
    ? await questionQuery.in("id", validation.value.questionIds)
    : await questionQuery.eq("scope_type", definition.content_type as string).eq("question_type", "objetiva");
  if (questionError || !questionCandidates) {
    return NextResponse.json({ error: "Não foi possível consultar o banco de questões." }, { status: 400 });
  }
  if (selectionMode === "manual" && questionCandidates.length !== validation.value.questionIds.length) {
    return NextResponse.json({ error: "Uma ou mais questões não estão disponíveis." }, { status: 400 });
  }

  const questions = questionCandidates.filter((question) => {
    const scopeMatches = question.scope_type === definition.content_type && (
      question.scope_type === "patente"
        ? question.rank_scopes.some((rank: DkRank) => selectedRanks.includes(rank))
        : question.graduation_scopes.some((level: GraduationLevel) => selectedGraduations.includes(level))
    );
    const trackMatches = definition.track === "geral"
      ? question.track === "geral"
      : question.track === "geral" || question.track === definition.track;
    return scopeMatches && trackMatches;
  });
  if (selectionMode === "manual" && questions.length !== questionCandidates.length) {
    return NextResponse.json({ error: "Uma questão não corresponde aos conteúdos ou à área escolhidos." }, { status: 400 });
  }
  const questionCount = Number(definition.question_count);
  if (questions.length < questionCount) {
    return NextResponse.json({
      error: `O filtro encontrou ${questions.length} questão(ões) objetiva(s). Cadastre pelo menos ${questionCount} antes de publicar.`,
    }, { status: 400 });
  }

  const { data: assessment, error: assessmentError } = await actor.admin
    .from("assessments")
    .insert({ ...validation.value.assessment, created_by: actor.user.id, status: "rascunho" })
    .select("*")
    .single();
  if (assessmentError || !assessment) return NextResponse.json({ error: "Não foi possível criar a avaliação." }, { status: 400 });

  const orderedQuestions = selectionMode === "manual"
    ? validation.value.questionIds.map((questionId) => questions.find((question) => question.id === questionId)!)
    : questions;
  const snapshots = orderedQuestions.map((question, index) => {
    return {
      assessment_id: assessment.id,
      source_question_id: question.id,
      sort_order: index + 1,
      prompt: question.prompt,
      question_type: question.question_type,
      options: question.options,
      correct_option: question.correct_option,
      expected_answer: question.expected_answer,
      explanation: question.explanation,
      source_manual_title: question.manual_title,
      source_chapter: question.source_chapter,
      source_page: question.source_page,
    };
  });
  const { error: itemError } = await actor.admin.from("assessment_items").insert(snapshots);
  if (itemError) {
    await actor.admin.from("assessments").delete().eq("id", assessment.id);
    return NextResponse.json({ error: "Não foi possível registrar as questões da avaliação." }, { status: 400 });
  }

  const publishedAt = new Date().toISOString();
  const { data: published, error: publishError } = await actor.admin
    .from("assessments")
    .update({ status: "publicado", published_at: publishedAt })
    .eq("id", assessment.id)
    .select("*")
    .single();
  if (publishError || !published) {
    await actor.admin.from("assessments").delete().eq("id", assessment.id);
    return NextResponse.json({ error: "Não foi possível publicar a avaliação." }, { status: 400 });
  }

  await actor.admin.from("assessment_audit_log").insert({
    action: "avaliacao_publicada",
    actor_id: actor.user.id,
    assessment_id: assessment.id,
    details: {
      question_count: questionCount,
      question_pool_size: snapshots.length,
      selection_mode: selectionMode,
    },
  });
  return NextResponse.json({ assessment: published }, { status: 201 });
}
