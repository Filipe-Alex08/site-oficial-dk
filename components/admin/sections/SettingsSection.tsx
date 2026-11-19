"use client";

import { Save } from "lucide-react";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import AdminTitle from "@/components/admin/AdminTitle";
import FormSectionHead from "@/components/admin/FormSectionHead";
import { useToast } from "@/components/admin/ToastProvider";
import Panel from "@/components/admin/ui/Panel";
import { onTabListKeyDown } from "@/components/admin/ui/tabKeys";
import Select from "@/components/ui/Select";
import { apiFetch, jsonApiFetch } from "@/lib/api-client";
import { rankGroups, rankLabels } from "@/lib/member-access";
import { notesScopeOptions, notesWritersOptions, type NotesSettings } from "@/lib/member-notes";

const settingsKey = ["admin-settings"] as const;
const tabs = [{ id: "sistemas", label: "Sistemas" }, { id: "regras", label: "Regras" }] as const;
type SettingsTab = (typeof tabs)[number]["id"];
const rankOptions = rankGroups.flatMap((group) => group.ranks.map((item) => ({ value: item.value, label: item.label, group: group.category })));

/** Pede ao servidor para gravar só os campos informados. */
async function saveNotes(changes: Partial<NotesSettings>): Promise<NotesSettings> {
  const response = await jsonApiFetch("/api/admin/settings", { notes: changes });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || "Não foi possível salvar a configuração.");
  return result.notes as NotesSettings;
}

/** Configurações do site (só o ADM Principal chega aqui). */
export default function SettingsSection() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<SettingsTab>("sistemas");
  // O que foi alterado no formulário e ainda não foi salvo; o resto mostra o valor salvo.
  const [draft, setDraft] = useState<Partial<Pick<NotesSettings, "writers" | "minRank" | "commanderScope">>>({});

  const settingsQuery = useQuery({
    queryKey: settingsKey,
    queryFn: async () => {
      const response = await apiFetch("/api/admin/settings");
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Não foi possível carregar as configurações.");
      return result.notes as NotesSettings;
    },
  });
  const saved = settingsQuery.data;
  const current = saved ? { ...saved, ...draft } : null;
  const dirty = Boolean(saved) && (Object.keys(draft) as Array<keyof typeof draft>).some((key) => draft[key] !== saved?.[key]);

  const saveMutation = useMutation({
    mutationFn: saveNotes,
    onSuccess: async (next) => {
      queryClient.setQueryData(settingsKey, next);
      setDraft({});
      toast.success("Configuração salva.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const usesRank = current?.writers !== "commanders";
  const usesCommander = current?.writers !== "ranks";
  const writersHint = notesWritersOptions.find((option) => option.value === current?.writers)?.description;
  const scopeHint = notesScopeOptions.find((option) => option.value === current?.commanderScope)?.description;

  return <div>
    <AdminTitle eyebrow="Gestão" title="Configurações" />
    {settingsQuery.isPending && <p className="empty-state" role="status">Carregando…</p>}
    {settingsQuery.isError && <p className="empty-state" role="alert">{settingsQuery.error.message} <button className="text-button" type="button" onClick={() => void settingsQuery.refetch()}>Tentar novamente</button></p>}

    {saved && current && <>
      <div className="admin-subtabs" role="tablist" aria-label="Seções das configurações" onKeyDown={onTabListKeyDown}>
        {tabs.map((item) => <button key={item.id} type="button" role="tab" id={`settings-tab-${item.id}`} aria-controls="settings-panel" tabIndex={tab === item.id ? 0 : -1} aria-selected={tab === item.id} className={tab === item.id ? "active" : ""} onClick={() => setTab(item.id)}>{item.label}</button>)}
      </div>

      {tab === "sistemas" && <div role="tabpanel" id="settings-panel" aria-labelledby="settings-tab-sistemas">
      <Panel title="Sistemas" description="Desligar não apaga nada: os dados voltam ao religar.">
        <div className="switch-list">
          <label className="switch-field">
            <span><strong>Anotações entre membros</strong><small>{saved.enabled ? "Ligado: aparece no menu e comandantes e oficiais podem escrever." : "Desligado: some do menu e ninguém lê nem escreve anotações."}</small></span>
            <input type="checkbox" checked={saved.enabled} disabled={saveMutation.isPending} onChange={(event) => saveMutation.mutate({ enabled: event.target.checked })} />
          </label>
        </div>
      </Panel>
      </div>}

      {tab === "regras" && <div role="tabpanel" id="settings-panel" aria-labelledby="settings-tab-regras">
      <Panel title="Anotações entre membros" description={saved.enabled ? undefined : "O sistema está desligado: estas regras passam a valer quando ele for ligado, na aba Sistemas."}>
        <form className="admin-form" onSubmit={(event) => { event.preventDefault(); if (dirty) saveMutation.mutate(draft); }}>
          <section className="form-section">
            <FormSectionHead title="Quem pode escrever" hint="A anotação só é lida pelo autor e pelo destinatário, seja qual for a regra." />
            <div className="form-section-body">
              <div className="field">
                <label htmlFor="settings-notes-writers">Quem escreve</label>
                <Select id="settings-notes-writers" value={current.writers} options={notesWritersOptions.map((option) => ({ value: option.value, label: option.label }))} onChange={(value) => setDraft({ ...draft, writers: value as NotesSettings["writers"] })} />
                {writersHint && <p className="field-hint">{writersHint}</p>}
              </div>
              <div className="field">
                <label htmlFor="settings-notes-min-rank">Patente mínima</label>
                <Select id="settings-notes-min-rank" value={current.minRank} options={rankOptions} disabled={!usesRank} onChange={(value) => setDraft({ ...draft, minRank: value as NotesSettings["minRank"] })} />
                <p className="field-hint">{usesRank ? `${rankLabels[current.minRank]} ou superior. Quem tem a patente mínima escreve para qualquer membro.` : "Não se aplica: só comandantes escrevem."}</p>
              </div>
            </div>
          </section>
          <section className="form-section">
            <FormSectionHead title="Alcance do comandante" hint="Vale para quem escreve só por ser comandante. Quem também tem a patente mínima (nos modos que contam patente) escreve para qualquer membro." />
            <div className="form-section-body">
              <div className="field">
                <label htmlFor="settings-notes-scope">Comandante escreve para</label>
                <Select id="settings-notes-scope" value={current.commanderScope} options={notesScopeOptions.map((option) => ({ value: option.value, label: option.label }))} disabled={!usesCommander} onChange={(value) => setDraft({ ...draft, commanderScope: value as NotesSettings["commanderScope"] })} />
                <p className="field-hint">{usesCommander ? scopeHint : "Não se aplica: só patentes escrevem."}</p>
              </div>
            </div>
          </section>
          <div className="form-actions">
            <button className="button button-primary" type="submit" disabled={saveMutation.isPending || !dirty}>
              <Save size={17} /> {saveMutation.isPending ? "Salvando…" : "Salvar"}
            </button>
          </div>
        </form>
      </Panel>
      </div>}
    </>}
  </div>;
}
