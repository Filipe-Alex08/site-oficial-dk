import Link from "next/link";
import type { ReactNode } from "react";
import Panel from "@/components/admin/ui/Panel";
import {
  tournamentMatchIsReady,
  tournamentPodium,
  tournamentStandings,
  type TournamentActivity,
  type TournamentMatch,
  type TournamentState,
} from "@/lib/tournaments";

const dateTime = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

export function formatTournamentDate(value: string) {
  return dateTime.format(new Date(value));
}

export function tournamentParticipant(state: TournamentState, id: string | null) {
  return state.entries.find((entry) => entry.id === id)?.nickname ?? "A definir";
}

export function tournamentMatchName(state: TournamentState, match: TournamentMatch) {
  if (match.result?.kind === "vaga_livre") return `${tournamentParticipant(state, match.participantIds[0])} · vaga livre`;
  return match.participantIds.map((id) => tournamentParticipant(state, id)).join(" × ");
}

function resultLabel(state: TournamentState, match: TournamentMatch) {
  if (!match.result) {
    if (match.postponed) return "Adiada";
    if (!tournamentMatchIsReady(state, match)) return "Aguardando fase anterior";
    return match.activityId ? "Aguardando resultado" : "Aguardando agendamento";
  }
  const winner = tournamentParticipant(state, match.result.winnerId);
  switch (match.result.kind) {
    case "empate": return "Empate";
    case "wo": return `${winner} venceu por W.O.`;
    case "vaga_livre": return `${winner} avançou`;
    case "vitoria": return `${winner} venceu`;
  }
}

function MatchActivity({ match, activity, link }: { match: TournamentMatch; activity?: TournamentActivity; link: boolean }) {
  if (!activity) return match.activityId ? "Atividade removida" : "—";
  const info = <>{activity.title}<small>{formatTournamentDate(activity.starts_at)} · {activity.location}</small></>;
  return <>
    {link
      ? <Link href={`/membro/atividades#activity-${activity.id}`}>{info}</Link>
      : info}
    {activity.status === "cancelado" && <small>Atividade cancelada</small>}
    {activity.status === "adiado" && <small>Atividade adiada</small>}
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
    return <div className="table-wrap tournament-table"><table aria-label={label}>
      <thead><tr><th scope="col">Fase</th><th scope="col">Confronto</th><th scope="col">Atividade</th><th scope="col">Resultado</th>{actions && <th scope="col">Ações</th>}</tr></thead>
      <tbody>{matches.map((match) => {
        const activity = match.activityId ? activityById.get(match.activityId) : undefined;
        const link = Boolean(viewer && activity && Date.parse(activity.starts_at) >= viewer.at);
        return <tr key={match.id}>
          <td>{labelMatch(match)}</td>
          <td><strong>{tournamentMatchName(state, match)}</strong>{match.previousMatches && !match.participantIds.every(Boolean) && <small>
            {match.stage === "terceiro_lugar" ? "Derrotados" : "Vencedores"} das lutas {match.previousMatches.map((id) => matchNumber.get(id)).join(" e ")}
          </small>}</td>
          <td><MatchActivity match={match} activity={activity} link={link} /></td>
          <td>{resultLabel(state, match)}{match.result?.note && <small className="tournament-copy">{match.result.note}</small>}</td>
          {actions && <td>{actions(match)}</td>}
        </tr>;
      })}</tbody>
    </table></div>;
  }

  return <div className="tournament-stack">
    {podium.length > 0 && <Panel title="Pódio">
      <ol className="tournament-podium">{podium.map((id, index) => <li key={id}><span>{index + 1}º lugar</span><strong>{tournamentParticipant(state, id)}</strong></li>)}</ol>
    </Panel>}
    {mine.length > 0 && <Panel title="Meus próximos confrontos" flush>{matchTable(mine, "Meus próximos confrontos", (match) => match.leagueIndex === null ? "Mata-mata" : state.leagues[match.leagueIndex].name)}</Panel>}
    {state.leagues.length > 0 && <Panel title="Classificação" description="Vitória vale 3 pontos, empate vale 1 e derrota vale 0. Em caso de empate nas vagas, valem as vitórias, o confronto direto e, se necessário, uma luta extra.">
      <div className="tournament-standings">{state.leagues.map((league, index) => <section key={league.name}>
        <h4>{league.name}</h4>
        <div className="table-wrap tournament-standing"><table aria-label={`Classificação de ${league.name}`}>
          <thead><tr><th scope="col">Integrante</th><th scope="col" title="Vitórias">V</th><th scope="col" title="Empates">E</th><th scope="col" title="Derrotas">D</th><th scope="col">Pontos</th></tr></thead>
          <tbody>{tournamentStandings(state, index).map((row) => <tr key={row.id}>
            <td>{tournamentParticipant(state, row.id)}{state.qualifiedIds.includes(row.id) && <small>Classificado</small>}</td>
            <td>{row.wins}</td><td>{row.draws}</td><td>{row.losses}</td><td><strong>{row.points}</strong></td>
          </tr>)}</tbody>
        </table></div>
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
