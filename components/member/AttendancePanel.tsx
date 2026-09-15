"use client";

import { Check, Clipboard, MessageCircle, Users, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const [entries, setEntries] = useState<Record<string, AttendanceEntry[]>>({});
  const [forms, setForms] = useState<Record<string, ResponseForm>>({});
  const [roster, setRoster] = useState<RosterEntry[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const loadAttendance = useCallback(async (activityId: string) => {
    if (!supabase) return;
    const { data } = await supabase.rpc("get_activity_attendance", { requested_activity_id: activityId });
    const nextEntries = (data ?? []) as AttendanceEntry[];
    setEntries((current) => ({ ...current, [activityId]: nextEntries }));
    const own = nextEntries.find((entry) => entry.user_id === userId);
    if (own) setForms((current) => ({ ...current, [activityId]: { guest_count: own.guest_count, note: own.note || "" } }));
  }, [supabase, userId]);

  useEffect(() => {
    if (!supabase) return;
    void Promise.all(activities.map((activity) => loadAttendance(activity.id)));
    void supabase.rpc("get_member_roster").then(({ data }) => setRoster((data ?? []) as RosterEntry[]));
  }, [activities, loadAttendance, supabase]);

  function show(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  function formFor(activityId: string) {
    return forms[activityId] ?? { guest_count: 0, note: "" };
  }

  function updateForm(activityId: string, update: Partial<ResponseForm>) {
    setForms((current) => ({
      ...current,
      [activityId]: { ...(current[activityId] ?? { guest_count: 0, note: "" }), ...update },
    }));
  }

  async function saveResponse(activity: Activity, response: AttendanceResponse) {
    if (!supabase) return;
    setBusy(activity.id);
    const form = formFor(activity.id);
    const { error } = await supabase.from("activity_attendance").upsert({
      activity_id: activity.id,
      user_id: userId,
      response,
      guest_count: response === "vai" ? form.guest_count : 0,
      note: form.note.trim() || null,
    }, { onConflict: "activity_id,user_id" });
    if (error) show(error.message);
    else {
      show(response === "vai" ? "Presença confirmada." : "Ausência registrada.");
      await loadAttendance(activity.id);
    }
    setBusy(null);
  }

  async function removeResponse(activityId: string) {
    if (!supabase) return;
    setBusy(activityId);
    const { error } = await supabase.from("activity_attendance").delete().eq("activity_id", activityId).eq("user_id", userId);
    if (error) show(error.message);
    else {
      show("Resposta removida.");
      await loadAttendance(activityId);
    }
    setBusy(null);
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

  return (
    <div className="attendance-list">
      {notice && <div className="admin-notice">{notice}</div>}
      {activities.map((activity) => {
        const activityEntries = entries[activity.id] ?? [];
        const own = activityEntries.find((entry) => entry.user_id === userId);
        const attending = activityEntries.filter((entry) => entry.response === "vai");
        const absent = activityEntries.filter((entry) => entry.response === "nao_vai");
        const isClosed = !activity.attendance_open || activity.status === "cancelado" || activity.status === "finalizado";

        return (
          <article className="attendance-card" key={activity.id}>
            <header>
              <div><span>{activity.type}</span><h2>{activity.title}</h2><p>{new Date(activity.starts_at).toLocaleDateString("pt-BR", dateOptions)} • {activityTime(activity)} • {activity.location}</p></div>
              <div className="attendance-count"><strong>{attending.length + attending.reduce((total, entry) => total + entry.guest_count, 0)}</strong><small>confirmados</small></div>
            </header>

            <div className="attendance-response">
              <div className="field"><label>Convidados ou recrutas com você</label><input type="number" min="0" max="30" value={formFor(activity.id).guest_count} disabled={isClosed} onChange={(event) => updateForm(activity.id, { guest_count: Number(event.target.value) })} /></div>
              <div className="field"><label>Observação pública (opcional)</label><input maxLength={180} value={formFor(activity.id).note} disabled={isClosed} onChange={(event) => updateForm(activity.id, { note: event.target.value })} placeholder="Ex.: imprevisto, trabalhando..." /></div>
              <div className="attendance-actions">
                <button className={`button ${own?.response === "vai" ? "button-primary" : "button-ghost"}`} disabled={isClosed || busy === activity.id} onClick={() => saveResponse(activity, "vai")}><Check size={17} /> Vou</button>
                <button className={`button ${own?.response === "nao_vai" ? "button-danger" : "button-ghost"}`} disabled={isClosed || busy === activity.id} onClick={() => saveResponse(activity, "nao_vai")}><X size={17} /> Não vou</button>
                {own && <button className="text-button" disabled={isClosed || busy === activity.id} onClick={() => removeResponse(activity.id)}>Remover resposta</button>}
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
