import type { AdminRole, DkRank, DocumentAudience, GraduationLevel, MemberKind } from "@/lib/types";

export const memberKindOptions: Array<{ value: MemberKind; label: string }> = [
  { value: "membro", label: "Membro" },
  { value: "oficial", label: "Oficial" },
];

export const graduationOptions: Array<{ value: GraduationLevel; label: string }> = [
  { value: "sem_graduacao", label: "Sem graduação" },
  { value: "bronze", label: "Bronze" },
  { value: "prata", label: "Prata" },
  { value: "ouro", label: "Ouro" },
];

export const rankGroups: Array<{ category: string; ranks: Array<{ value: DkRank; label: string }> }> = [
  { category: "Condição inicial", ranks: [{ value: "recruta", label: "Recruta" }] },
  {
    category: "Praças",
    ranks: [
      { value: "soldado", label: "Soldado" },
      { value: "cabo", label: "Cabo" },
      { value: "terceiro_sargento", label: "3º Sargento" },
      { value: "segundo_sargento", label: "2º Sargento" },
      { value: "primeiro_sargento", label: "1º Sargento" },
      { value: "subtenente", label: "Subtenente" },
    ],
  },
  {
    category: "Oficiais Intermediários",
    ranks: [
      { value: "tenente", label: "Tenente" },
      { value: "capitao", label: "Capitão" },
    ],
  },
  {
    category: "Oficiais Superiores",
    ranks: [
      { value: "major", label: "Major" },
      { value: "tenente_coronel", label: "Tenente-Coronel" },
      { value: "coronel", label: "Coronel" },
    ],
  },
  {
    category: "Oficiais Generais",
    ranks: [
      { value: "general_brigada", label: "General de Brigada" },
      { value: "general_divisao", label: "General de Divisão" },
      { value: "general_exercito", label: "General de Exército" },
    ],
  },
];

export const rankOptions = rankGroups.flatMap((group) => group.ranks);

export const rankLabels = Object.fromEntries(rankOptions.map((rank) => [rank.value, rank.label])) as Record<DkRank, string>;
export const graduationLabels = Object.fromEntries(graduationOptions.map((item) => [item.value, item.label])) as Record<GraduationLevel, string>;
export const memberKindLabels = Object.fromEntries(memberKindOptions.map((item) => [item.value, item.label])) as Record<MemberKind, string>;

export const adminRoleOptions: Array<{ value: AdminRole; label: string }> = [
  { value: "principal", label: "ADM Principal" },
  { value: "midias", label: "ADM de Mídias" },
  { value: "atividades", label: "ADM de Atividades" },
  { value: "membros", label: "ADM de Membros" },
];

export const documentAudienceOptions: Array<{ value: DocumentAudience; label: string }> = [
  { value: "todos", label: "Todos os membros" },
  { value: "oficiais", label: "Somente oficiais" },
  { value: "graduacao", label: "Graduação" },
];
