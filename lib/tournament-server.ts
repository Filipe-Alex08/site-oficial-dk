import { NextResponse } from "next/server";
import type { createAdminClient } from "@/lib/supabase/admin";
import {
  closeTournamentRegistration,
  distributeTournamentMatches,
  isAcceptingInvites,
  isTournamentActivityAvailable,
  isUpcomingTournamentActivity,
  newTournament,
  postponeTournamentMatch,
  recordTournamentResult,
  scheduleTournamentMatch,
  TournamentError,
  type TournamentActivity,
  type TournamentMember,
  type TournamentRecord,
  type TournamentResult,
  type TournamentSettings,
  type TournamentState,
  type TournamentSummary,
} from "@/lib/tournaments";

type AdminClient = NonNullable<ReturnType<typeof createAdminClient>>;
const recordFields = "id,revision,state";
const activityFields = "id,title,starts_at,location,status";

export function isTournamentId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

function textField(value: unknown, limit: number) {
  if (typeof value !== "string" || value.trim().length > limit) throw new TournamentError("Revise os campos de texto do torneio.");
  return value.trim();
}

function instant(value: unknown) {
  if (value === null) return null;
  if (typeof value !== "string" || !Number.isFinite(Date.parse(value))) {
    throw new TournamentError("Informe uma data de inscrição válida.");
  }
  return new Date(value).toISOString();
}

export function parseTournamentSettings(value: unknown): TournamentSettings {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TournamentError("Informe os dados do torneio.");
  const data = value as Record<string, unknown>;
  const title = textField(data.title, 120);
  const description = textField(data.description, 3000);
  const rules = textField(data.rules, 6000);
  const { format, thirdPlace, firstActivityId, fightsPerActivity } = data;
  if (!title || (format !== "mata_mata" && format !== "ligas") || typeof thirdPlace !== "boolean") {
    throw new TournamentError("Informe o nome e o formato do torneio.");
  }
  if (typeof fightsPerActivity !== "number" || !Number.isSafeInteger(fightsPerActivity) || fightsPerActivity < 1) {
    throw new TournamentError("Informe pelo menos uma luta por participante em cada atividade.");
  }
  if (firstActivityId !== null && !isTournamentId(firstActivityId)) throw new TournamentError("Selecione uma atividade válida.");
  const opensAt = instant(data.opensAt);
  const closesAt = instant(data.closesAt);
  if (opensAt && closesAt && Date.parse(closesAt) <= Date.parse(opensAt)) {
    throw new TournamentError("O encerramento deve ser posterior à abertura das inscrições.");
  }

  let leagueNames: string[] = [];
  let qualifiersPerLeague = 1;
  if (format === "ligas") {
    leagueNames = Array.isArray(data.leagueNames) ? data.leagueNames.map((name) => textField(name, 60)) : [];
    const uniqueNames = new Set(leagueNames.map((name) => name.toLocaleLowerCase("pt-BR")));
    if (leagueNames.length < 2 || uniqueNames.size !== leagueNames.length || leagueNames.some((name) => !name)) {
      throw new TournamentError("Informe pelo menos duas ligas com nomes distintos.");
    }
    if (typeof data.qualifiersPerLeague !== "number" || !Number.isSafeInteger(data.qualifiersPerLeague) || data.qualifiersPerLeague < 1) {
      throw new TournamentError("Informe pelo menos um classificado por liga.");
    }
    qualifiersPerLeague = data.qualifiersPerLeague;
  }
  return { title, description, rules, format, opensAt, closesAt, fightsPerActivity, leagueNames, qualifiersPerLeague, thirdPlace, firstActivityId };
}

export async function listTournaments(admin: AdminClient, includeDrafts: boolean): Promise<TournamentSummary[]> {
  const query = admin.from("tournaments").select("id,title,format,status").order("created_at", { ascending: false });
  const { data, error } = await (includeDrafts ? query : query.neq("status", "rascunho"));
  if (error) throw error;
  return (data ?? []) as TournamentSummary[];
}

export async function tournamentInvitations(admin: AdminClient, memberId: string) {
  const { data, error } = await admin.from("tournaments").select("id")
    .eq("status", "inscricoes").contains("state", { entries: [{ id: memberId, registered: false }] });
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.id as string));
}

export async function findTournament(admin: AdminClient, id: string): Promise<TournamentRecord | null> {
  const { data, error } = await admin.from("tournaments").select(recordFields).eq("id", id).maybeSingle();
  if (error) throw error;
  return data as TournamentRecord | null;
}

export async function listTournamentMembers(admin: AdminClient) {
  const members: TournamentMember[] = [];
  const pageSize = 500;
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await admin.from("profiles").select("id,nickname")
      .eq("status", "aprovado").order("id").range(offset, offset + pageSize - 1);
    if (error) throw error;
    members.push(...(data ?? []));
    if (!data || data.length < pageSize) break;
  }
  return members.sort((first, second) => first.nickname.localeCompare(second.nickname, "pt-BR"));
}

export async function tournamentCalendar(admin: AdminClient, state: TournamentState) {
  const ids = [...new Set(state.matches.flatMap((match) => match.activityId ? [match.activityId] : []))];
  const activities: TournamentActivity[] = [];
  for (let offset = 0; offset < ids.length; offset += 100) {
    const { data, error } = await admin.from("activities").select(activityFields).in("id", ids.slice(offset, offset + 100));
    if (error) throw error;
    activities.push(...(data ?? []) as TournamentActivity[]);
  }
  return activities;
}

async function activityForTournament(admin: AdminClient, id: string) {
  const { data, error } = await admin.from("activities").select(activityFields).eq("id", id).maybeSingle();
  if (error) throw error;
  return data as TournamentActivity | null;
}

async function requireAvailableActivity(admin: AdminClient, id: unknown) {
  if (!isTournamentId(id)) throw new TournamentError("Selecione uma atividade do calendário.");
  const activity = await activityForTournament(admin, id);
  if (!activity || !isTournamentActivityAvailable(activity)) {
    throw new TournamentError("A atividade selecionada está indisponível. Escolha outra atividade no calendário.", 409);
  }
  return activity;
}

async function requireUpcomingActivity(admin: AdminClient, id: unknown) {
  const activity = await requireAvailableActivity(admin, id);
  if (!isUpcomingTournamentActivity(activity)) {
    throw new TournamentError("A atividade selecionada já aconteceu. Escolha uma atividade futura.", 409);
  }
  return activity;
}

export async function createTournament(admin: AdminClient, actorId: string, value: unknown) {
  const settings = parseTournamentSettings(value);
  if (settings.firstActivityId) await requireUpcomingActivity(admin, settings.firstActivityId);
  const { data, error } = await admin.from("tournaments")
    .insert({ state: newTournament(settings), created_by: actorId })
    .select(recordFields)
    .single();
  if (error) throw error;
  return data as TournamentRecord;
}

export async function saveTournament(admin: AdminClient, tournament: TournamentRecord) {
  const { data, error } = await admin.from("tournaments")
    .update({ state: tournament.state, revision: tournament.revision + 1 })
    .eq("id", tournament.id).eq("revision", tournament.revision)
    .select(recordFields).maybeSingle();
  if (error) throw error;
  return data as TournamentRecord | null;
}

function requireInvitesOpen(state: TournamentState) {
  if (!isAcceptingInvites(state)) throw new TournamentError("Os participantes já foram sorteados.", 409);
}

function readResult(value: unknown): TournamentResult {
  if (!value || typeof value !== "object") throw new TournamentError("Informe o resultado da luta.");
  const { kind, winnerId, note } = value as Record<string, unknown>;
  if (kind !== "vitoria" && kind !== "empate" && kind !== "wo") throw new TournamentError("Resultado inválido.");
  if (kind !== "empate" && !isTournamentId(winnerId)) throw new TournamentError("Informe o vencedor.");
  return { kind, winnerId: kind === "empate" ? null : winnerId as string, note: textField(note, 500) };
}

export async function applyTournamentAction(admin: AdminClient, state: TournamentState, data: Record<string, unknown>) {
  switch (data.action) {
    case "settings": {
      requireInvitesOpen(state);
      const settings = parseTournamentSettings(data.settings);
      if (settings.firstActivityId) {
        // A escolha já salva pode ter passado sem impedir a edição dos demais campos.
        const unchanged = settings.firstActivityId === state.settings.firstActivityId;
        await (unchanged ? requireAvailableActivity : requireUpcomingActivity)(admin, settings.firstActivityId);
      }
      state.settings = settings;
      return { action: "editar_torneio", details: { title: settings.title }, message: "Configuração do torneio atualizada." };
    }
    case "invite": {
      requireInvitesOpen(state);
      if (!Array.isArray(data.memberIds) || !data.memberIds.length || !data.memberIds.every(isTournamentId)) {
        throw new TournamentError("Selecione pelo menos um integrante aprovado.");
      }
      const members = new Map((await listTournamentMembers(admin)).map((member) => [member.id, member]));
      const existing = new Set(state.entries.map((entry) => entry.id));
      const invited = [...new Set<string>(data.memberIds)].filter((id) => !existing.has(id));
      if (invited.some((id) => !members.has(id))) throw new TournamentError("Um dos integrantes selecionados já não está aprovado.", 409);
      for (const id of invited) state.entries.push({ ...members.get(id)!, registered: false });
      return { action: "convidar_torneio", details: { member_ids: invited }, message: "Convites registrados na área dos membros." };
    }
    case "remove_invite": {
      requireInvitesOpen(state);
      const memberId = data.memberId;
      if (!state.entries.some((entry) => entry.id === memberId)) throw new TournamentError("Convite não encontrado.", 404);
      state.entries = state.entries.filter((entry) => entry.id !== memberId);
      return { action: "remover_convite_torneio", details: { member_id: memberId }, message: "Convite retirado." };
    }
    case "open": {
      if (state.status !== "rascunho") throw new TournamentError("O torneio já foi aberto.", 409);
      if (state.settings.closesAt && Date.parse(state.settings.closesAt) <= Date.now()) {
        throw new TournamentError("Atualize o prazo de encerramento antes de abrir as inscrições.");
      }
      state.status = "inscricoes";
      return { action: "abrir_inscricoes_torneio", details: {}, message: "Torneio publicado na área do membro." };
    }
    case "close": {
      const members = await listTournamentMembers(admin);
      closeTournamentRegistration(state, new Set(members.map((member) => member.id)));
      const firstActivity = state.settings.firstActivityId ? await activityForTournament(admin, state.settings.firstActivityId) : null;
      const scheduled = firstActivity && isUpcomingTournamentActivity(firstActivity) ? distributeTournamentMatches(state, firstActivity.id) : 0;
      return {
        action: "sortear_torneio",
        details: { inscritos: state.entries.filter((entry) => entry.registered).length, lutas_agendadas: scheduled },
        message: scheduled ? "Inscrições encerradas, sorteio realizado e primeiras lutas agendadas." : "Inscrições encerradas e sorteio realizado.",
      };
    }
    case "distribute": {
      const activity = await requireUpcomingActivity(admin, data.activityId);
      const scheduled = distributeTournamentMatches(state, activity.id);
      if (!scheduled) throw new TournamentError("Não há lutas disponíveis que caibam no limite desta atividade.", 409);
      return { action: "distribuir_lutas", details: { activity_id: activity.id, lutas: scheduled }, message: `${scheduled} luta(s) vinculada(s) à atividade.` };
    }
    case "schedule": {
      if (!isTournamentId(data.matchId)) throw new TournamentError("Luta inválida.");
      const activity = await requireAvailableActivity(admin, data.activityId);
      scheduleTournamentMatch(state, data.matchId, activity.id);
      return { action: "agendar_luta", details: { match_id: data.matchId, activity_id: activity.id }, message: "Luta vinculada à atividade." };
    }
    case "postpone": {
      if (!isTournamentId(data.matchId)) throw new TournamentError("Luta inválida.");
      postponeTournamentMatch(state, data.matchId);
      return { action: "adiar_luta", details: { match_id: data.matchId }, message: "Luta adiada e liberada para reagendamento." };
    }
    case "result": {
      if (!isTournamentId(data.matchId)) throw new TournamentError("Luta inválida.");
      const result = readResult(data.result);
      const match = state.matches.find((item) => item.id === data.matchId);
      if (match?.activityId) {
        const activity = await activityForTournament(admin, match.activityId);
        if (!activity || activity.status === "cancelado" || activity.status === "adiado") {
          throw new TournamentError("Vincule a luta a uma atividade válida antes de lançar o resultado.", 409);
        }
      }
      recordTournamentResult(state, data.matchId, result);
      return { action: "resultado_luta", details: { match_id: data.matchId, resultado: result.kind, vencedor: result.winnerId }, message: "Resultado registrado." };
    }
    default:
      throw new TournamentError("Ação inválida para o torneio.");
  }
}

export function tournamentApiError(error: unknown) {
  if (error instanceof TournamentError) return NextResponse.json({ error: error.message }, { status: error.status });
  console.error("Falha no módulo de torneios", error);
  return NextResponse.json({ error: "Não foi possível concluir a operação do torneio." }, { status: 500 });
}
