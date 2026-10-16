"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Cake, CalendarDays, Check, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { Activity, ActivityStatus, AttendanceResponse } from "@/lib/types";

import type { MemberBirthday } from "@/lib/birthdays";

const weekdays = ["D", "S", "T", "Q", "Q", "S", "S"];
const statusLabel: Record<ActivityStatus, string> = {
  confirmado: "Confirmado",
  a_definir: "A definir",
  adiado: "Adiado",
  cancelado: "Cancelado",
  finalizado: "Finalizado",
};

function activityDateKey(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function eventTimes(activity: Activity) {
  const start = new Date(activity.starts_at);
  const end = activity.ends_at ? new Date(activity.ends_at) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  return { start, end };
}

export default function CalendarYearView({ activities, initialYear, isApprovedMember, attendanceByActivity, birthdays }: { birthdays: MemberBirthday[]; activities: Activity[]; initialYear: number; isApprovedMember: boolean; attendanceByActivity: Record<string, AttendanceResponse> }) {
  const [year, setYear] = useState(initialYear);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const activitiesByDate = useMemo(() => {
    const grouped = new Map<string, Activity[]>();
    for (const activity of activities) {
      const key = activityDateKey(activity.starts_at);
      grouped.set(key, [...(grouped.get(key) || []), activity]);
    }
    return grouped;
  }, [activities]);

  const months = Array.from({ length: 12 }, (_, month) => {
    const firstWeekday = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const cells: Array<{ day: number; key: string } | null> = [
      ...Array.from({ length: firstWeekday }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => {
        const day = index + 1;
        return { day, key: `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}` };
      }),
    ];
    return { month, cells };
  });
  const selectedActivities = selectedDate ? activitiesByDate.get(selectedDate) || [] : [];
  const selectedBirthdays = isApprovedMember && selectedDate ? birthdays.filter((member) => member.month === Number(selectedDate.slice(5, 7)) && member.day === Number(selectedDate.slice(8, 10))) : [];
  const selectedLabel = selectedDate
    ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeZone: "UTC" }).format(new Date(`${selectedDate}T12:00:00Z`))
    : "";

  return (
    <div className="year-calendar">
      <div className="year-calendar-heading">
        <div><p className="eyebrow">Agenda anual</p><h3>Calendário do DK</h3><p>Os dias marcados têm atividades. Selecione uma data para ver os detalhes.</p></div>
        <div className="year-calendar-controls" aria-label="Navegar entre anos">
          <button type="button" aria-label="Ano anterior" onClick={() => { setYear(year - 1); setSelectedDate(null); }}><ChevronLeft /></button>
          <strong>{year}</strong>
          <button type="button" aria-label="Próximo ano" onClick={() => { setYear(year + 1); setSelectedDate(null); }}><ChevronRight /></button>
        </div>
      </div>

      <div className="year-calendar-grid">
        {months.map(({ month, cells }) => (
          <section className="year-calendar-month" key={`${year}-${month}`} aria-label={new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month, 1)))}>
            <h4>{new Intl.DateTimeFormat("pt-BR", { month: "long", timeZone: "UTC" }).format(new Date(Date.UTC(year, month, 1)))}</h4>
            <div className="year-calendar-days">
              {weekdays.map((day, index) => <span className="year-calendar-weekday" key={`${day}-${index}`}>{day}</span>)}
              {cells.map((cell, index) => {
                if (!cell) return <span className="year-calendar-empty" key={`empty-${index}`} />;
                const dayActivities = activitiesByDate.get(cell.key) || [];
                const dayBirthdays = isApprovedMember ? birthdays.filter((member) => member.month === month + 1 && member.day === cell.day) : [];
                return dayActivities.length || dayBirthdays.length ? (
                  <button
                    className={`year-calendar-day has-events${selectedDate === cell.key ? " selected" : ""}`}
                    key={cell.key}
                    type="button"
                    aria-label={`${cell.day}: ${[...dayActivities.map((activity) => activity.title), ...dayBirthdays.map((member) => `Aniversário de ${member.nickname}`)].join(", ")}`}
                    aria-pressed={selectedDate === cell.key}
                    onClick={() => setSelectedDate(selectedDate === cell.key ? null : cell.key)}
                  >{cell.day}
                    {dayActivities.length > 0 && <span>{dayActivities.length}</span>}
                    {dayBirthdays.length > 0 && <Cake className="calendar-birthday-marker" size={12} aria-hidden="true" />}
                  </button>
                ) : <span className="year-calendar-day" key={cell.key}>{cell.day}</span>;
              })}
            </div>
          </section>
        ))}
      </div>

      {selectedDate && (
        <section className="year-calendar-selected" aria-live="polite">
          <div className="year-calendar-selected-heading">
            <div className="year-calendar-selected-title"><CalendarDays /><h4>{selectedLabel}</h4></div>
          </div>
          {selectedBirthdays.map((member) => <article className="year-calendar-event" key={`birthday-${member.user_id}`}><div><h5><Cake size={18} aria-hidden="true" /> Aniversário de {member.nickname}</h5><p>Feliz aniversário! 🎉</p></div></article>)}
          {selectedActivities.length ? selectedActivities.map((activity) => {
            const { start } = eventTimes(activity);
            return (
              <article className="year-calendar-event" key={activity.id}>
                <div className="year-calendar-event-info">
                  <div className="year-calendar-event-topline">
                    <span>{start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })} · {activity.type}</span>
                    <span className={`badge ${activity.status}`}>{statusLabel[activity.status]}</span>
                  </div>
                  <h5>{activity.title}</h5><p>{activity.location}</p>{activity.description && <p>{activity.description}</p>}
                </div>
                <div className="year-calendar-attendance-actions">
                  {attendanceByActivity[activity.id] && <span className={`calendar-response-hint ${attendanceByActivity[activity.id] === "vai" ? "is-going" : "is-not-going"}`}>
                    {attendanceByActivity[activity.id] === "vai" ? <Check size={13} /> : <X size={13} />}
                    {attendanceByActivity[activity.id] === "vai" ? "Você vai" : "Você não vai"}
                  </span>}
                  {isApprovedMember && activity.attendance_open && activity.status !== "cancelado" && activity.status !== "finalizado" && (
                    <Link className="button button-primary calendar-attendance-link" href={`/membro/atividades#activity-${activity.id}`}>
                      {attendanceByActivity[activity.id] ? "Ver resposta" : "Confirmar presença"} <ArrowRight size={17} />
                    </Link>
                  )}
                </div>
              </article>
            );
          }) : !selectedBirthdays.length && <p>Nenhuma atividade nesta data.</p>}
        </section>
      )}
    </div>
  );
}
