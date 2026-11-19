"use client";

import { CalendarPlus, Edit3, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useAdminData } from "@/components/admin/AdminDataContext";
import AdminTitle from "@/components/admin/AdminTitle";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import FormSectionHead from "@/components/admin/FormSectionHead";
import TemplateBar from "@/components/admin/TemplateBar";
import { useToast } from "@/components/admin/ToastProvider";
import { useContentTemplates } from "@/components/admin/useContentTemplates";
import Drawer from "@/components/admin/ui/Drawer";
import Panel from "@/components/admin/ui/Panel";
import RowMenu from "@/components/admin/ui/RowMenu";
import StatusBadge, { statusLabel } from "@/components/admin/ui/StatusBadge";
import { FilterChips } from "@/components/admin/ui/Toolbar";
import Select from "@/components/ui/Select";
import { activityFormHasContent, activityFormToTemplate, emptyActivity, templateToActivityForm, toDateTimeInput, type ActivityFormState } from "@/lib/content-templates";
import { friendlyError } from "@/lib/friendly-error";
import type { Activity, ActivityStatus } from "@/lib/types";

const TIME_ZONE = "America/Sao_Paulo";
type Period = "proximas" | "passadas" | "todas";
type StatusFilter = "todos" | ActivityStatus;
const statuses: ActivityStatus[] = ["confirmado", "a_definir", "adiado", "cancelado", "finalizado"];

const endOf = (activity: Activity) => new Date(activity.ends_at ?? activity.starts_at).getTime();
const monthLabel = (activity: Activity) => new Date(activity.starts_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: TIME_ZONE });

export default function CalendarSection({ active }: { active: boolean }) {
  const { supabase, canCalendar, activities, refetch } = useAdminData();
  const toast = useToast();
  const confirm = useConfirm();
  const [activityForm, setActivityForm] = useState<ActivityFormState>(emptyActivity);
  // "Modo template": o formulário edita um template em vez de criar/editar uma atividade.
  const [editingActivityTemplate, setEditingActivityTemplate] = useState<{ id: string; name: string } | null>(null);
  const [editingActivity, setEditingActivity] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activityTemplates = useContentTemplates("activity", canCalendar);
  // O "agora" é fixado na abertura da tela; o filtro de período não muda sozinho enquanto se trabalha.
  const [now] = useState(() => Date.now());
  const [period, setPeriod] = useState<Period>("proximas");
  const [status, setStatus] = useState<StatusFilter>("todos");

  const inPeriod = useMemo(() => activities.filter((activity) =>
    period === "todas" || (period === "proximas" ? endOf(activity) >= now : endOf(activity) < now),
  ), [activities, period, now]);
  const visible = useMemo(() => {
    const filtered = inPeriod.filter((activity) => status === "todos" || activity.status === status);
    return [...filtered].sort((a, b) => period === "passadas" ? b.starts_at.localeCompare(a.starts_at) : a.starts_at.localeCompare(b.starts_at));
  }, [inPeriod, status, period]);
  const months = useMemo(() => visible.reduce<Array<{ label: string; items: Activity[] }>>((all, activity) => {
    const label = monthLabel(activity);
    const group = all.find((entry) => entry.label === label);
    if (group) group.items.push(activity); else all.push({ label, items: [activity] });
    return all;
  }, []), [visible]);
  const statusOptions = [
    { value: "todos" as const, label: "Todas", count: inPeriod.length },
    ...statuses.map((value) => ({ value, label: statusLabel(value), count: inPeriod.filter((activity) => activity.status === value).length })),
  ];

  function loadActivityForm(form: ActivityFormState, target: { activity?: string; template?: { id: string; name: string } } = {}) {
    setActivityForm(form);
    setEditingActivity(target.activity ?? null);
    setEditingActivityTemplate(target.template ?? null);
  }

  function openNew() {
    if (!drawerOpen && (editingActivity || editingActivityTemplate)) loadActivityForm(emptyActivity);
    setDrawerOpen(true);
  }

  function openEdit(item: Activity) {
    loadActivityForm({ title: item.title, starts_at: toDateTimeInput(item.starts_at), ends_at: toDateTimeInput(item.ends_at), location: item.location, type: item.type, status: item.status, description: item.description || "", attendance_open: item.attendance_open ?? true }, { activity: item.id });
    setDrawerOpen(true);
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
      loadActivityForm(emptyActivity);
      return;
    }
    const payload = {
      ...activityForm,
      starts_at: new Date(activityForm.starts_at).toISOString(),
      ends_at: activityForm.ends_at ? new Date(activityForm.ends_at).toISOString() : null,
    };
    const result = editingActivity ? await supabase.from("activities").update(payload).eq("id", editingActivity) : await supabase.from("activities").insert(payload);
    if (result.error) return toast.error(friendlyError(result.error));
    loadActivityForm(emptyActivity);
    setDrawerOpen(false);
    toast.success("Atividade salva.");
    await refetch();
  }

  async function removeActivity(item: Activity) {
    if (!supabase) return;
    if (!(await confirm({ title: "Excluir atividade?", message: `«${item.title}» e a lista de presença dela serão apagadas.`, confirmLabel: "Excluir", danger: true }))) return;
    const { error } = await supabase.from("activities").delete().eq("id", item.id);
    if (error) toast.error(friendlyError(error)); else toast.success("Atividade excluída.");
    await refetch();
  }

  const drawerTitle = editingActivityTemplate ? `Editar template «${editingActivityTemplate.name}»` : editingActivity ? "Editar atividade" : "Nova atividade";

  return <div>
    <AdminTitle
      eyebrow="Conteúdo"
      title="Calendário"
      description="Treinos, eventos e encontros que aparecem no site e na lista de presença."
      action={<button className="button button-primary" type="button" onClick={openNew}><CalendarPlus size={18} /> Nova atividade</button>}
    />

    <div className="admin-toolbar">
      <div className="admin-toolbar-filters">
        <FilterChips label="Período" value={period} onChange={setPeriod} options={[{ value: "proximas", label: "Próximas" }, { value: "passadas", label: "Passadas" }, { value: "todas", label: "Todas" }]} />
      </div>
      <div className="admin-toolbar-meta"><FilterChips label="Situação" value={status} onChange={setStatus} options={statusOptions} /></div>
    </div>

    {months.length
      ? months.map((month) => <Panel key={month.label} title={<span className="agenda-month">{month.label}</span>} flush>
        <ul className="agenda-list">{month.items.map((item) => {
          const start = new Date(item.starts_at);
          return <li key={item.id}>
            <button className="agenda-main" type="button" onClick={() => openEdit(item)} aria-label={`Editar ${item.title}`}>
              <span className="date-chip" aria-hidden="true"><strong>{start.toLocaleDateString("pt-BR", { day: "2-digit", timeZone: TIME_ZONE })}</strong><small>{start.toLocaleDateString("pt-BR", { month: "short", timeZone: TIME_ZONE }).replace(".", "")}</small></span>
              <span className="agenda-text">
                <strong>{item.title}</strong>
                <small>{start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE })} · {item.location} · {item.type}</small>
              </span>
            </button>
            <span className="agenda-tags">
              <StatusBadge status={item.status} />
              <span className={`agenda-list-state${item.attendance_open ? " is-open" : ""}`}>Lista {item.attendance_open ? "aberta" : "fechada"}</span>
            </span>
            <RowMenu label={`Ações de ${item.title}`} items={[
              { label: "Editar", icon: <Edit3 />, onSelect: () => openEdit(item) },
              { label: "Excluir", icon: <Trash2 />, danger: true, onSelect: () => void removeActivity(item) },
            ]} />
          </li>;
        })}</ul>
      </Panel>)
      : <div className="empty-state"><CalendarPlus /><h3>Nenhuma atividade aqui</h3><p>{activities.length ? "Nada corresponde a esses filtros." : "Crie a primeira atividade do calendário."}</p></div>}

    {drawerOpen && active && <Drawer
      title={drawerTitle}
      description={editingActivityTemplate ? undefined : "Nome, horário, local e lista de presença."}
      onClose={() => setDrawerOpen(false)}
      onSubmit={saveActivity}
      headerExtra={editingActivityTemplate
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
          onEdit={(template) => loadActivityForm(templateToActivityForm(template.data, { starts_at: "" }), { template: { id: template.id, name: template.name } })}
        />}
      footer={<>
        <button className="button button-ghost" type="button" onClick={() => { loadActivityForm(emptyActivity); setDrawerOpen(false); }}>Cancelar</button>
        <button className="button button-primary" type="submit">{editingActivityTemplate ? "Salvar template" : editingActivity ? "Salvar alterações" : "Adicionar ao calendário"}</button>
      </>}
    >
      <div className="admin-form">
        <section className="form-section">
          <FormSectionHead title="Atividade" hint="Nome, tipo e situação atual." />
          <div className="form-section-body is-two">
            <div className="field is-full"><label htmlFor="activity-title">Nome</label><input id="activity-title" value={activityForm.title} onChange={(event) => setActivityForm({ ...activityForm, title: event.target.value })} required={!editingActivityTemplate} /></div>
            <div className="field"><label htmlFor="activity-type">Tipo</label><input id="activity-type" value={activityForm.type} placeholder="Treino, encontro, evento…" onChange={(event) => setActivityForm({ ...activityForm, type: event.target.value })} required={!editingActivityTemplate} /></div>
            <div className="field"><label htmlFor="activity-status">Situação</label><Select id="activity-status" value={activityForm.status} options={statuses.map((value) => ({ value, label: statusLabel(value) }))} onChange={(value) => setActivityForm({ ...activityForm, status: value as ActivityStatus })} /></div>
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
      </div>
    </Drawer>}
  </div>;
}
