import type { Activity } from "@/lib/types";

export type TournamentFormat = "mata_mata" | "ligas";
export type TournamentStatus = "rascunho" | "inscricoes" | "em_andamento" | "concluido";

export type TournamentSettings = {
  title: string;
  description: string;
  rules: string;
  format: TournamentFormat;
  opensAt: string | null;
  closesAt: string | null;
  fightsPerActivity: number;
  leagueNames: string[];
  qualifiersPerLeague: number;
  thirdPlace: boolean;
  firstActivityId: string | null;
};

export type TournamentEntry = { id: string; nickname: string; registered: boolean };
export type TournamentLeague = { name: string; participantIds: string[] };
type MatchStage = "liga" | "desempate" | "mata_mata" | "terceiro_lugar";
export type TournamentResult = {
  kind: "vitoria" | "empate" | "wo" | "vaga_livre";
  winnerId: string | null;
  note: string;
};

export type TournamentMatch = {
  id: string;
  stage: MatchStage;
  round: number;
  leagueIndex: number | null;
  participantIds: [string | null, string | null];
  previousMatches?: [string, string];
  activityId: string | null;
  postponed: boolean;
  result: TournamentResult | null;
};

export type TournamentState = {
  settings: TournamentSettings;
  status: TournamentStatus;
  entries: TournamentEntry[];
  leagues: TournamentLeague[];
  matches: TournamentMatch[];
  qualifiedIds: string[];
};

export type TournamentSummary = { id: string; title: string; format: TournamentFormat; status: TournamentStatus };
export type TournamentRecord = { id: string; revision: number; state: TournamentState };
export type TournamentActivity = Pick<Activity, "id" | "title" | "starts_at" | "location" | "status">;
export type TournamentMember = Pick<TournamentEntry, "id" | "nickname">;
export type TournamentAdminAction =
  | { action: "settings"; settings: TournamentSettings }
  | { action: "invite"; memberIds: string[] }
  | { action: "remove_invite"; memberId: string }
  | { action: "open" | "close" }
  | { action: "distribute"; activityId: string }
  | { action: "schedule"; matchId: string; activityId: string }
  | { action: "postpone"; matchId: string }
  | { action: "result"; matchId: string; result: TournamentResult };

export const tournamentFormatLabels: Record<TournamentFormat, string> = {
  mata_mata: "Mata-mata",
  ligas: "Ligas com mata-mata final",
};

export const tournamentStatusLabels: Record<TournamentStatus, string> = {
  rascunho: "Rascunho",
  inscricoes: "Inscrições",
  em_andamento: "Em andamento",
  concluido: "Concluído",
};

export class TournamentError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

export function newTournament(settings: TournamentSettings): TournamentState {
  return { settings, status: "rascunho", entries: [], leagues: [], matches: [], qualifiedIds: [] };
}

export function registrationIsOpen(state: TournamentState, now = Date.now()) {
  const { opensAt, closesAt } = state.settings;
  return state.status === "inscricoes"
    && (!opensAt || Date.parse(opensAt) <= now)
    && (!closesAt || Date.parse(closesAt) > now);
}

export function isAcceptingInvites(state: TournamentState) {
  return state.status === "rascunho" || state.status === "inscricoes";
}

export function isTournamentActivityAvailable(activity: TournamentActivity) {
  return activity.status === "confirmado" || activity.status === "a_definir";
}

// Agendamentos em lote exigem uma atividade futura. O vínculo manual de uma luta
// aceita as já realizadas, para permitir o lançamento posterior do resultado.
export function isUpcomingTournamentActivity(activity: TournamentActivity, now = Date.now()) {
  return isTournamentActivityAvailable(activity) && Date.parse(activity.starts_at) >= now;
}

export function setTournamentRegistration(state: TournamentState, memberId: string, registered: boolean) {
  const entry = state.entries.find((item) => item.id === memberId);
  if (!entry) throw new TournamentError("O torneio exige um convite do ADM de Atividades.", 403);
  if (!registrationIsOpen(state)) throw new TournamentError("As inscrições estão fechadas.", 409);
  if (entry.registered === registered) return false;
  entry.registered = registered;
  return true;
}

function shuffle<T>(items: T[]): T[] {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const picked = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[picked]] = [shuffled[picked], shuffled[index]];
  }
  return shuffled;
}

function newMatch(stage: MatchStage, round: number, participantIds: TournamentMatch["participantIds"], leagueIndex: number | null = null): TournamentMatch {
  return { id: crypto.randomUUID(), stage, round, leagueIndex, participantIds, activityId: null, postponed: false, result: null };
}

function leagueMatches(league: TournamentLeague, leagueIndex: number) {
  const rotation: Array<string | null> = [...league.participantIds];
  if (rotation.length % 2) rotation.push(null);
  const matches: TournamentMatch[] = [];
  for (let round = 1; round < rotation.length; round++) {
    for (let index = 0; index < rotation.length / 2; index++) {
      const first = rotation[index];
      const second = rotation[rotation.length - 1 - index];
      if (first && second) matches.push(newMatch("liga", round, [first, second], leagueIndex));
    }
    rotation.splice(1, 0, rotation.pop()!);
  }
  return matches;
}

// Mantém as vagas livres nas posições do sorteio. Entre as lutas com dois
// classificados, troca adversários para maximizar os cruzamentos entre ligas.
function crossLeagues(matches: TournamentMatch[], leagues: TournamentLeague[]) {
  const leagueByMember = new Map(leagues.flatMap((league, index) => league.participantIds.map((id) => [id, index] as const)));
  const pairs = matches.filter((match) => match.participantIds.every(Boolean));
  const opponents = pairs.map((match) => match.participantIds[1]!);
  const owners = new Map<number, number>();

  function place(pair: number, tried: Set<number>): boolean {
    const firstLeague = leagueByMember.get(pairs[pair].participantIds[0]!);
    for (let offset = 0; offset < opponents.length; offset++) {
      const index = (pair + offset) % opponents.length;
      if (tried.has(index) || leagueByMember.get(opponents[index]) === firstLeague) continue;
      tried.add(index);
      const owner = owners.get(index);
      if (owner === undefined || place(owner, tried)) {
        owners.set(index, pair);
        return true;
      }
    }
    return false;
  }

  pairs.forEach((_, index) => place(index, new Set()));
  const usedPairs = new Set(owners.values());
  const unplaced = opponents.filter((_, index) => !owners.has(index));
  for (const [opponent, pair] of owners) pairs[pair].participantIds[1] = opponents[opponent];
  pairs.forEach((match, index) => { if (!usedPairs.has(index)) match.participantIds[1] = unplaced.shift()!; });
}

function knockoutMatches(ids: string[], state: TournamentState) {
  let seedOrder = [1, 2];
  for (let size = 4; size / 2 < ids.length; size *= 2) {
    seedOrder = seedOrder.flatMap((seed) => [seed, size + 1 - seed]);
  }
  const firstRound: TournamentMatch[] = [];
  for (let index = 0; index < seedOrder.length; index += 2) {
    const first = ids[seedOrder[index] - 1];
    const second = ids[seedOrder[index + 1] - 1] ?? null;
    const match = newMatch("mata_mata", 1, [first, second]);
    if (!second) match.result = { kind: "vaga_livre", winnerId: first, note: "" };
    firstRound.push(match);
  }
  if (state.leagues.length) crossLeagues(firstRound, state.leagues);
  const matches = [...firstRound];
  let previousRound = firstRound;
  for (let round = 2; previousRound.length > 1; round++) {
    const nextRound: TournamentMatch[] = [];
    for (let index = 0; index < previousRound.length; index += 2) {
      const match = newMatch("mata_mata", round, [null, null]);
      match.previousMatches = [previousRound[index].id, previousRound[index + 1].id];
      nextRound.push(match);
    }
    matches.push(...nextRound);
    previousRound = nextRound;
  }
  const final = matches.at(-1)!;
  if (state.settings.thirdPlace && ids.length >= 4) {
    const third = newMatch("terceiro_lugar", final.round, [null, null]);
    third.previousMatches = final.previousMatches;
    matches.push(third);
  }
  state.matches.push(...matches);
  resolveKnockout(state);
}

function loserOf(match: TournamentMatch) {
  return match.result?.winnerId ? match.participantIds.find((id) => id !== match.result?.winnerId) ?? null : null;
}

function resolveKnockout(state: TournamentState) {
  const byId = new Map(state.matches.map((match) => [match.id, match]));
  for (const match of state.matches) {
    if (!match.previousMatches) continue;
    const advancing = (id: string) => {
      const previous = byId.get(id)!;
      return match.stage === "terceiro_lugar" ? loserOf(previous) : previous.result?.winnerId ?? null;
    };
    match.participantIds = [advancing(match.previousMatches[0]), advancing(match.previousMatches[1])];
  }
}

export function closeTournamentRegistration(state: TournamentState, approvedIds: ReadonlySet<string>) {
  if (state.status !== "inscricoes") throw new TournamentError("Abra as inscrições antes de realizar o sorteio.", 409);
  const entries = state.entries.filter((entry) => approvedIds.has(entry.id));
  const ids = shuffle(entries.filter((entry) => entry.registered).map((entry) => entry.id));
  if (ids.length < 2) throw new TournamentError("O sorteio precisa de pelo menos dois inscritos aprovados.", 409);
  if (state.settings.format === "ligas") {
    const { leagueNames, qualifiersPerLeague } = state.settings;
    if (Math.floor(ids.length / leagueNames.length) < Math.max(2, qualifiersPerLeague)) {
      throw new TournamentError("A quantidade de inscritos é insuficiente para as ligas e vagas configuradas.", 409);
    }
    state.leagues = leagueNames.map((name, index) => ({
      name,
      participantIds: ids.filter((_, seat) => seat % leagueNames.length === index),
    }));
    state.matches = state.leagues.flatMap(leagueMatches);
  } else {
    knockoutMatches(ids, state);
  }
  state.entries = entries;
  state.status = "em_andamento";
}

type Standing = {
  id: string;
  wins: number;
  draws: number;
  losses: number;
  points: number;
  headToHead: number;
};

function compareStandings(first: Standing, second: Standing) {
  return second.points - first.points || second.wins - first.wins || second.headToHead - first.headToHead;
}

export function tournamentStandings(state: TournamentState, leagueIndex: number) {
  const league = state.leagues[leagueIndex];
  const standings = league.participantIds.map((id) => ({ id, wins: 0, draws: 0, losses: 0, points: 0, headToHead: 0 }));
  const byId = new Map(standings.map((row) => [row.id, row]));
  const played = state.matches.filter((match) => match.leagueIndex === leagueIndex && match.stage === "liga" && match.result);
  for (const match of played) {
    for (const id of match.participantIds) {
      const row = byId.get(id!)!;
      if (match.result!.kind === "empate") row.draws++;
      else if (row.id === match.result!.winnerId) row.wins++;
      else row.losses++;
      row.points = row.wins * 3 + row.draws;
    }
  }
  for (const match of played) {
    const first = byId.get(match.participantIds[0]!)!;
    const second = byId.get(match.participantIds[1]!)!;
    if (first.points !== second.points || first.wins !== second.wins) continue;
    if (match.result!.kind === "empate") {
      first.headToHead++;
      second.headToHead++;
    } else {
      byId.get(match.result!.winnerId!)!.headToHead += 3;
    }
  }
  return standings.sort(compareStandings);
}

function advanceLeagues(state: TournamentState) {
  if (state.matches.some((match) => !match.result || match.stage === "mata_mata")) return;
  const places = state.settings.qualifiersPerLeague;
  const playoffEntries: string[][] = [];
  state.leagues.forEach((_, index) => {
    const standings = tournamentStandings(state, index);
    const cutoff = standings[places - 1];
    const above = standings.filter((row) => compareStandings(row, cutoff) < 0);
    const tiebreaks = state.matches.filter((match) => match.stage === "desempate" && match.leagueIndex === index);
    const eliminated = new Set(tiebreaks.map(loserOf));
    const tied = standings.filter((row) => compareStandings(row, cutoff) === 0 && !eliminated.has(row.id));
    const remainingPlaces = places - above.length;
    if (tied.length > remainingPlaces) {
      const fights = Math.min(tied.length - remainingPlaces, Math.floor(tied.length / 2));
      for (let pair = 0; pair < fights; pair++) {
        state.matches.push(newMatch("desempate", 1 + tiebreaks.length, [tied[pair * 2].id, tied[pair * 2 + 1].id], index));
      }
    } else {
      playoffEntries.push([...above, ...tied].map((row) => row.id));
    }
  });
  if (playoffEntries.length === state.leagues.length) {
    const seeds = Array.from({ length: places }, (_, place) => playoffEntries.map((entries) => entries[place])).flat();
    state.qualifiedIds = seeds;
    knockoutMatches(seeds, state);
  }
}

export function tournamentMatchIsReady(state: TournamentState, match: TournamentMatch) {
  if (state.status !== "em_andamento" || match.result || !match.participantIds.every(Boolean)) return false;
  if (match.stage === "mata_mata" || match.stage === "terceiro_lugar") {
    return !state.matches.some((previous) => previous.stage === "mata_mata" && previous.round < match.round && !previous.result);
  }
  return true;
}

function readyMatch(state: TournamentState, matchId: string) {
  const match = state.matches.find((item) => item.id === matchId);
  if (!match) throw new TournamentError("Luta não encontrada.", 404);
  if (!tournamentMatchIsReady(state, match)) throw new TournamentError("Esta luta ainda não está disponível ou já foi concluída.", 409);
  return match;
}

function activityLoads(state: TournamentState, activityId: string, exceptId?: string) {
  const count = new Map<string, number>();
  for (const match of state.matches) {
    if (match.activityId !== activityId || match.id === exceptId) continue;
    for (const id of match.participantIds) if (id) count.set(id, (count.get(id) ?? 0) + 1);
  }
  return count;
}

function canSchedule(state: TournamentState, match: TournamentMatch, loads: Map<string, number>) {
  return match.participantIds.every((id) => id && (loads.get(id) ?? 0) < state.settings.fightsPerActivity);
}

export function scheduleTournamentMatch(state: TournamentState, matchId: string, activityId: string) {
  const match = readyMatch(state, matchId);
  if (!canSchedule(state, match, activityLoads(state, activityId, matchId))) {
    throw new TournamentError("Um dos participantes atingiu o limite de lutas nesta atividade.", 409);
  }
  match.activityId = activityId;
  match.postponed = false;
}

export function distributeTournamentMatches(state: TournamentState, activityId: string) {
  const loads = activityLoads(state, activityId);
  let scheduled = 0;
  const available = state.matches
    .filter((match) => !match.activityId && tournamentMatchIsReady(state, match))
    .sort((first, second) => first.round - second.round);
  for (const match of available) {
    if (!canSchedule(state, match, loads)) continue;
    match.activityId = activityId;
    match.postponed = false;
    for (const id of match.participantIds) if (id) loads.set(id, (loads.get(id) ?? 0) + 1);
    scheduled++;
  }
  return scheduled;
}

export function postponeTournamentMatch(state: TournamentState, matchId: string) {
  const match = readyMatch(state, matchId);
  match.activityId = null;
  match.postponed = true;
}

export function recordTournamentResult(state: TournamentState, matchId: string, result: TournamentResult) {
  const match = readyMatch(state, matchId);
  if (!match.activityId) throw new TournamentError("Vincule a luta a uma atividade antes de registrar o resultado.", 409);
  if (result.kind === "empate") {
    if (match.stage !== "liga") throw new TournamentError("Esta luta precisa de um vencedor.");
  } else if (!result.winnerId || !match.participantIds.includes(result.winnerId)) {
    throw new TournamentError("Selecione um dos participantes da luta como vencedor.");
  }
  match.result = result;
  if (match.stage === "liga" || match.stage === "desempate") advanceLeagues(state);
  else resolveKnockout(state);
  if (state.matches.every((item) => item.result)) state.status = "concluido";
}

export function tournamentPodium(state: TournamentState) {
  if (state.status !== "concluido") return [];
  const knockout = state.matches.filter((match) => match.stage === "mata_mata");
  const final = knockout.at(-1);
  if (!final?.result?.winnerId) return [];
  const runnerUp = loserOf(final);
  const bronzeMatch = state.matches.find((match) => match.stage === "terceiro_lugar");
  const bronze = bronzeMatch?.result?.winnerId
    ?? knockout.filter((match) => match.round === final.round - 1).map(loserOf).find(Boolean);
  return [final.result.winnerId, runnerUp, state.settings.thirdPlace ? bronze : null].filter((id): id is string => Boolean(id));
}
