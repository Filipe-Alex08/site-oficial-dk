import type {
  AssessmentAssignmentStatus,
  AssessmentDifficulty,
  AssessmentQuestionType,
  AssessmentScopeType,
  AssessmentTrack,
  DkRank,
  GraduationLevel,
} from "@/lib/types";

export const assessmentQuestionTypeOptions: Array<{ value: AssessmentQuestionType; label: string }> = [
  { value: "objetiva", label: "Objetiva — cinco alternativas" },
  { value: "aberta", label: "Aberta — correção manual" },
];

export const assessmentScopeOptions: Array<{ value: AssessmentScopeType; label: string }> = [
  { value: "patente", label: "Patente" },
  { value: "graduacao", label: "Graduação" },
];

export const assessmentTrackOptions: Array<{ value: AssessmentTrack; label: string }> = [
  { value: "geral", label: "Geral" },
  { value: "cavalaria", label: "Cavalaria" },
  { value: "arquearia", label: "Arquearia" },
];

export const assessmentDifficultyOptions: Array<{ value: AssessmentDifficulty; label: string }> = [
  { value: "basica", label: "Básica" },
  { value: "intermediaria", label: "Intermediária" },
  { value: "avancada", label: "Avançada" },
];

export const assessmentQuestionCountOptions = [10, 20, 30, 50, 100] as const;

export const assessmentAssignmentStatusLabels: Record<AssessmentAssignmentStatus, string> = {
  convidado: "Disponível",
  em_andamento: "Em andamento",
  aguardando_correcao: "Aguardando correção",
  corrigido: "Corrigido",
  cancelado: "Cancelado",
  expirado: "Expirado",
};

export const generalAssessmentRanks: DkRank[] = [
  "general_brigada",
  "general_divisao",
  "general_exercito",
];

export const delegableAssessmentRanks: DkRank[] = [
  "major",
  "tenente_coronel",
  "coronel",
];

export function isGeneralAssessmentRank(rank: DkRank) {
  return generalAssessmentRanks.includes(rank);
}

export function isDelegableAssessmentRank(rank: DkRank) {
  return delegableAssessmentRanks.includes(rank);
}

export function isAssessmentQuestionCount(value: number): value is (typeof assessmentQuestionCountOptions)[number] {
  return assessmentQuestionCountOptions.includes(value as (typeof assessmentQuestionCountOptions)[number]);
}

export function isAssessmentTrack(value: unknown): value is AssessmentTrack {
  return assessmentTrackOptions.some((item) => item.value === value);
}

export function isAssessmentScope(value: unknown): value is AssessmentScopeType {
  return assessmentScopeOptions.some((item) => item.value === value);
}

export function isAssessmentQuestionType(value: unknown): value is AssessmentQuestionType {
  return assessmentQuestionTypeOptions.some((item) => item.value === value);
}

export function isAssessmentDifficulty(value: unknown): value is AssessmentDifficulty {
  return assessmentDifficultyOptions.some((item) => item.value === value);
}

export function isGraduationScope(value: unknown): value is Exclude<GraduationLevel, "sem_graduacao"> {
  return value === "bronze" || value === "prata" || value === "ouro";
}

export function uniqueStrings(values: unknown): string[] {
  if (!Array.isArray(values)) return [];
  return [...new Set(values.filter((value): value is string => typeof value === "string"))];
}
