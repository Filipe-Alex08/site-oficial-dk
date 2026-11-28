import Link from "next/link";
import { ChevronRight, Trophy } from "lucide-react";
import Panel from "@/components/admin/ui/Panel";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import TournamentRegistration from "@/components/member/TournamentRegistration";
import { formatTournamentDate, TournamentStatusBadge } from "@/components/TournamentBoard";
import { registrationIsOpen, tournamentFormatLabels, type TournamentState, type TournamentSummary } from "@/lib/tournaments";

/* Telas de torneio do membro: só apresentação, sem acesso a dados (a página busca e entrega pronto). */

export function TournamentList({ tournaments, invitations }: { tournaments: TournamentSummary[]; invitations: Set<string> }) {
  if (!tournaments.length) return <div className="empty-state"><Trophy aria-hidden="true" /><h2>Nenhum torneio publicado</h2></div>;
  const groups = [
    { label: "Torneios atuais", items: tournaments.filter((item) => item.status !== "concluido") },
    { label: "Histórico", items: tournaments.filter((item) => item.status === "concluido") },
  ];
  return <div className="tournament-stack">
    {groups.filter((group) => group.items.length > 0).map((group) => <Panel key={group.label} title={group.label} flush>
      <ul className="m-attention">{group.items.map((item) => <li key={item.id}>
        <Link className="tournament-link" href={`/membro/torneios?torneio=${item.id}`}>
          <span className="m-attention-icon" aria-hidden="true"><Trophy /></span>
          <span className="m-attention-text"><strong>{item.title}</strong><small>{tournamentFormatLabels[item.format]}</small></span>
          <span className="tournament-tags">
            {invitations.has(item.id) && <StatusBadge status="pendente" label="Convite recebido" />}
            <TournamentStatusBadge status={item.status} />
          </span>
          <ChevronRight aria-hidden="true" />
        </Link>
      </li>)}</ul>
    </Panel>)}
  </div>;
}

/** Cabeçalho do torneio: fase, dados da inscrição e a participação de quem está vendo. */
export function TournamentOverview({ id, state, userId, now }: { id: string; state: TournamentState; userId: string; now: number }) {
  const { settings } = state;
  const invitation = state.entries.find((entry) => entry.id === userId);
  const registering = state.status === "inscricoes";
  const open = registrationIsOpen(state, now);
  const beforeOpening = Boolean(registering && settings.opensAt && Date.parse(settings.opensAt) > now);
  const phase = !registering ? <TournamentStatusBadge status={state.status} />
    : open ? <StatusBadge status="confirmado" label="Inscrições abertas" />
      : beforeOpening ? <StatusBadge status="a_definir" label="Inscrições programadas" />
        : <StatusBadge status="" label="Inscrições encerradas" />;
  const participation = invitation?.registered ? <StatusBadge status="aprovado" label={registering ? "Inscrito" : "Participante"} />
    : !registering ? null
      : invitation ? <StatusBadge status="pendente" label="Convite recebido" />
        : <StatusBadge status="" label="Somente por convite" />;

  return <Panel title={tournamentFormatLabels[settings.format]} actions={phase} flush
    footer={open && invitation ? <TournamentRegistration id={id} registered={invitation.registered} /> : undefined}>
    {settings.description && <p className="tournament-intro tournament-copy">{settings.description}</p>}
    <dl className="stat-list tournament-facts">
      {beforeOpening && settings.opensAt && <div><dt>Abertura das inscrições</dt><dd>{formatTournamentDate(settings.opensAt)}</dd></div>}
      {registering && settings.closesAt && <div><dt>Prazo de inscrição</dt><dd>{formatTournamentDate(settings.closesAt)}</dd></div>}
      {participation && <div><dt>Sua participação</dt><dd>{participation}</dd></div>}
    </dl>
  </Panel>;
}

export function TournamentRoster({ entries, userId }: { entries: TournamentState["entries"]; userId: string }) {
  return <Panel title="Inscritos" description={`${entries.length} ${entries.length === 1 ? "confirmado" : "confirmados"}`} flush={!entries.length}>
    {entries.length > 0
      ? <ul className="tournament-names">{entries.map((entry) => <li key={entry.id}><span className="badge">{entry.nickname}{entry.id === userId ? " (você)" : ""}</span></li>)}</ul>
      : <p className="table-empty">Nenhuma inscrição confirmada.</p>}
  </Panel>;
}
