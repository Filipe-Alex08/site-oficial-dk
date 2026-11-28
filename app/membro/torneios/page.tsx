import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Panel from "@/components/admin/ui/Panel";
import AppPageHeader from "@/components/member/AppPageHeader";
import { TournamentList, TournamentOverview, TournamentRoster } from "@/components/member/TournamentViews";
import Unavailable from "@/components/member/Unavailable";
import TournamentBoard from "@/components/TournamentBoard";
import { createAdminClient } from "@/lib/supabase/admin";
import { findTournament, isTournamentId, listTournaments, tournamentCalendar, tournamentInvitations } from "@/lib/tournament-server";
import { getMember } from "@/lib/viewer";

export const metadata: Metadata = { title: "Torneios internos" };
const home = { label: "Início", href: "/membro" };

export default async function MemberTournamentsPage({ searchParams }: { searchParams: Promise<{ torneio?: string | string[] }> }) {
  const { user, profile, supabase } = await getMember();
  if (!supabase) return <Unavailable />;
  if (!user || profile?.status !== "aprovado") redirect("/area-do-membro/login");
  const admin = createAdminClient();
  if (!admin) return <Unavailable />;
  const { torneio: id } = await searchParams;

  if (id === undefined) {
    const [tournaments, invitations] = await Promise.all([
      listTournaments(admin, false).catch(() => null),
      tournamentInvitations(admin, user.id).catch(() => new Set<string>()),
    ]);
    return <>
      <AppPageHeader title="Torneios" crumbs={[home]} />
      <section className="section"><div className="container">
        {tournaments ? <TournamentList tournaments={tournaments} invitations={invitations} /> : <p className="empty-state" role="alert">Os torneios estão indisponíveis no momento.</p>}
      </div></section>
    </>;
  }

  if (!isTournamentId(id)) notFound();
  const record = await findTournament(admin, id).catch(() => undefined);
  if (record === undefined) return <Unavailable />;
  if (!record || record.state.status === "rascunho") notFound();
  const { state } = record;
  const { settings } = state;
  const activities = await tournamentCalendar(admin, state).catch(() => null);
  const registeredMembers = state.entries.filter((entry) => entry.registered);
  const now = new Date().getTime();

  return <>
    <AppPageHeader title={settings.title} crumbs={[home, { label: "Torneios", href: "/membro/torneios" }]} />
    <section className="section"><div className="container tournament-stack">
      <TournamentOverview id={id} state={state} userId={user.id} now={now} />
      {settings.rules && <Panel title="Regulamento"><p className="tournament-copy">{settings.rules}</p></Panel>}
      <TournamentRoster entries={registeredMembers} userId={user.id} />
      {activities ? <TournamentBoard state={{ ...state, entries: registeredMembers }} activities={activities} viewer={{ id: user.id, at: now }} />
        : <p className="empty-state" role="alert">A agenda do torneio está indisponível no momento.</p>}
    </div></section>
  </>;
}
