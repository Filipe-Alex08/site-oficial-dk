import { NextResponse } from "next/server";
import { logAdminAudit } from "@/lib/admin-audit";
import { requireAdmin } from "@/lib/admin-auth";
import { forbidden, isSameOriginRequest, notConfigured } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  applyTournamentAction, createTournament, findTournament, isTournamentId,
  listTournamentMembers, listTournaments, saveTournament, tournamentApiError,
} from "@/lib/tournament-server";
import { isAcceptingInvites, TournamentError } from "@/lib/tournaments";

const noStore = { headers: { "Cache-Control": "no-store" } };
const denied = () => NextResponse.json({ error: "Acesso permitido ao ADM Principal ou ADM de Atividades." }, { status: 403 });
const changed = () => new TournamentError("O torneio foi atualizado. Confira os dados e tente novamente.", 409);

export async function GET(request: Request) {
  if (!(await requireAdmin(["atividades"]))) return denied();
  const admin = createAdminClient();
  if (!admin) return notConfigured();
  const id = new URL(request.url).searchParams.get("id");
  try {
    if (id === null) return NextResponse.json({ tournaments: await listTournaments(admin, true) }, noStore);
    if (!isTournamentId(id)) throw new TournamentError("Torneio inválido.");
    const tournament = await findTournament(admin, id);
    if (!tournament) throw new TournamentError("Torneio não encontrado.", 404);
    const members = isAcceptingInvites(tournament.state) ? await listTournamentMembers(admin) : [];
    return NextResponse.json({ tournament, members }, noStore);
  } catch (error) {
    return tournamentApiError(error);
  }
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();
  const caller = await requireAdmin(["atividades"]);
  if (!caller) return denied();
  const admin = createAdminClient();
  if (!admin) return notConfigured();
  try {
    const tournament = await createTournament(admin, caller.user.id, await request.json().catch(() => null));
    await logAdminAudit(caller.user.id, "tournaments", tournament.id, "criar_torneio", { title: tournament.state.settings.title });
    return NextResponse.json({ tournament, message: "Torneio criado." }, { ...noStore, status: 201 });
  } catch (error) {
    return tournamentApiError(error);
  }
}

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();
  const caller = await requireAdmin(["atividades"]);
  if (!caller) return denied();
  const admin = createAdminClient();
  if (!admin) return notConfigured();
  try {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!isTournamentId(body?.id) || !Number.isSafeInteger(body?.revision)) throw new TournamentError("Torneio inválido.");
    const record = await findTournament(admin, body.id);
    if (!record) throw new TournamentError("Torneio não encontrado.", 404);
    if (record.revision !== body.revision) throw changed();
    const { action, details, message } = await applyTournamentAction(admin, record.state, body);
    const tournament = await saveTournament(admin, record);
    if (!tournament) throw changed();
    await logAdminAudit(caller.user.id, "tournaments", tournament.id, action, details);
    return NextResponse.json({ tournament, message }, noStore);
  } catch (error) {
    return tournamentApiError(error);
  }
}
