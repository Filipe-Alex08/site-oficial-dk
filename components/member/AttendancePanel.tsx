"use client";

import { Check, Clipboard, MessageCircle, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rankLabels, rankOptions } from "@/lib/member-access";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeTables } from "@/components/RealtimeProvider";
import type { Activity, AttendanceEntry, AttendanceResponse, RosterEntry } from "@/lib/types";
import { GraduationInsignias, RankInsignia } from "@/components/member/Insignia";
import { useToast } from "@/components/admin/ToastProvider";
import StatusBadge from "@/components/admin/ui/StatusBadge";

type ResponseForm = { guest_count: number; note: string };

const dateOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
};

function activityTime(activity: Activity) {
  const start = new Date(activity.starts_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  if (!activity.ends_at) return start;
  const end = new Date(activity.ends_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  return `${start} às ${end}`;
}

function responseLine(entry: AttendanceEntry, index: number) {
  const guests = entry.guest_count ? ` +${entry.guest_count} ${entry.guest_count === 1 ? "convidado" : "convidados"}` : "";
  const note = entry.note ? ` (${entry.note})` : "";
  return `${index + 1}. ${entry.nickname}${guests}${note}`;
}

function AttendanceInsignias({ entry }: { entry: AttendanceEntry }) {
  return (
    <span className="attendance-insignias">
      <RankInsignia rank={entry.rank} variant="icon" />
      <GraduationInsignias profile={entry} variant="icon" />
    </span>
  );
}

function buildShareText(activity: Activity, entries: AttendanceEntry[], roster: RosterEntry[]) {
  const attending = entries.filter((entry) => entry.response === "vai").sort((a, b) => a.nickname.localeCompare(b.nickname));
  const absent = entries.filter((entry) => entry.response === "nao_vai").sort((a, b) => a.nickname.localeCompare(b.nickname));
  const lines = [
    "🏴‍☠️Death Knights🏴‍☠️",
    `💀- ${activity.title} -💀`,
    "",
    `📅 Data: ${new Date(activity.starts_at).toLocaleDateString("pt-BR", dateOptions)}`,
    `⏰ Horário: ${activityTime(activity)}`,
    `📍 Local: ${activity.location}`,
    "",
    "✅ Lista de presença:",
    ...(attending.length ? attending.map(responseLine) : ["Nenhuma confirmação até o momento."]),
    "",
    "❌ Não poderão ir:",
    ...(absent.length ? absent.map(responseLine) : ["Nenhuma ausência informada até o momento."]),
    "",
    "💀👁️‍🗨️INVOCAÇÃO DK👁️‍🗨️💀",
  ];

  [...rankOptions].reverse().forEach((rank) => {
    const members = roster.filter((member) => member.rank === rank.value);
    if (!members.length) return;
    lines.push("", `${rank.label.toUpperCase()}:`, ...members.map((member) => member.nickname));
  });

  return lines.join("\n");
}

type Filter = "todas" | "pendentes" | "vou";

const filterLabels: Record<Filter, string> = { todas: "Todas", pendentes: "Sem resposta", vou: "Eu vou" };

const monthTitle = (activity: Activity) =>
  new Date(activity.starts_at).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: "America/Sao_Paulo" });

const isActivityClosed = (activity: Activity) => !activity.attendance_open || activity.status === "cancelado" || activity.status === "finalizado";

export default function AttendancePanel({ activities, userId, initialFilter = "todas" }: { activities: Activity[]; userId: string; initialFilter?: Filter }) {
  const supabase = useMemo(() => createClient(), []);
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [forms, setForms] = useState<Record<string, ResponseForm>>({});
  const toast = useToast();
  const queryClient = useQueryClient();
  const queryKey = ["attendance", userId, activities.map((activity) => activity.id)];

  const { data, isPending, isError, refetch } = useQuery({
    queryKey,
    enabled: Boolean(supabase),
    queryFn: async () => {
      if (!supabase) throw new Error("Serviço indisponível no momento.");
      // Uma única chamada para todas as atividades (antes era uma por atividade).
      const [attendanceResult, rosterResult] = await Promise.all([
        activities.length
          ? supabase.rpc("get_activities_attendance", { requested_activity_ids: activities.map((activity) => activity.id) })
          : Promise.resolve({ data: [], error: null }),
        supabase.rpc("get_member_roster"),
      ]);
      if (attendanceResult.error) throw attendanceResult.error;
      if (rosterResult.error) throw rosterResult.error;
      const entries: Record<string, AttendanceEntry[]> = Object.fromEntries(activities.map((activity) => [activity.id, []]));
      for (const { activity_id, ...entry } of (attendanceResult.data ?? []) as Array<AttendanceEntry & { activity_id: string }>) {
        (entries[activity_id] ??= []).push(entry as AttendanceEntry);
      }
      return { entries, roster: (rosterResult.data ?? []) as RosterEntry[] };
    },
  });
  // Outro membro respondeu (ou mudou de patente/graduação): atualiza a lista na hora.
  useRealtimeTables(["activity_attendance", "profiles"], () => { void queryClient.invalidateQueries({ queryKey: ["attendance"] }); });
  const entries = data?.entries ?? {};
  const roster = data?.roster ?? [];
  const responseMutation = useMutation({
    mutationFn: async ({ activity, response }: { activity: Activity; response: AttendanceResponse | null }) => {
      if (!supabase) throw new Error("Serviço indisponível no momento.");
      if (response) {
        const form = forms[activity.id] ?? { guest_count: 0, note: "" };
        const { error } = await supabase.from("activity_attendance").upsert({ activity_id: activity.id, user_id: userId, response, guest_count: response === "vai" ? form.guest_count : 0, note: form.note.trim() || null }, { onConflict: "activity_id,user_id" });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("activity_attendance").delete().eq("activity_id", activity.id).eq("user_id", userId);
        if (error) throw error;
      }
      return { activity, response };
    },
    onSuccess: ({ activity, response }) => {
      toast.success(response === null ? "Resposta removida." : response === "vai" ? "Presença confirmada." : "Ausência registrada.");
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const busy = responseMutation.isPending ? responseMutation.variables?.activity.id ?? null : null;

  function formFor(activityId: string) {
    if (forms[activityId]) return forms[activityId];
    const own = entries[activityId]?.find((entry) => entry.user_id === userId);
    return own ? { guest_count: own.guest_count, note: own.note || "" } : { guest_count: 0, note: "" };
  }

  function updateForm(activityId: string, update: Partial<ResponseForm>) {
    setForms((current) => ({
      ...current,
      [activityId]: { ...(current[activityId] ?? { guest_count: 0, note: "" }), ...update },
    }));
  }

  async function saveResponse(activity: Activity, response: AttendanceResponse) {
    responseMutation.mutate({ activity, response });
  }

  async function removeResponse(activityId: string) {
    const activity = activities.find((item) => item.id === activityId);
    if (activity) responseMutation.mutate({ activity, response: null });
  }

  function listText(activity: Activity) {
    return buildShareText(activity, entries[activity.id] ?? [], roster);
  }

  async function copyList(activity: Activity) {
    try {
      await navigator.clipboard.writeText(listText(activity));
      toast.success("Lista copiada.");
    } catch {
      toast.error("O navegador não permitiu copiar a lista.");
    }
  }

  function shareOnWhatsApp(activity: Activity) {
    window.open(`https://wa.me/?text=${encodeURIComponent(listText(activity))}`, "_blank", "noopener,noreferrer");
  }

  if (!activities.length) {
    return <div className="empty-state"><Users /><h2>Nenhuma atividade aberta</h2><p>Quando houver uma nova atividade, ela aparece aqui.</p></div>;
  }

  if (isPending) return <div className="empty-state" role="status">Carregando presenças…</div>;

  const ownResponse = (activity: Activity) => entries[activity.id]?.find((entry) => entry.user_id === userId)?.response;
  const matches = (activity: Activity, wanted: Filter) =>
    wanted === "todas" || (wanted === "pendentes" ? !isActivityClosed(activity) && !ownResponse(activity) : ownResponse(activity) === "vai");
  const filterCounts: Record<Filter, number> = {
    todas: activities.length,
    pendentes: activities.filter((activity) => matches(activity, "pendentes")).length,
    vou: activities.filter((activity) => matches(activity, "vou")).length,
  };
  // As atividades já chegam em ordem de data: cada mês vira um bloco com título.
  const groups: Array<{ title: string; items: Activity[] }> = [];
  for (const activity of activities.filter((item) => matches(item, filter))) {
    const title = monthTitle(activity);
    const last = groups[groups.length - 1];
    if (last?.title === title) last.items.push(activity);
    else groups.push({ title, items: [activity] });
  }

  return (
    <div className="m-activities">
      {isError && <div className="empty-state" role="alert">Não foi possível carregar as presenças. <button className="text-button" onClick={() => void refetch()}>Tentar novamente</button></div>}
      <div className="m-filters" role="group" aria-label="Filtrar atividades">
        {(Object.keys(filterLabels) as Filter[]).map((key) => (
          <button key={key} type="button" aria-pressed={filter === key} onClick={() => setFilter(key)}>
            {filterLabels[key]}<span className="count-pill">{filterCounts[key]}</span>
          </button>
        ))}
      </div>
      {!groups.length && <div className="empty-state" role="status"><Users /><h2>{filter === "pendentes" ? "Nada sem resposta" : "Nenhuma atividade aqui"}</h2><p>{filter === "pendentes" ? "Você já respondeu todas as atividades abertas." : "Quando você confirmar presença, as atividades aparecem aqui."}</p></div>}
      {groups.map((group) => <section className="m-month" key={group.title} aria-label={group.title}>
        <h2 className="m-month-title">{group.title}</h2>
      {group.items.map((activity) => {
        const activityEntries = entries[activity.id] ?? [];
        const own = activityEntries.find((entry) => entry.user_id === userId);
        const attending = activityEntries.filter((entry) => entry.response === "vai");
        const absent = activityEntries.filter((entry) => entry.response === "nao_vai");
        const isClosed = isActivityClosed(activity);
        const start = new Date(activity.starts_at);
        const confirmed = attending.length + attending.reduce((total, entry) => total + entry.guest_count, 0);
        const form = formFor(activity.id);
        const closedReason = activity.status === "cancelado" ? "Atividade cancelada." : activity.status === "finalizado" ? "Atividade finalizada." : "A lista de presença está fechada.";

        return (
          <article className="m-activity" id={`activity-${activity.id}`} key={activity.id} data-answer={own?.response ?? (isClosed ? "closed" : "open")}>
            <header>
              <span className="date-chip" aria-hidden="true"><strong>{start.toLocaleDateString("pt-BR", { day: "2-digit", timeZone: "America/Sao_Paulo" })}</strong><small>{start.toLocaleDateString("pt-BR", { month: "short", timeZone: "America/Sao_Paulo" }).replace(".", "")}</small></span>
              <div className="m-activity-title">
                <div className="m-activity-tags"><span>{activity.type}</span>{activity.status !== "confirmado" && <StatusBadge status={activity.status} />}{own && <StatusBadge status={own.response === "vai" ? "aprovado" : "suspenso"} label={own.response === "vai" ? "Você vai" : "Você não vai"} />}</div>
                <h3>{activity.title}</h3>
                <p><span>{start.toLocaleDateString("pt-BR", dateOptions)} · {activityTime(activity)}</span><span>{activity.location}</span></p>
              </div>
              <div className="m-activity-count"><strong>{confirmed}</strong><small>confirmados</small></div>
            </header>

            <div className="m-answer">
              {isClosed
                ? <p className="m-activity-note" role="status">{closedReason}</p>
                : <>
                  <div className="m-answer-buttons" role="group" aria-label={`Sua resposta para ${activity.title}`}>
                    <button type="button" className={own?.response === "vai" ? "is-yes" : ""} aria-pressed={own?.response === "vai"} disabled={busy === activity.id} onClick={() => saveResponse(activity, "vai")}>{busy === activity.id ? <span className="inline-spinner" aria-label="Salvando" /> : <Check size={18} />} Vou</button>
                    <button type="button" className={own?.response === "nao_vai" ? "is-no" : ""} aria-pressed={own?.response === "nao_vai"} disabled={busy === activity.id} onClick={() => saveResponse(activity, "nao_vai")}><X size={18} /> Não vou</button>
                  </div>
                  <details className="m-answer-more" open={Boolean(form.guest_count || form.note)}>
                    <summary>Convidados e observação</summary>
                    <div className="m-answer-fields">
                      <div className="field"><label htmlFor={`guests-${activity.id}`}>Convidados ou recrutas com você</label><input id={`guests-${activity.id}`} type="number" inputMode="numeric" min="0" max="30" value={form.guest_count} onChange={(event) => updateForm(activity.id, { guest_count: Number(event.target.value) })} /></div>
                      <div className="field"><label htmlFor={`note-${activity.id}`}>Observação pública<span className="opt">opcional</span></label><input id={`note-${activity.id}`} maxLength={180} value={form.note} onChange={(event) => updateForm(activity.id, { note: event.target.value })} placeholder="Ex.: imprevisto, trabalhando…" /></div>
                    </div>
                    <p className="field-hint">Depois de alterar, toque em Vou ou Não vou para salvar.</p>
                  </details>
                  {own && <button className="text-button" type="button" disabled={busy === activity.id} onClick={() => removeResponse(activity.id)}>{busy === activity.id ? "Salvando…" : "Remover minha resposta"}</button>}
                </>}
            </div>

            <div className="m-lists">
              <details open={attending.length > 0}>
                <summary><span>Vão participar</span><span className="count-pill">{attending.length}</span></summary>
                {attending.length ? <ol>{attending.map((entry) => <li key={entry.user_id}>{responseLine(entry, 0).replace(/^1\. /, "")}<AttendanceInsignias entry={entry} /></li>)}</ol> : <p>Nenhuma confirmação.</p>}
              </details>
              <details>
                <summary><span>Não poderão ir</span><span className="count-pill">{absent.length}</span></summary>
                {absent.length ? <ol>{absent.map((entry) => <li key={entry.user_id}>{responseLine(entry, 0).replace(/^1\. /, "")}<AttendanceInsignias entry={entry} /></li>)}</ol> : <p>Nenhuma ausência informada.</p>}
              </details>
            </div>

            <footer>
              <button className="button button-ghost button-small" type="button" onClick={() => copyList(activity)}><Clipboard size={16} /> Copiar lista</button>
              <button className="button button-ghost button-small" type="button" onClick={() => shareOnWhatsApp(activity)}><MessageCircle size={16} /> WhatsApp</button>
            </footer>
          </article>
        );
      })}
      </section>)}
    </div>
  );
}
