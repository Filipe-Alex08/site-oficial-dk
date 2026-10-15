"use client";

import { Check, Clipboard, MessageCircle, Users, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rankLabels, rankOptions } from "@/lib/member-access";
import { createClient } from "@/lib/supabase/client";
import type { Activity, AttendanceEntry, AttendanceResponse, RosterEntry } from "@/lib/types";

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

export default function AttendancePanel({ activities, userId }: { activities: Activity[]; userId: string }) {
  const supabase = useMemo(() => createClient(), []);
  const [forms, setForms] = useState<Record<string, ResponseForm>>({});
  const [notice, setNotice] = useState("");
  const queryClient = useQueryClient();
  const queryKey = ["attendance", userId, activities.map((activity) => activity.id)];

  const { data, isPending, isError, refetch } = useQuery({
    queryKey,
    enabled: Boolean(supabase),
    queryFn: async () => {
      if (!supabase) throw new Error("Banco não configurado.");
      const [attendanceResults, rosterResult] = await Promise.all([
        Promise.all(activities.map(async (activity) => {
          const { data: rows, error } = await supabase.rpc("get_activity_attendance", { requested_activity_id: activity.id });
          if (error) throw error;
          return [activity.id, (rows ?? []) as AttendanceEntry[]] as const;
        })),
        supabase.rpc("get_member_roster"),
      ]);
      if (rosterResult.error) throw rosterResult.error;
      return { entries: Object.fromEntries(attendanceResults) as Record<string, AttendanceEntry[]>, roster: (rosterResult.data ?? []) as RosterEntry[] };
    },
  });
  const entries = data?.entries ?? {};
  const roster = data?.roster ?? [];
  const responseMutation = useMutation({
    mutationFn: async ({ activity, response }: { activity: Activity; response: AttendanceResponse | null }) => {
      if (!supabase) throw new Error("Banco não configurado.");
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
      show(response === null ? "Resposta removida." : response === "vai" ? "Presença confirmada." : "Ausência registrada.");
      void queryClient.invalidateQueries({ queryKey });
    },
    onError: (error: Error) => show(error.message),
  });
  const busy = responseMutation.isPending ? responseMutation.variables?.activity.id ?? null : null;

  function show(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

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
      show("Lista copiada.");
    } catch {
      show("O navegador não permitiu copiar a lista.");
    }
  }

  function shareOnWhatsApp(activity: Activity) {
    window.open(`https://wa.me/?text=${encodeURIComponent(listText(activity))}`, "_blank", "noopener,noreferrer");
  }

  if (!activities.length) {
    return <div className="empty-state"><Users /><h2>Nenhuma atividade disponível</h2><p>As atividades abertas para confirmação aparecerão aqui.</p></div>;
  }

  if (isPending) return <div className="empty-state" role="status">Carregando presenças…</div>;

  return (
    <div className="attendance-list">
      {notice && <div className="admin-notice">{notice}</div>}
      {isError && <div className="admin-notice" role="alert">Não foi possível carregar as presenças. <button className="text-button" onClick={() => void refetch()}>Tentar novamente</button></div>}
      {activities.map((activity) => {
        const activityEntries = entries[activity.id] ?? [];
        const own = activityEntries.find((entry) => entry.user_id === userId);
        const attending = activityEntries.filter((entry) => entry.response === "vai");
        const absent = activityEntries.filter((entry) => entry.response === "nao_vai");
        const isClosed = !activity.attendance_open || activity.status === "cancelado" || activity.status === "finalizado";

        return (
          <article className="attendance-card" id={`activity-${activity.id}`} key={activity.id}>
            <header>
              <div><span>{activity.type}</span><h2>{activity.title}</h2><p>{new Date(activity.starts_at).toLocaleDateString("pt-BR", dateOptions)} • {activityTime(activity)} • {activity.location}</p></div>
              <div className="attendance-count"><strong>{attending.length + attending.reduce((total, entry) => total + entry.guest_count, 0)}</strong><small>confirmados</small></div>
            </header>

            <div className="attendance-response">
              <div className="field"><label>Convidados ou recrutas com você</label><input type="number" min="0" max="30" value={formFor(activity.id).guest_count} disabled={isClosed} onChange={(event) => updateForm(activity.id, { guest_count: Number(event.target.value) })} /></div>
              <div className="field"><label>Observação pública (opcional)</label><input maxLength={180} value={formFor(activity.id).note} disabled={isClosed} onChange={(event) => updateForm(activity.id, { note: event.target.value })} placeholder="Ex.: imprevisto, trabalhando..." /></div>
              <div className="attendance-actions">
                <button className={`button ${own?.response === "vai" ? "button-primary" : "button-ghost"}`} disabled={isClosed || busy === activity.id} onClick={() => saveResponse(activity, "vai")}>{busy === activity.id ? <span className="inline-spinner" aria-label="Salvando" /> : <Check size={17} />} {busy === activity.id ? "Salvando…" : "Vou"}</button>
                <button className={`button ${own?.response === "nao_vai" ? "button-danger" : "button-ghost"}`} disabled={isClosed || busy === activity.id} onClick={() => saveResponse(activity, "nao_vai")}><X size={17} /> Não vou</button>
                {own && <button className="text-button" disabled={isClosed || busy === activity.id} onClick={() => removeResponse(activity.id)}>{busy === activity.id ? "Salvando…" : "Remover resposta"}</button>}
              </div>
            </div>

            <div className="attendance-columns">
              <div><h3>✅ Vão participar</h3>{attending.length ? <ol>{attending.map((entry) => <li key={entry.user_id}>{responseLine(entry, 0).replace(/^1\. /, "")}<small>{rankLabels[entry.rank]}</small></li>)}</ol> : <p>Nenhuma confirmação.</p>}</div>
              <div><h3>❌ Não poderão ir</h3>{absent.length ? <ol>{absent.map((entry) => <li key={entry.user_id}>{responseLine(entry, 0).replace(/^1\. /, "")}<small>{rankLabels[entry.rank]}</small></li>)}</ol> : <p>Nenhuma ausência informada.</p>}</div>
            </div>

            <footer>
              <p>O compartilhamento envia texto formatado. As marcações com @ precisam ser adicionadas manualmente no WhatsApp.</p>
              <div><button className="button button-ghost" onClick={() => copyList(activity)}><Clipboard size={17} /> Copiar lista</button><button className="button button-primary" onClick={() => shareOnWhatsApp(activity)}><MessageCircle size={17} /> WhatsApp</button></div>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
