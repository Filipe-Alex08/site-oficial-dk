import {
  isAssessmentDifficulty,
  isAssessmentQuestionCount,
  isAssessmentQuestionType,
  isAssessmentScope,
  isAssessmentTrack,
  isGraduationScope,
  uniqueStrings,
} from "@/lib/assessments";
import { rankOptions } from "@/lib/member-access";
import type { DkRank, GraduationLevel } from "@/lib/types";

type ValidationResult<T> = { value: T; error?: never } | { value?: never; error: string };

function optionalText(value: unknown, maxLength: number) {
  if (value === undefined || value === null) return null;
  const clean = String(value).trim();
  return clean ? clean.slice(0, maxLength) : null;
}

export function validateAssessmentQuestion(body: unknown): ValidationResult<Record<string, unknown>> {
  if (!body || typeof body !== "object") return { error: "Dados da questão inválidos." };
  const input = body as Record<string, unknown>;
  const prompt = String(input.prompt ?? "").trim();
  const manualTitle = String(input.manual_title ?? "").trim();
  const questionType = input.question_type;
  const scopeType = input.scope_type;
  const track = input.track;
  const difficulty = input.difficulty;

  if (prompt.length < 10 || prompt.length > 5000) return { error: "O enunciado deve ter entre 10 e 5.000 caracteres." };
  if (manualTitle.length < 2 || manualTitle.length > 200) return { error: "Informe o manual de origem da questão." };
  if (!isAssessmentQuestionType(questionType)) return { error: "Tipo de questão inválido." };
  if (!isAssessmentScope(scopeType)) return { error: "Categoria da questão inválida." };
  if (!isAssessmentTrack(track)) return { error: "Área da questão inválida." };
  if (!isAssessmentDifficulty(difficulty)) return { error: "Nível de dificuldade inválido." };

  const rawRanks = uniqueStrings(input.rank_scopes);
  const rawGraduations = uniqueStrings(input.graduation_scopes);
  const validRanks = rawRanks.filter((rank): rank is DkRank => rankOptions.some((item) => item.value === rank));
  const validGraduations = rawGraduations.filter((level): level is Exclude<GraduationLevel, "sem_graduacao"> => isGraduationScope(level));

  if (scopeType === "patente" && (!validRanks.length || validRanks.length !== rawRanks.length || rawGraduations.length)) {
    return { error: "Selecione ao menos uma patente válida e não misture graduações." };
  }
  if (scopeType === "graduacao" && (!validGraduations.length || validGraduations.length !== rawGraduations.length || rawRanks.length)) {
    return { error: "Selecione ao menos uma graduação válida e não misture patentes." };
  }

  let options: string[] = [];
  let correctOption: number | null = null;
  let expectedAnswer: string | null = null;
  if (questionType === "objetiva") {
    if (!Array.isArray(input.options) || input.options.length !== 5) return { error: "A questão objetiva precisa ter exatamente cinco alternativas." };
    options = input.options.map((option) => String(option).trim());
    if (options.some((option) => !option || option.length > 1000)) return { error: "Preencha as cinco alternativas com até 1.000 caracteres cada." };
    if (new Set(options.map((option) => option.toLocaleLowerCase("pt-BR"))).size !== 5) return { error: "As cinco alternativas precisam ser diferentes." };
    const parsedCorrect = Number(input.correct_option);
    if (!Number.isInteger(parsedCorrect) || parsedCorrect < 0 || parsedCorrect > 4) return { error: "Selecione uma única alternativa correta." };
    correctOption = parsedCorrect;
  } else {
    expectedAnswer = String(input.expected_answer ?? "").trim();
    if (expectedAnswer.length < 2 || expectedAnswer.length > 5000) return { error: "Informe o gabarito esperado da questão aberta." };
  }

  return {
    value: {
      prompt,
      question_type: questionType,
      options,
      correct_option: correctOption,
      expected_answer: expectedAnswer,
      explanation: optionalText(input.explanation, 5000),
      manual_title: manualTitle,
      source_chapter: optionalText(input.source_chapter, 160),
      source_page: optionalText(input.source_page, 40),
      scope_type: scopeType,
      rank_scopes: scopeType === "patente" ? validRanks : [],
      graduation_scopes: scopeType === "graduacao" ? validGraduations : [],
      track,
      difficulty,
      active: input.active === undefined ? true : Boolean(input.active),
    },
  };
}

export function validateAssessmentDefinition(body: unknown): ValidationResult<{
  assessment: Record<string, unknown>;
  questionIds: string[];
}> {
  if (!body || typeof body !== "object") return { error: "Dados da avaliação inválidos." };
  const input = body as Record<string, unknown>;
  const title = String(input.title ?? "").trim();
  const targetType = input.target_type;
  const track = input.track;
  const questionCount = Number(input.question_count);
  const passingScore = Number(input.passing_score);
  const rawDuration = input.duration_minutes;
  const duration = rawDuration === "" || rawDuration === null || rawDuration === undefined ? null : Number(rawDuration);
  const questionIds = uniqueStrings(input.question_ids);

  if (title.length < 3 || title.length > 180) return { error: "O título deve ter entre 3 e 180 caracteres." };
  if (!isAssessmentScope(targetType)) return { error: "Objetivo da avaliação inválido." };
  if (!isAssessmentTrack(track)) return { error: "Área da avaliação inválida." };
  if (!isAssessmentQuestionCount(questionCount)) return { error: "Escolha 10, 20, 30, 50 ou 100 questões." };
  if (questionIds.length !== questionCount) return { error: `Selecione exatamente ${questionCount} questões diferentes.` };
  if (!Number.isFinite(passingScore) || passingScore < 0 || passingScore > 100) return { error: "O percentual de aprovação deve ficar entre 0 e 100." };
  if (duration !== null && (!Number.isInteger(duration) || duration < 5 || duration > 360)) return { error: "O tempo deve ficar entre 5 e 360 minutos." };

  let targetRank: DkRank | null = null;
  let targetGraduation: Exclude<GraduationLevel, "sem_graduacao"> | null = null;
  if (targetType === "patente") {
    const candidate = String(input.target_rank ?? "");
    if (!rankOptions.some((item) => item.value === candidate)) return { error: "Selecione a patente pretendida." };
    targetRank = candidate as DkRank;
  } else {
    const candidate = input.target_graduation;
    if (!isGraduationScope(candidate)) return { error: "Selecione a graduação pretendida." };
    targetGraduation = candidate;
  }

  const contentType = input.content_type;
  if (!isAssessmentScope(contentType)) return { error: "Tipo dos conteúdos inválido." };
  const rawContentRanks = uniqueStrings(input.content_rank_scopes);
  const rawContentGraduations = uniqueStrings(input.content_graduation_scopes);
  const contentRanks = rawContentRanks.filter((rank): rank is DkRank => rankOptions.some((item) => item.value === rank));
  const contentGraduations = rawContentGraduations.filter((level): level is Exclude<GraduationLevel, "sem_graduacao"> => isGraduationScope(level));
  if (contentType === "patente" && (!contentRanks.length || contentRanks.length !== rawContentRanks.length || rawContentGraduations.length)) {
    return { error: "Selecione ao menos uma patente válida para os conteúdos cobrados." };
  }
  if (contentType === "graduacao" && (!contentGraduations.length || contentGraduations.length !== rawContentGraduations.length || rawContentRanks.length)) {
    return { error: "Selecione ao menos uma graduação válida para os conteúdos cobrados." };
  }

  return {
    value: {
      assessment: {
        title,
        description: optionalText(input.description, 2000),
        target_type: targetType,
        target_rank: targetRank,
        target_graduation: targetGraduation,
        content_type: contentType,
        content_rank_scopes: contentType === "patente" ? contentRanks : [],
        content_graduation_scopes: contentType === "graduacao" ? contentGraduations : [],
        track,
        question_count: questionCount,
        passing_score: passingScore,
        duration_minutes: duration,
      },
      questionIds,
    },
  };
}
