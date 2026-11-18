"use client";

import { Check, FilePenLine, LayoutTemplate, Save, Settings2, TextCursorInput, Trash2, X } from "lucide-react";
import { FormEvent, useState } from "react";
import AdminDialog from "@/components/admin/AdminDialog";
import { useToast } from "@/components/admin/ToastProvider";
import type { TemplateStore } from "@/components/admin/useContentTemplates";
import Select from "@/components/ui/Select";
import { cleanTemplateName, templateNameMaxLength } from "@/lib/content-templates";
import type { ContentTemplate, ContentTemplateDataMap, ContentTemplateKind } from "@/lib/types";

const copy = {
  post: { plural: "publicações", summary: (data: ContentTemplateDataMap["post"]) => data.title || data.category },
  activity: {
    plural: "atividades",
    summary: (data: ContentTemplateDataMap["activity"]) => [data.title, data.start_time && `às ${data.start_time}`, data.duration_minutes && `${data.duration_minutes} min`].filter(Boolean).join(" · "),
  },
} as const;

/**
 * Barra de templates do formulário: escolher (reaplicar), salvar o que está
 * preenchido e gerenciar (renomear, editar campos, excluir).
 */
export default function TemplateBar<K extends ContentTemplateKind>({ kind, store, currentData, hasContent, onApply, onEdit }: {
  kind: K;
  store: TemplateStore<K>;
  /** O formulário atual, já convertido para o formato do template. */
  currentData: ContentTemplateDataMap[K];
  hasContent: boolean;
  onApply: (template: ContentTemplate<K>) => void;
  /** Carrega o template no formulário em "modo template". */
  onEdit: (template: ContentTemplate<K>) => void;
}) {
  const toast = useToast();
  const [selectedId, setSelectedId] = useState("");
  const [dialog, setDialog] = useState<"save" | "manage" | null>(null);
  const [name, setName] = useState("");
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [error, setError] = useState("");

  const { templates } = store;
  const applied = templates.find((template) => template.id === selectedId) ?? null;
  const labels = copy[kind];
  const summarize = (template: ContentTemplate<K>) => (labels.summary as (data: ContentTemplateDataMap[K]) => string)(template.data);

  function closeDialog() {
    setDialog(null);
    setName("");
    setRenaming(null);
    setError("");
  }

  function apply(id: string) {
    const template = templates.find((item) => item.id === id);
    if (!template) return;
    if (hasContent && !window.confirm("Substituir o que já foi preenchido pelo template?")) return;
    setSelectedId(id);
    onApply(template);
  }

  async function saveNew(event: FormEvent) {
    event.preventDefault();
    const clean = cleanTemplateName(name);
    if (!clean) return setError("Dê um nome ao template.");
    try {
      const created = await store.create(clean, currentData);
      setSelectedId(created.id);
      closeDialog();
      toast.success(`Template «${clean}» salvo.`);
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  async function updateApplied() {
    if (!applied) return;
    try {
      await store.update(applied.id, { data: currentData });
      closeDialog();
      toast.success(`Template «${applied.name}» atualizado.`);
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  async function rename(event: FormEvent) {
    event.preventDefault();
    if (!renaming) return;
    const clean = cleanTemplateName(renaming.name);
    if (!clean) return setError("Dê um nome ao template.");
    try {
      await store.update(renaming.id, { name: clean });
      setRenaming(null);
      setError("");
      toast.success("Template renomeado.");
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  async function remove(template: ContentTemplate<K>) {
    if (!window.confirm(`Excluir o template «${template.name}»? As ${labels.plural} já criadas não mudam.`)) return;
    try {
      await store.remove(template.id);
      if (template.id === selectedId) setSelectedId("");
      setError("");
      toast.success(`Template «${template.name}» excluído.`);
    } catch (reason) {
      setError((reason as Error).message);
    }
  }

  const options = [{ value: "", label: store.isLoading ? "Carregando templates…" : templates.length ? "Escolher um template…" : "Nenhum template salvo" }, ...templates.map((template) => ({ value: template.id, label: template.name }))];

  return (
    <div className="template-bar" role="group" aria-label={`Templates de ${labels.plural}`}>
      <div className="template-bar-pick field">
        <label htmlFor={`template-select-${kind}`}><LayoutTemplate size={15} aria-hidden="true" /> Template</label>
        <Select id={`template-select-${kind}`} value={selectedId} options={options} disabled={!templates.length} onChange={(value) => { if (value) apply(value); else setSelectedId(""); }} />
      </div>
      <div className="template-bar-actions">
        <button className="button button-ghost button-small" type="button" onClick={() => setDialog("save")} disabled={!hasContent} title={hasContent ? undefined : "Preencha o formulário para salvar como template."}>
          <Save size={16} aria-hidden="true" /> Salvar como template
        </button>
        <button className="button button-ghost button-small" type="button" onClick={() => setDialog("manage")}>
          <Settings2 size={16} aria-hidden="true" /> Gerenciar
        </button>
      </div>
      {store.isError && <p className="template-bar-note" role="alert">Não foi possível carregar os templates. <button className="text-button" type="button" onClick={store.reload}>Tentar novamente</button></p>}

      {dialog === "save" && (
        <AdminDialog
          title="Salvar como template"
          description={`Guarda os campos preenchidos para reaplicar em novas ${labels.plural}.${kind === "activity" ? " A data não é guardada, só o horário e a duração." : " O template nunca publica a publicação."}`}
          onClose={closeDialog}
          onSubmit={saveNew}
          footer={<>
            <button className="button button-ghost" type="button" onClick={closeDialog}>Cancelar</button>
            {applied && <button className="button button-ghost" type="button" disabled={store.isBusy} onClick={() => void updateApplied()}>Atualizar «{applied.name}»</button>}
            <button className="button button-primary" type="submit" disabled={store.isBusy}>{applied ? "Salvar como novo" : "Salvar template"}</button>
          </>}
        >
          <div className="field">
            <label htmlFor={`template-name-${kind}`}>Nome do template</label>
            <input id={`template-name-${kind}`} value={name} maxLength={templateNameMaxLength} onChange={(event) => { setName(event.target.value); setError(""); }} placeholder={kind === "post" ? "Ex.: Resumo do treino" : "Ex.: Treino de sábado"} required />
          </div>
          {error && <p className="form-message error" role="alert">{error}</p>}
        </AdminDialog>
      )}

      {dialog === "manage" && (
        <AdminDialog
          title="Gerenciar templates"
          description={`Templates de ${labels.plural}, compartilhados com quem administra esta área.`}
          onClose={closeDialog}
          footer={<button className="button button-primary" type="button" onClick={closeDialog}>Fechar</button>}
        >
          {templates.length ? (
            <ul className="template-list">
              {templates.map((template) => (
                <li key={template.id}>
                  {renaming?.id === template.id ? (
                    <form className="template-rename" onSubmit={rename}>
                      <input aria-label="Novo nome do template" value={renaming.name} maxLength={templateNameMaxLength} autoFocus onChange={(event) => { setRenaming({ id: template.id, name: event.target.value }); setError(""); }} />
                      <span className="row-actions">
                        <button type="submit" className="is-ok" title="Salvar nome" aria-label="Salvar nome" disabled={store.isBusy}><Check /></button>
                        <button type="button" title="Cancelar" aria-label="Cancelar renomeação" onClick={() => { setRenaming(null); setError(""); }}><X /></button>
                      </span>
                    </form>
                  ) : (
                    <>
                      <div className="template-list-info"><strong>{template.name}</strong>{summarize(template) && <small>{summarize(template)}</small>}</div>
                      <span className="row-actions">
                        <button type="button" title="Renomear" aria-label={`Renomear ${template.name}`} onClick={() => { setRenaming({ id: template.id, name: template.name }); setError(""); }}><TextCursorInput /></button>
                        <button type="button" title="Editar campos" aria-label={`Editar campos de ${template.name}`} onClick={() => { closeDialog(); setSelectedId(template.id); onEdit(template); }}><FilePenLine /></button>
                        <button type="button" className="is-danger" title="Excluir" aria-label={`Excluir ${template.name}`} disabled={store.isBusy} onClick={() => void remove(template)}><Trash2 /></button>
                      </span>
                    </>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-state">Nenhum template ainda. Preencha o formulário e use <strong>Salvar como template</strong>.</p>
          )}
          {error && <p className="form-message error" role="alert">{error}</p>}
        </AdminDialog>
      )}
    </div>
  );
}
