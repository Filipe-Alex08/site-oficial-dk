import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Trophy } from "lucide-react";
import Panel from "@/components/admin/ui/Panel";
import AppPageHeader from "@/components/member/AppPageHeader";
import TournamentRegistration from "@/components/member/TournamentRegistration";
import Unavailable from "@/components/member/Unavailable";
import TournamentBoard, { formatTournamentDate } from "@/components/TournamentBoard";
import { createAdminClient } from "@/lib/supabase/admin";
import { findTournament, isTournamentId, listTournaments, tournamentCalendar, tournamentInvitations } from "@/lib/tournament-server";
import { registrationIsOpen, tournamentFormatLabels, tournamentStatusLabels, type TournamentSummary } from "@/lib/tournaments";
import { getMember } from "@/lib/viewer";

export const metadata: Metadata = { title: "Torneios internos" };
const home = { label: "Início", href: "/membro" };

function TournamentList({ tournaments, invitations }: { tournaments: TournamentSummary[]; invitations: Set<string> }) {
  const groups = [
    { label: "Torneios atuais", items: tournaments.filter((item) => item.status !== "concluido") },
    { label: "Histórico", items: tournaments.filter((item) => item.status === "concluido") },
  ];
  return <div className="tournament-stack">
    {groups.filter((group) => group.items.length > 0).map((group) => <Panel key={group.label} title={group.label}>
      <ul className="tournament-list">{group.items.map((item) => <li key={item.id}>
        <Link href={`/membro/torneios?torneio=${item.id}`}><Trophy aria-hidden="true" /><span><strong>{item.title}</strong><small>{tournamentFormatLabels[item.format]} · {tournamentStatusLabels[item.status]}</small>{invitations.has(item.id) && <small>Convite recebido</small>}</span></Link>
      </li>)}</ul>
    </Panel>)}
    {tournaments.length === 0 && <Panel title="Nenhum torneio publicado"><p>Quando o DK abrir um torneio interno, ele aparecerá aqui.</p></Panel>}
  </div>;
}

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
        {tournaments ? <TournamentList tournaments={tournaments} invitations={invitations} /> : <p role="alert">Os torneios estão indisponíveis no momento.</p>}
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
  const invitation = state.entries.find((entry) => entry.id === user.id);
  const registeredMembers = state.entries.filter((entry) => entry.registered);
  const now = new Date().getTime();
  const open = registrationIsOpen(state, now);
  const beforeOpening = settings.opensAt && Date.parse(settings.opensAt) > now;
  const label = state.status === "inscricoes" ? (open ? "Inscrições abertas" : beforeOpening ? "Inscrições programadas" : "Inscrições encerradas") : tournamentStatusLabels[state.status];

  return <>
    <AppPageHeader title={settings.title} crumbs={[home, { label: "Torneios", href: "/membro/torneios" }]} />
    <section className="section"><div className="container tournament-stack">
      <Panel title={tournamentFormatLabels[settings.format]} description={label}>
        {settings.description && <p className="tournament-copy">{settings.description}</p>}
        {state.status === "inscricoes" && <div className="tournament-stack">
          {settings.opensAt && beforeOpening && <p>Abertura em {formatTournamentDate(settings.opensAt)}.</p>}
          {settings.closesAt && <p>Prazo para inscrição em {formatTournamentDate(settings.closesAt)}.</p>}
          {invitation?.registered && <p>Você está inscrito.</p>}
          {open && !invitation && <p>As inscrições são por convite do ADM de Atividades.</p>}
          {open && invitation && <div><TournamentRegistration id={id} registered={invitation.registered} /></div>}
          {!open && !beforeOpening && <p>O chaveamento aparecerá após o sorteio.</p>}
        </div>}
        {state.status !== "inscricoes" && invitation?.registered && <p>Você é um dos participantes.</p>}
      </Panel>
      {settings.rules && <Panel title="Regulamento"><p className="tournament-copy">{settings.rules}</p></Panel>}
      <Panel title={`Inscritos (${registeredMembers.length})`}>
        {registeredMembers.length > 0 ? <ul className="tournament-names">{registeredMembers.map((entry) => <li key={entry.id}>{entry.nickname}{entry.id === user.id ? " (você)" : ""}</li>)}</ul> : <p>Nenhuma inscrição confirmada.</p>}
      </Panel>
      {activities ? <TournamentBoard state={{ ...state, entries: registeredMembers }} activities={activities} viewer={{ id: user.id, at: now }} />
        : <p role="alert">A agenda do torneio está indisponível no momento.</p>}
    </div></section>
  </>;
}
