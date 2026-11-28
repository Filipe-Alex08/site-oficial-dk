"use client";

import { useState } from "react";
import AdminDialog from "@/components/admin/AdminDialog";
import Select, { type SelectOption } from "@/components/ui/Select";
import { tournamentMatchName, tournamentParticipant } from "@/components/TournamentBoard";
import type { TournamentAdminAction, TournamentMatch, TournamentResult, TournamentState } from "@/lib/tournaments";

export default function TournamentMatchDialog({ mode, match, state, activityOptions, busy, onAction, onClose }: {
  mode: "schedule" | "result";
  match: TournamentMatch;
  state: TournamentState;
  activityOptions: SelectOption[];
  busy: boolean;
  onAction: (action: TournamentAdminAction) => Promise<boolean>;
  onClose: () => void;
}) {
  const [activityId, setActivityId] = useState(match.activityId ?? "");
  const [kind, setKind] = useState<TournamentResult["kind"]>("vitoria");
  const [winnerId, setWinnerId] = useState("");
  const [note, setNote] = useState("");
  const resultOptions = [
    { value: "vitoria", label: "Vitória" },
    { value: "wo", label: "Vitória por W.O." },
    ...(match.stage === "liga" ? [{ value: "empate", label: "Empate" }] : []),
  ];
  const winnerOptions = [{ value: "", label: "Selecione o vencedor" }, ...match.participantIds.flatMap((id) => id ? [{ value: id, label: tournamentParticipant(state, id) }] : [])];
  const invalid = mode === "schedule" ? !activityOptions.some((option) => option.value === activityId) : kind !== "empate" && !winnerId;

  return <AdminDialog title={mode === "schedule" ? "Vincular luta ao calendário" : "Registrar resultado"} description={tournamentMatchName(state, match)}
    onClose={onClose}
    onSubmit={async (event) => {
      event.preventDefault();
      if (busy || invalid) return;
      const action: TournamentAdminAction = mode === "schedule"
        ? { action: "schedule", matchId: match.id, activityId }
        : { action: "result", matchId: match.id, result: { kind, winnerId: kind === "empate" ? null : winnerId, note } };
      if (await onAction(action)) onClose();
    }}
    footer={<>
      <button type="button" className="button button-ghost" disabled={busy} onClick={onClose}>Cancelar</button>
      <button type="submit" className="button button-primary" disabled={busy || invalid}>{busy ? "Salvando…" : "Salvar"}</button>
    </>}>
    {mode === "schedule" ? <div className="field">
      <label htmlFor="tournament-match-activity">Atividade</label>
      <Select id="tournament-match-activity" value={activityId} options={[{ value: "", label: "Selecione uma atividade" }, ...activityOptions]} onChange={setActivityId} disabled={busy} />
    </div> : <div className="tournament-dialog-fields">
      <div className="field">
        <label htmlFor="tournament-match-result">Resultado</label>
        <Select id="tournament-match-result" value={kind} options={resultOptions} onChange={(value) => setKind(value as TournamentResult["kind"])} disabled={busy} />
      </div>
      {kind !== "empate" && <div className="field">
        <label htmlFor="tournament-match-winner">Vencedor</label>
        <Select id="tournament-match-winner" value={winnerId} options={winnerOptions} onChange={setWinnerId} disabled={busy} />
      </div>}
      <div className="field">
        <label htmlFor="tournament-match-note">Observação visível aos membros<span className="opt">opcional</span></label>
        <textarea id="tournament-match-note" className="is-short" maxLength={500} value={note} onChange={(event) => setNote(event.target.value)} disabled={busy} />
      </div>
    </div>}
  </AdminDialog>;
}
