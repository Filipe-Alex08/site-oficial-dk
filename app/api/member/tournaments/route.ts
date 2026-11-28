import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest, notConfigured } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { findTournament, isTournamentId, saveTournament, tournamentApiError } from "@/lib/tournament-server";
import { setTournamentRegistration, TournamentError } from "@/lib/tournaments";
import { getMember } from "@/lib/viewer";

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();
  const { user, profile } = await getMember();
  if (!user || profile?.status !== "aprovado") return NextResponse.json({ error: "Acesso restrito a membros aprovados." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return notConfigured();
  try {
    const body = await request.json().catch(() => null) as Record<string, unknown> | null;
    if (!isTournamentId(body?.id) || typeof body.registered !== "boolean") throw new TournamentError("Inscrição inválida.");
    // Outra inscrição pode chegar entre a leitura e a gravação. A nova leitura
    // verifica de novo o convite, o prazo e se o sorteio já ocorreu.
    for (let attempt = 0; attempt < 3; attempt++) {
      const tournament = await findTournament(admin, body.id);
      if (!tournament || tournament.state.status === "rascunho") throw new TournamentError("Torneio não encontrado.", 404);
      const changed = setTournamentRegistration(tournament.state, user.id, body.registered);
      if (!changed || await saveTournament(admin, tournament)) return NextResponse.json({ success: true });
    }
    throw new TournamentError("O torneio está recebendo outras inscrições. Tente novamente.", 409);
  } catch (error) {
    return tournamentApiError(error);
  }
}
