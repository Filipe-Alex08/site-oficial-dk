import { graduationOptions, graduationTracks, highestGraduation, isCommander, rankGroups, rankLabels } from "@/lib/member-access";
import type { DkRank, GraduationLevel, MemberProfile } from "@/lib/types";

/** "todas", uma patente exata ou um grupo inteiro ("grupo:Praças"). */
export type RankFilter = "todas" | DkRank | `grupo:${string}`;
/** Nível de graduação; "comandante" é um filtro à parte (veja `matchesGraduation`) para combinar com o nível. */
export type GraduationFilter = "todas" | GraduationLevel;
export type TrackFilter = "qualquer" | "cavalaria" | "arquearia";

type FilterOption = { value: string; label: string; group?: string };

type FilterableMember = Pick<MemberProfile, "nickname" | "full_name" | "rank"> & Partial<Pick<MemberProfile, "email" | "graduation_level" | "graduation_cavalaria" | "graduation_arquearia" | "commander_cavalaria" | "commander_arquearia">>;

const GROUP_PREFIX = "grupo:";

export const rankFilterOptions: FilterOption[] = [
  { value: "todas", label: "Todas as patentes" },
  ...rankGroups.flatMap((group) => [
    // Um grupo com uma única patente não precisa da opção "Todos".
    ...(group.ranks.length > 1 ? [{ value: `${GROUP_PREFIX}${group.category}`, label: `Todos: ${group.category}`, group: group.category }] : []),
    ...group.ranks.map((rank) => ({ value: rank.value, label: rank.label, group: group.category })),
  ]),
];

export const graduationFilterOptions: FilterOption[] = [
  { value: "todas", label: "Todas as graduações" },
  ...graduationOptions.map((item) => ({ value: item.value, label: item.label })),
];

export const trackFilterOptions: FilterOption[] = [
  { value: "qualquer", label: "Qualquer trilha" },
  ...graduationTracks.map((track) => ({ value: track.value, label: track.label })),
];

export function matchesRank(member: Pick<MemberProfile, "rank">, filter: RankFilter): boolean {
  if (filter === "todas") return true;
  if (filter.startsWith(GROUP_PREFIX)) {
    const category = filter.slice(GROUP_PREFIX.length);
    return Boolean(rankGroups.find((group) => group.category === category)?.ranks.some((rank) => rank.value === member.rank));
  }
  return member.rank === filter;
}

/** Nível do membro em cada trilha do filtro (uma trilha específica ou as duas). */
function trackLevels(member: FilterableMember, track: TrackFilter) {
  const tracks = graduationTracks.filter((item) => track === "qualquer" || item.value === track);
  const hasTracks = member.graduation_cavalaria != null || member.graduation_arquearia != null;
  return tracks.map((item) => ({
    // Banco sem as trilhas (migração 015): vale a graduação única antiga.
    level: (hasTracks ? member[item.field] : member.graduation_level) ?? "sem_graduacao" as GraduationLevel,
    commander: member[item.commanderField],
  }));
}

/**
 * Nível e comando se combinam por trilha: "Ouro + comandante" pede uma trilha em que a pessoa
 * seja ouro E comandante (ouro numa trilha e comando na outra não conta).
 */
export function matchesGraduation(member: FilterableMember, filter: GraduationFilter, track: TrackFilter = "qualquer", commanderOnly = false): boolean {
  if (filter === "todas" && !commanderOnly) return true;
  // "Sem graduação" em qualquer trilha significa não ter graduação em nenhuma.
  if (filter === "sem_graduacao" && track === "qualquer" && !commanderOnly) return highestGraduation(member) === "sem_graduacao";
  return trackLevels(member, track).some((item) => (filter === "todas" || item.level === filter) && (!commanderOnly || isCommander(item.level, item.commander)));
}

export function matchesSearch(member: FilterableMember, term: string): boolean {
  const normalized = term.trim().toLocaleLowerCase("pt-BR");
  if (!normalized) return true;
  return [member.nickname, member.full_name, member.email ?? "", rankLabels[member.rank] ?? ""].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalized));
}
