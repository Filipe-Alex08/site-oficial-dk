import Link from "next/link";
import type { ReactNode } from "react";
import DataTable, { type Column } from "@/components/admin/ui/DataTable";
import Panel from "@/components/admin/ui/Panel";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import InfoTip from "@/components/ui/InfoTip";
import {
  tournamentMatchIsReady,
  tournamentPodium,
  tournamentStandings,
  tournamentStatusLabels,
  type TournamentActivity,
  type TournamentMatch,
  type TournamentState,
  type TournamentStatus,
} from "@/lib/tournaments";

const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export function formatTournamentDate(value: string) {
  return dateTime.format(new Date(value));
}

/** Cores dos selos do site (`.badge.<situação>`) para cada fase do torneio. */
const statusTones: Record<TournamentStatus, string> = {
  rascunho: "a_definir",
  inscricoes: "confirmado",
  em_andamento: "finalizado",
  concluido: "",
};

export function TournamentStatusBadge({ status }: { status: TournamentStatus }) {
  return <StatusBadge status={statusTones[status]} label={tournamentStatusLabels[status]} />;
}

export function tournamentParticipant(state: TournamentState, id: string | null) {
  return state.entries.find((entry) => entry.id === id)?.nickname ?? "A definir";
}

export function tournamentMatchName(state: TournamentState, match: TournamentMatch) {
  if (match.result?.kind === "vaga_livre") return `${tournamentParticipant(state, match.participantIds[0])} · vaga livre`;
  return match.participantIds.map((id) => tournamentParticipant(state, id)).join(" × ");
}

function matchResult(state: TournamentState, match: TournamentMatch) {
  if (!match.result) {
    if (match.postponed) return <StatusBadge status="adiado" label="Adiada" />;
    if (!tournamentMatchIsReady(state, match)) return <span className="muted-text">Aguardando fase anterior</span>;
    return match.activityId
      ? <StatusBadge status="pendente" label="Aguardando resultado" />
      : <StatusBadge status="" label="Aguardando agendamento" />;
  }
  const winner = tournamentParticipant(state, match.result.winnerId);
  const label = { empate: "Empate", wo: `${winner} venceu por W.O.`, vaga_livre: `${winner} avançou`, vitoria: `${winner} venceu` }[match.result.kind];
  return <>{label}{match.result.note && <small className="tournament-copy">{match.result.note}</small>}</>;
}

function MatchActivity({ match, activity, link }: { match: TournamentMatch; activity?: TournamentActivity; link: boolean }) {
  if (!activity) return match.activityId ? "Atividade removida" : <span className="muted-text">—</span>;
  const info = <>{activity.title}<small>{formatTournamentDate(activity.starts_at)} · {activity.location}</small></>;
  return <>
    {link
      ? <Link href={`/membro/atividades#activity-${activity.id}`}>{info}</Link>
      : info}
    {(activity.status === "cancelado" || activity.status === "adiado") && <small><StatusBadge status={activity.status} label={activity.status === "cancelado" ? "Atividade cancelada" : "Atividade adiada"} /></small>}
  </>;
}

export default function TournamentBoard({ state, activities, viewer, actions }: {
  state: TournamentState;
  activities: TournamentActivity[];
  viewer?: { id: string; at: number };
  actions?: (match: TournamentMatch) => ReactNode;
}) {
  const activityById = new Map(activities.map((activity) => [activity.id, activity]));
  const podium = tournamentPodium(state);
  const mine = viewer ? state.matches.filter((match) => {
    const activity = match.activityId ? activityById.get(match.activityId) : undefined;
    return match.participantIds.includes(viewer.id) && tournamentMatchIsReady(state, match) && activity
      && activity.status !== "cancelado" && activity.status !== "adiado" && Date.parse(activity.starts_at) >= viewer.at;
  }) : [];
  const finalRound = state.matches.reduce((round, match) => match.stage === "mata_mata" ? Math.max(round, match.round) : round, 0);
  const knockout = state.matches.filter((match) => match.stage === "mata_mata" || match.stage === "terceiro_lugar");
  const matchNumber = new Map(knockout.map((match, index) => [match.id, index + 1]));

  function matchTable(matches: TournamentMatch[], label: string, labelMatch: (match: TournamentMatch) => ReactNode) {
    const columns: Column<TournamentMatch>[] = [
      {
        key: "match", header: "Confronto", hideLabel: true, className: "is-lead",
        render: (match) => <><strong>{tournamentMatchName(state, match)}</strong>{match.previousMatches && !match.participantIds.every(Boolean) && <small>
          {match.stage === "terceiro_lugar" ? "Derrotados" : "Vencedores"} das lutas {match.previousMatches.map((id) => matchNumber.get(id)).join(" e ")}
        </small>}</>,
      },
      { key: "stage", header: "Fase", render: labelMatch },
      {
        key: "activity", header: "Atividade",
        render: (match) => {
          const activity = match.activityId ? activityById.get(match.activityId) : undefined;
          return <MatchActivity match={match} activity={activity} link={Boolean(viewer && activity && Date.parse(activity.starts_at) >= viewer.at)} />;
        },
      },
      { key: "result", header: "Resultado", render: (match) => matchResult(state, match) },
      ...(actions ? [{ key: "actions", header: "Ações", srOnlyHeader: true, className: "row-actions", render: actions }] : []),
    ];
    return <div className="tournament-matches"><DataTable columns={columns} rows={matches} rowKey={(match) => match.id} empty="Nenhuma luta." caption={label} /></div>;
  }

  return <div className="tournament-stack">
    {podium.length > 0 && <Panel title="Pódio" flush>
      <dl className="stat-list tournament-facts">{podium.map((id, index) => <div key={id}><dt>{index + 1}º lugar</dt><dd>{tournamentParticipant(state, id)}</dd></div>)}</dl>
    </Panel>}
    {mine.length > 0 && <Panel title="Meus próximos confrontos" flush>{matchTable(mine, "Meus próximos confrontos", (match) => match.leagueIndex === null ? "Mata-mata" : state.leagues[match.leagueIndex].name)}</Panel>}
    {state.leagues.length > 0 && <Panel flush title={<span className="title-tip">Classificação<InfoTip label="Como a classificação é calculada">Vitória vale 3 pontos, empate vale 1 e derrota vale 0. Em caso de empate nas vagas, valem as vitórias, o confronto direto e, se necessário, uma luta extra.</InfoTip></span>}>
      <div className="tournament-standings">{state.leagues.map((league, index) => <section key={league.name}>
        <h4>{league.name}</h4>
        <table aria-label={`Classificação de ${league.name}`}>
          <thead><tr><th scope="col">Integrante</th><th scope="col" title="Vitórias" aria-label="Vitórias">V</th><th scope="col" title="Empates" aria-label="Empates">E</th><th scope="col" title="Derrotas" aria-label="Derrotas">D</th><th scope="col" title="Pontos" aria-label="Pontos">Pts</th></tr></thead>
          <tbody>{tournamentStandings(state, index).map((row) => <tr key={row.id}>
            <td>{tournamentParticipant(state, row.id)}{state.qualifiedIds.includes(row.id) && <small><StatusBadge status="aprovado" label="Classificado" /></small>}</td>
            <td>{row.wins}</td><td>{row.draws}</td><td>{row.losses}</td><td><strong>{row.points}</strong></td>
          </tr>)}</tbody>
        </table>
      </section>)}</div>
    </Panel>}
    {state.leagues.map((league, index) => <Panel key={league.name} title={`Confrontos · ${league.name}`} flush>
      {matchTable(state.matches.filter((match) => match.leagueIndex === index), `Lutas de ${league.name}`, (match) => match.stage === "desempate" ? "Desempate" : `Rodada ${match.round}`)}
    </Panel>)}
    {knockout.length > 0 && <Panel title="Chaveamento" flush>{matchTable(knockout, "Chaveamento do mata-mata", (match) => {
      const remaining = finalRound - match.round;
      const name = match.stage === "terceiro_lugar" ? "Terceiro lugar"
        : ["Final", "Semifinal", "Quartas de final", "Oitavas de final"][remaining] ?? `Fase ${match.round}`;
      return <>{name}<small>Luta {matchNumber.get(match.id)}</small></>;
    })}</Panel>}
  </div>;
}
