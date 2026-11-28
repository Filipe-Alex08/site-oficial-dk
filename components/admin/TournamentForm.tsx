"use client";

import { Layers, Plus, Swords, X } from "lucide-react";
import { type KeyboardEvent, useState } from "react";
import FormSectionHead from "@/components/admin/FormSectionHead";
import Drawer from "@/components/admin/ui/Drawer";
import { FilterChips } from "@/components/admin/ui/Toolbar";
import Select, { type SelectOption } from "@/components/ui/Select";
import { toDateTimeInput } from "@/lib/content-templates";
import { type TournamentFormat, type TournamentSettings, tournamentDrawOutlook, tournamentFormatLabels } from "@/lib/tournaments";

const empty: TournamentSettings = {
  title: "", description: "", rules: "", format: "mata_mata", opensAt: null, closesAt: null,
  fightsPerActivity: 1, leagueNames: [], qualifiersPerLeague: 1, thirdPlace: true, firstActivityId: null,
};

const formats: Array<{ value: TournamentFormat; icon: typeof Swords }> = [
  { value: "mata_mata", icon: Swords },
  { value: "ligas", icon: Layers },
];

const leaguePresets = [
  { value: "Água\nTerra\nFogo\nAr", label: "Água, Terra, Fogo e Ar" },
  { value: "Olimpo\nAsgard\nEgípcia", label: "Olimpo, Asgard e Egípcia" },
];

const thirdPlaceLabels = {
  nao_premiado: "Não premiado",
  luta_extra: "Luta extra",
  semifinal: "Quem perder a semifinal",
  sem_vaga: "Não há: só a final",
  depende: "Luta extra com 4 ou mais inscritos",
};

const sameName = (first: string, second: string) => first.trim().toLocaleLowerCase("pt-BR") === second.trim().toLocaleLowerCase("pt-BR");

/** Gaveta de criação e edição. O rascunho vive aqui: fechar a gaveta (`open`) não o apaga. */
export default function TournamentForm({ initial, activityOptions, open, busy, onSave, onClose, onCancel }: {
  /** Ausente ao criar um torneio. */
  initial?: TournamentSettings;
  activityOptions: SelectOption[];
  open: boolean;
  busy: boolean;
  onSave: (settings: TournamentSettings) => void;
  onClose: () => void;
  onCancel: () => void;
}) {
  const [settings, setSettings] = useState(initial ?? empty);
  const [opensAt, setOpensAt] = useState(() => toDateTimeInput(initial?.opensAt));
  const [closesAt, setClosesAt] = useState(() => toDateTimeInput(initial?.closesAt));
  // Começa com as duas ligas mínimas; ficam guardadas se o formato for trocado e destrocado.
  const [leagues, setLeagues] = useState(() => initial?.leagueNames.length ? initial.leagueNames : ["", ""]);
  const patch = (changes: Partial<TournamentSettings>) => setSettings((current) => ({ ...current, ...changes }));

  if (!open) return null;

  const withLeagues = settings.format === "ligas";
  const outlook = tournamentDrawOutlook({ ...settings, leagueNames: leagues });
  const datesInverted = Boolean(opensAt && closesAt && closesAt <= opensAt);

  const focusLeague = (index: number) => window.setTimeout(() => document.getElementById(`tournament-league-${index}`)?.focus(), 0);

  function addLeague() {
    setLeagues((current) => [...current, ""]);
    focusLeague(leagues.length);
  }

  // Enter passa para a próxima liga (ou cria uma), em vez de enviar o formulário pela metade.
  function onLeagueKeyDown(event: KeyboardEvent<HTMLInputElement>, index: number) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (index < leagues.length - 1) focusLeague(index + 1);
    else if (leagues[index].trim()) addLeague();
  }

  function leagueError(index: number) {
    const name = leagues[index];
    if (name && !name.trim()) return "Dê um nome à liga.";
    if (name && leagues.some((other, position) => position < index && sameName(other, name))) return "Cada liga precisa de um nome diferente.";
    return "";
  }

  return <Drawer
    title={initial ? "Editar configuração" : "Novo torneio"}
    description={initial?.title}
    onClose={onClose}
    onSubmit={(event) => {
      event.preventDefault();
      if (busy) return;
      onSave({
        ...settings,
        opensAt: opensAt ? new Date(opensAt).toISOString() : null,
        closesAt: closesAt ? new Date(closesAt).toISOString() : null,
        leagueNames: withLeagues ? leagues.map((name) => name.trim()).filter(Boolean) : [],
      });
    }}
    footer={<>
      <button type="button" className="button button-ghost" onClick={onCancel} disabled={busy}>Cancelar</button>
      <button type="submit" className="button button-primary" disabled={busy}>{busy ? "Salvando…" : initial ? "Salvar" : "Criar"}</button>
    </>}
  >
    <fieldset className="admin-form tournament-fieldset" disabled={busy}>
      <section className="form-section">
        <FormSectionHead title="Torneio" hint="Nome, apresentação e regulamento que os membros vão ler." />
        <div className="form-section-body">
          <div className="field"><label htmlFor="tournament-title">Nome</label><input id="tournament-title" value={settings.title} required maxLength={120} onChange={(event) => patch({ title: event.target.value })} /></div>
          <div className="field"><label htmlFor="tournament-description">Descrição<span className="opt">opcional</span></label><textarea id="tournament-description" className="is-short" maxLength={3000} value={settings.description} onChange={(event) => patch({ description: event.target.value })} /></div>
          <div className="field"><label htmlFor="tournament-rules">Regulamento<span className="opt">opcional</span></label><textarea id="tournament-rules" rows={5} maxLength={6000} value={settings.rules} onChange={(event) => patch({ rules: event.target.value })} /></div>
        </div>
      </section>

      <section className="form-section">
        <FormSectionHead title="Formato" hint="No mata-mata, quem perde sai. Nas ligas, os integrantes de cada liga se enfrentam e os melhores vão ao mata-mata final. O terceiro lugar premiado é decidido numa luta extra entre quem perdeu as semifinais, quando há 4 ou mais no mata-mata; com 3, fica com quem perdeu a semifinal." />
        <div className="form-section-body">
          <div className="create-modes" role="radiogroup" aria-label="Formato do torneio">
            {formats.map(({ value, icon: Icon }) => <label key={value} className={`create-mode${settings.format === value ? " is-selected" : ""}`}>
              <input type="radio" name="tournament-format" value={value} checked={settings.format === value} onChange={() => patch({ format: value })} />
              <Icon aria-hidden="true" />
              <strong>{tournamentFormatLabels[value]}</strong>
              <i className="create-mode-dot" aria-hidden="true" />
            </label>)}
          </div>

          {withLeagues && <>
            <div className="field" role="group" aria-labelledby="tournament-leagues-label">
              <span className="field-label" id="tournament-leagues-label">Ligas</span>
              <FilterChips label="Conjuntos de nomes prontos" value={leagues.join("\n")} options={leaguePresets} onChange={(value) => setLeagues(value.split("\n"))} />
              <ol className="tournament-leagues">{leagues.map((name, index) => {
                const error = leagueError(index);
                return <li key={index}>
                  <input id={`tournament-league-${index}`} ref={(input) => input?.setCustomValidity(error)} aria-label={`Nome da liga ${index + 1}`} aria-invalid={Boolean(error)} placeholder={`Liga ${index + 1}`} required maxLength={60} value={name}
                    onKeyDown={(event) => onLeagueKeyDown(event, index)} onChange={(event) => setLeagues(leagues.map((current, position) => position === index ? event.target.value : current))} />
                  <button type="button" className="icon-button" aria-label={`Remover a liga ${index + 1}`} title="Remover" disabled={leagues.length <= 2} onClick={() => setLeagues(leagues.filter((_, position) => position !== index))}><X aria-hidden="true" /></button>
                </li>;
              })}</ol>
              <button type="button" className="button button-ghost tournament-add-league" onClick={addLeague}><Plus aria-hidden="true" /> Adicionar liga</button>
            </div>
            <div className="field"><label htmlFor="tournament-qualifiers">Classificados por liga</label><input id="tournament-qualifiers" type="number" inputMode="numeric" min={1} step={1} required value={settings.qualifiersPerLeague || ""} onChange={(event) => patch({ qualifiersPerLeague: event.target.valueAsNumber || 0 })} /></div>
          </>}

          <label className="switch-field"><span><strong>Premiar o terceiro lugar</strong></span><input type="checkbox" checked={settings.thirdPlace} onChange={(event) => patch({ thirdPlace: event.target.checked })} /></label>

          <dl className="stat-list tournament-facts tournament-outlook" aria-live="polite">
            <div><dt>Mínimo de inscritos para o sorteio</dt><dd>{outlook.minimumEntries}</dd></div>
            {outlook.finalists !== null && <div><dt>Vagas no mata-mata final</dt><dd>{outlook.finalists}</dd></div>}
            <div><dt>Terceiro lugar</dt><dd>{thirdPlaceLabels[outlook.thirdPlace]}</dd></div>
          </dl>
        </div>
      </section>

      <section className="form-section">
        <FormSectionHead title="Inscrições" hint="Você abre as inscrições e faz o sorteio. As datas, se preenchidas, limitam quando os convidados podem se inscrever." />
        <div className="form-section-body is-two">
          <div className="field"><label htmlFor="tournament-opens">A partir de<span className="opt">opcional</span></label><input id="tournament-opens" type="datetime-local" value={opensAt} onChange={(event) => setOpensAt(event.target.value)} /></div>
          <div className="field"><label htmlFor="tournament-closes">Até<span className="opt">opcional</span></label><input id="tournament-closes" type="datetime-local" ref={(input) => input?.setCustomValidity(datesInverted ? "O fim das inscrições precisa ser depois do início." : "")} aria-invalid={datesInverted} value={closesAt} min={opensAt || undefined} onChange={(event) => setClosesAt(event.target.value)} /></div>
        </div>
      </section>

      <section className="form-section">
        <FormSectionHead title="Calendário" hint="O limite vale para cada integrante numa mesma atividade. Se você escolher a atividade das primeiras lutas, elas são agendadas nela no sorteio, desde que a data ainda não tenha passado." />
        <div className="form-section-body">
          <div className="field"><label htmlFor="tournament-fights">Lutas por integrante em cada atividade</label><input id="tournament-fights" type="number" inputMode="numeric" min={1} step={1} required value={settings.fightsPerActivity || ""} onChange={(event) => patch({ fightsPerActivity: event.target.valueAsNumber || 0 })} /></div>
          <div className="field"><label htmlFor="tournament-first-activity">Atividade das primeiras lutas<span className="opt">opcional</span></label><Select id="tournament-first-activity" value={settings.firstActivityId ?? ""} options={[{ value: "", label: "Definir após o sorteio" }, ...activityOptions]} onChange={(value) => patch({ firstActivityId: value || null })} disabled={busy} /></div>
        </div>
      </section>
    </fieldset>
  </Drawer>;
}
