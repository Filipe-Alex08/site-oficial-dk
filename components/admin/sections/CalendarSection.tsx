"use client";

import { Edit3, Trash2 } from "lucide-react";
import { FormEvent, useState } from "react";
import { useAdminData } from "@/components/admin/AdminDataContext";
import AdminTable from "@/components/admin/AdminTable";
import AdminTitle from "@/components/admin/AdminTitle";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import FormSectionHead from "@/components/admin/FormSectionHead";
import TemplateBar from "@/components/admin/TemplateBar";
import { useToast } from "@/components/admin/ToastProvider";
import { statusLabel } from "@/components/admin/ui/StatusBadge";
import { useContentTemplates } from "@/components/admin/useContentTemplates";
import Select from "@/components/ui/Select";
import { activityFormHasContent, activityFormToTemplate, emptyActivity, templateToActivityForm, toDateTimeInput, type ActivityFormState } from "@/lib/content-templates";
import { friendlyError } from "@/lib/friendly-error";
import type { ActivityStatus } from "@/lib/types";

export default function CalendarSection() {
  const { supabase, canCalendar, activities, refetch } = useAdminData();
  const toast = useToast();
  const confirm = useConfirm();
  const [activityForm, setActivityForm] = useState<ActivityFormState>(emptyActivity);
  // "Modo template": o formulário edita um template em vez de criar/editar uma atividade.
  const [editingActivityTemplate, setEditingActivityTemplate] = useState<{ id: string; name: string } | null>(null);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const activityTemplates = useContentTemplates("activity", canCalendar);

  function loadActivityForm(form: ActivityFormState, target: { activity?: string; template?: { id: string; name: string } } = {}) {
    setActivityForm(form);
    setEditingActivity(target.activity ?? null);
    setEditingActivityTemplate(target.template ?? null);
  }

  async function saveActivity(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    if (editingActivityTemplate) {
      try {
        await activityTemplates.update(editingActivityTemplate.id, { data: activityFormToTemplate(activityForm) });
      } catch (error) {
        return toast.error(`Falha ao salvar o template: ${(error as Error).message}`);
      }
      toast.success(`Template «${editingActivityTemplate.name}» atualizado.`);
      return loadActivityForm(emptyActivity);
    }
    const payload = {
      ...activityForm,
      starts_at: new Date(activityForm.starts_at).toISOString(),
      ends_at: activityForm.ends_at ? new Date(activityForm.ends_at).toISOString() : null,
    };
    const result = editingActivity ? await supabase.from("activities").update(payload).eq("id", editingActivity) : await supabase.from("activities").insert(payload);
    if (result.error) return toast.error(friendlyError(result.error));
    loadActivityForm(emptyActivity);
    toast.success("Atividade salva.");
    await refetch();
  }

  async function removeActivity(id: string, title: string) {
    if (!supabase) return;
    if (!(await confirm({ title: "Excluir atividade?", message: `«${title}» e a lista de presença dela serão apagadas.`, confirmLabel: "Excluir", danger: true }))) return;
    const { error } = await supabase.from("activities").delete().eq("id", id);
    if (error) toast.error(friendlyError(error)); else toast.success("Atividade excluída.");
    await refetch();
  }

  return <div>
    <AdminTitle eyebrow="Conteúdo" title="Calendário" description="Treinos, eventos e encontros que aparecem no site e na lista de presença." />
    <section className="admin-panel">
      <div className="admin-panel-head"><h3>{editingActivityTemplate ? `Editar template «${editingActivityTemplate.name}»` : editingActivity ? "Editar atividade" : "Nova atividade"}</h3></div>
      <div className="admin-panel-body">
        {editingActivityTemplate
          ? <p className="template-mode-note" role="status">Você está editando um template: nada aqui cria ou altera uma atividade. Só o horário de início e a duração (início até término) são guardados; a data é ignorada.</p>
          : <TemplateBar
            kind="activity"
            store={activityTemplates}
            currentData={activityFormToTemplate(activityForm)}
            hasContent={activityFormHasContent(activityForm)}
            onApply={(template) => {
              // A data já escolhida é mantida; o template só define horário e duração.
              loadActivityForm(templateToActivityForm(template.data, activityForm), editingActivity ? { activity: editingActivity } : {});
              toast.success("Template aplicado. Confira a data da atividade.");
              window.setTimeout(() => document.getElementById("activity-start")?.focus(), 0);
            }}
            onEdit={(template) => { loadActivityForm(templateToActivityForm(template.data, { starts_at: "" }), { template: { id: template.id, name: template.name } }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
          />}
        <form className="admin-form" onSubmit={saveActivity}>
          <section className="form-section">
            <FormSectionHead title="Atividade" hint="Nome, tipo e situação atual." />
            <div className="form-section-body is-two">
              <div className="field is-full"><label htmlFor="activity-title">Nome</label><input id="activity-title" value={activityForm.title} onChange={(event) => setActivityForm({ ...activityForm, title: event.target.value })} required={!editingActivityTemplate} /></div>
              <div className="field"><label htmlFor="activity-type">Tipo</label><input id="activity-type" value={activityForm.type} placeholder="Treino, encontro, evento…" onChange={(event) => setActivityForm({ ...activityForm, type: event.target.value })} required={!editingActivityTemplate} /></div>
              <div className="field"><label htmlFor="activity-status">Situação</label><Select id="activity-status" value={activityForm.status} options={[{ value: "confirmado", label: "Confirmado" }, { value: "a_definir", label: "A definir" }, { value: "adiado", label: "Adiado" }, { value: "cancelado", label: "Cancelado" }, { value: "finalizado", label: "Finalizado" }]} onChange={(value) => setActivityForm({ ...activityForm, status: value as ActivityStatus })} /></div>
            </div>
          </section>
          <section className="form-section">
            <FormSectionHead title="Quando e onde" hint="Data, horário e local do encontro." />
            <div className="form-section-body is-two">
              <div className="field"><label htmlFor="activity-start">Início</label><input id="activity-start" type="datetime-local" value={activityForm.starts_at} onChange={(event) => setActivityForm({ ...activityForm, starts_at: event.target.value })} required={!editingActivityTemplate} /></div>
              <div className="field"><label htmlFor="activity-end">Término<span className="opt">opcional</span></label><input id="activity-end" type="datetime-local" value={activityForm.ends_at} onChange={(event) => setActivityForm({ ...activityForm, ends_at: event.target.value })} /></div>
              <div className="field is-full"><label htmlFor="activity-location">Local</label><input id="activity-location" value={activityForm.location} onChange={(event) => setActivityForm({ ...activityForm, location: event.target.value })} required={!editingActivityTemplate} /></div>
            </div>
          </section>
          <section className="form-section">
            <FormSectionHead title="Detalhes" hint="Informações extras e lista de presença." />
            <div className="form-section-body">
              <div className="field"><label htmlFor="activity-description">Descrição<span className="opt">opcional</span></label><textarea id="activity-description" className="is-short" value={activityForm.description} onChange={(event) => setActivityForm({ ...activityForm, description: event.target.value })} /></div>
              <label className="switch-field"><span><strong>Permitir confirmação de presença</strong></span><input type="checkbox" checked={activityForm.attendance_open} onChange={(event) => setActivityForm({ ...activityForm, attendance_open: event.target.checked })} /></label>
            </div>
          </section>
          <div className="form-actions">
            <button className="button button-primary" type="submit">{editingActivityTemplate ? "Salvar template" : editingActivity ? "Salvar alterações" : "Adicionar ao calendário"}</button>
            {(editingActivity || editingActivityTemplate) && <button className="button button-ghost" type="button" onClick={() => loadActivityForm(emptyActivity)}>Cancelar</button>}
          </div>
        </form>
      </div>
    </section>
    <AdminTable headers={["Atividade", "Data", "Lista", "Situação", "Ações"]} count={activities.length} empty="Nenhuma atividade cadastrada.">
      {activities.map((item) => <tr key={item.id}>
        <td><strong>{item.title}</strong><small>{item.location}</small></td>
        <td>{new Date(item.starts_at).toLocaleString("pt-BR")}</td>
        <td>{item.attendance_open ? "Aberta" : "Fechada"}</td>
        <td><span className={`badge ${item.status}`}>{statusLabel(item.status)}</span></td>
        <td className="row-actions">
          <button title="Editar" aria-label={`Editar ${item.title}`} onClick={() => {
            loadActivityForm({ title: item.title, starts_at: toDateTimeInput(item.starts_at), ends_at: toDateTimeInput(item.ends_at), location: item.location, type: item.type, status: item.status, description: item.description || "", attendance_open: item.attendance_open ?? true }, { activity: item.id });
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}><Edit3 /></button>
          <button className="is-danger" title="Excluir" aria-label={`Excluir ${item.title}`} onClick={() => void removeActivity(item.id, item.title)}><Trash2 /></button>
        </td>
      </tr>)}
    </AdminTable>
  </div>;
}
