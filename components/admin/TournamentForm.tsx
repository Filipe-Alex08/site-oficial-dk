"use client";

import { useState } from "react";
import Panel from "@/components/admin/ui/Panel";
import Select, { type SelectOption } from "@/components/ui/Select";
import { toDateTimeInput } from "@/lib/content-templates";
import { type TournamentSettings, tournamentFormatLabels } from "@/lib/tournaments";

const empty: TournamentSettings = {
  title: "", description: "", rules: "", format: "mata_mata", opensAt: null, closesAt: null,
  fightsPerActivity: 1, leagueNames: [], qualifiersPerLeague: 1, thirdPlace: true, firstActivityId: null,
};

export default function TournamentForm({ initial = empty, activityOptions, busy, onSave, onCancel }: {
  initial?: TournamentSettings;
  activityOptions: SelectOption[];
  busy: boolean;
  onSave: (settings: TournamentSettings) => void;
  onCancel: () => void;
}) {
  const [settings, setSettings] = useState(initial);
  const [opensAt, setOpensAt] = useState(() => toDateTimeInput(initial.opensAt));
  const [closesAt, setClosesAt] = useState(() => toDateTimeInput(initial.closesAt));
  const [leagueNames, setLeagueNames] = useState(initial.leagueNames.join("\n"));

  return <Panel title={initial.title ? "Configuração do torneio" : "Novo torneio"}>
    <form className="admin-form" onSubmit={(event) => {
      event.preventDefault();
      onSave({
        ...settings,
        opensAt: opensAt ? new Date(opensAt).toISOString() : null,
        closesAt: closesAt ? new Date(closesAt).toISOString() : null,
        leagueNames: leagueNames.split("\n").map((name) => name.trim()).filter(Boolean),
      });
    }}>
      <fieldset className="form-grid" disabled={busy}>
        <label className="field is-full">Nome<input value={settings.title} required maxLength={120} onChange={(event) => setSettings({ ...settings, title: event.target.value })} /></label>
        <label className="field is-full">Descrição<textarea rows={3} maxLength={3000} value={settings.description} onChange={(event) => setSettings({ ...settings, description: event.target.value })} /></label>
        <label className="field is-full">Regulamento<textarea rows={4} maxLength={6000} value={settings.rules} onChange={(event) => setSettings({ ...settings, rules: event.target.value })} /></label>
        <div className="field">
          <label htmlFor="tournament-format">Formato</label>
          <Select id="tournament-format" value={settings.format} options={Object.entries(tournamentFormatLabels).map(([value, label]) => ({ value, label }))} onChange={(value) => setSettings({ ...settings, format: value as TournamentSettings["format"] })} />
        </div>
        <label className="field">Limite de lutas por integrante em cada atividade<input type="number" min={1} step={1} required value={settings.fightsPerActivity || ""} onChange={(event) => setSettings({ ...settings, fightsPerActivity: event.target.valueAsNumber || 0 })} /></label>
        <label className="field">Abertura das inscrições (opcional)<input type="datetime-local" value={opensAt} onChange={(event) => setOpensAt(event.target.value)} /></label>
        <label className="field">Prazo de inscrição (opcional)<input type="datetime-local" value={closesAt} min={opensAt || undefined} onChange={(event) => setClosesAt(event.target.value)} /></label>
        {settings.format === "ligas" && <>
          <div className="field is-full">
            <label htmlFor="tournament-league-names">Nomes das ligas, um por linha</label>
            <textarea id="tournament-league-names" rows={4} required value={leagueNames} onChange={(event) => setLeagueNames(event.target.value)} />
            <div className="tournament-controls">
              <button className="text-button" type="button" onClick={() => setLeagueNames("Água\nTerra\nFogo\nAr")}>Água, Terra, Fogo e Ar</button>
              <button className="text-button" type="button" onClick={() => setLeagueNames("Olimpo\nAsgard\nEgípcia")}>Olimpo, Asgard e Egípcia</button>
            </div>
          </div>
          <label className="field">Classificados por liga<input type="number" min={1} step={1} required value={settings.qualifiersPerLeague || ""} onChange={(event) => setSettings({ ...settings, qualifiersPerLeague: event.target.valueAsNumber || 0 })} /></label>
        </>}
        <div className="field">
          <label htmlFor="tournament-first-activity">Primeira atividade (opcional)</label>
          <Select id="tournament-first-activity" value={settings.firstActivityId ?? ""} options={[{ value: "", label: "Definir após o sorteio" }, ...activityOptions]} onChange={(value) => setSettings({ ...settings, firstActivityId: value || null })} />
        </div>
        <label className="check-field is-full"><input type="checkbox" checked={settings.thirdPlace} onChange={(event) => setSettings({ ...settings, thirdPlace: event.target.checked })} /> Definir o terceiro lugar</label>
      </fieldset>
      <div className="form-actions">
        <button type="button" className="button button-ghost" onClick={onCancel} disabled={busy}>Cancelar</button>
        <button type="submit" className="button button-primary" disabled={busy}>{busy ? "Salvando…" : "Salvar torneio"}</button>
      </div>
    </form>
  </Panel>;
}
