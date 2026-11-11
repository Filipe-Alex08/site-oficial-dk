"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, ArrowRight, Cake, CalendarDays, CalendarRange, Check, Clock3, ExternalLink, List, MapPin, X } from "lucide-react";
import type { MemberBirthday } from "@/lib/birthdays";
import CalendarYearView from "@/components/CalendarYearView";
import type { Activity, ActivityStatus, AttendanceResponse } from "@/lib/types";

const statusLabel: Record<ActivityStatus, string> = {
  confirmado: "Confirmado",
  a_definir: "A definir",
  adiado: "Adiado",
  cancelado: "Cancelado",
  finalizado: "Finalizado",
};

export default function CalendarViews({
  activities,
  upcomingActivities,
  activeNotices,
  isApprovedMember,
  attendanceByActivity,
  initialYear,
  birthdays,
  birthdaysUnavailable,
  currentMonth,
  googleCalendarUrl,
}: {
  activities: Activity[];
  upcomingActivities: Activity[];
  activeNotices: Activity[];
  isApprovedMember: boolean;
  attendanceByActivity: Record<string, AttendanceResponse>;
  initialYear: number;
  birthdays: MemberBirthday[];
  birthdaysUnavailable: boolean;
  currentMonth: number;
  googleCalendarUrl: string | null;
}) {
  const [view, setView] = useState<"cronograma" | "agenda">("cronograma");
  const monthBirthdays = isApprovedMember ? birthdays.filter((member) => member.month === currentMonth) : [];
  const activeNoticeIds = new Set(activeNotices.map((activity) => activity.id));

  return (
    <>
      {activeNotices.length > 0 && <section className="calendar-alerts" aria-label="Avisos importantes do calendário">
        {activeNotices.map((activity) => <article className={`calendar-alert is-${activity.notice_level || "informativo"}`} key={activity.id} role={activity.notice_level === "urgente" ? "alert" : "status"}>
          <AlertTriangle aria-hidden="true" />
          <div>
            <span>{activity.notice_level === "urgente" ? "Aviso urgente" : activity.notice_level === "atencao" ? "Atenção" : "Informativo"} · {statusLabel[activity.status]}</span>
            <h3>{activity.title}</h3>
            <p>{activity.notice_message}</p>
            <small>{new Date(activity.starts_at).toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short", timeZone: "America/Sao_Paulo" })} · {activity.location}</small>
          </div>
        </article>)}
      </section>}

      {googleCalendarUrl && <div className="calendar-subscription">
        <div><strong>Receba alterações no seu calendário</strong><p>Assine o calendário público do DK para acompanhar mudanças de data, horário e cancelamentos.</p></div>
        <a className="button button-ghost" href={googleCalendarUrl} target="_blank" rel="noopener noreferrer">Acompanhar no Google Agenda <ExternalLink size={16} /></a>
      </div>}

      <div className="calendar-mode-toggle" role="group" aria-label="Modo de visualização do calendário">
        <button type="button" className={view === "cronograma" ? "active" : ""} aria-pressed={view === "cronograma"} onClick={() => setView("cronograma")}>
          <List size={17} /> Próximas
        </button>
        <button type="button" className={view === "agenda" ? "active" : ""} aria-pressed={view === "agenda"} onClick={() => setView("agenda")}>
          <CalendarRange size={17} /> Ano todo
        </button>
      </div>

      {isApprovedMember && view === "agenda" && birthdaysUnavailable && <p role="status">Aniversários indisponíveis no momento.</p>}
      
      {isApprovedMember && view === "cronograma" && <section className="calendar-birthdays" aria-label="Aniversariantes do mês">
        <h3><Cake size={20} aria-hidden="true" /> Aniversariantes do mês</h3>
        {birthdaysUnavailable ? <p role="status">Aniversários indisponíveis no momento.</p> : monthBirthdays.length ? <ul>
          {monthBirthdays.map((member) => <li key={member.user_id}><strong>{String(member.day).padStart(2, "0")}/{String(member.month).padStart(2, "0")}</strong> {member.nickname}</li>)}
        </ul> : <p>Nenhum aniversário neste mês.</p>}
      </section>}

      {view === "cronograma" ? (
        <div className="activity-list">
          {!upcomingActivities.length && (
            <div className="empty-state">
              <CalendarDays />
              <h3>Nenhuma atividade agendada</h3>
            </div>
          )}
          {upcomingActivities.map((activity) => {
            const date = new Date(activity.starts_at);
            return (
              <article className="activity-card" key={activity.id}>
                <div className="date-block">
                  <strong>{date.toLocaleDateString("pt-BR", { day: "2-digit", timeZone: "America/Sao_Paulo" })}</strong>
                  <span>{date.toLocaleDateString("pt-BR", { month: "short", timeZone: "America/Sao_Paulo" }).replace(".", "")}</span>
                </div>
                <div className="activity-content">
                  <div className="activity-title-row">
                    <div><span className="activity-type">{activity.type}</span><h3>{activity.title}</h3></div>
                    <div className="activity-badges">
                      {attendanceByActivity[activity.id] && <span className={`calendar-response-hint ${attendanceByActivity[activity.id] === "vai" ? "is-going" : "is-not-going"}`}>
                        {attendanceByActivity[activity.id] === "vai" ? <Check size={13} /> : <X size={13} />}
                        {attendanceByActivity[activity.id] === "vai" ? "Você vai" : "Você não vai"}
                      </span>}
                      <span className={`badge ${activity.status}`}>{statusLabel[activity.status]}</span>
                    </div>
                  </div>
                  <p>{activity.description}</p>
                  {activity.notice_message && activeNoticeIds.has(activity.id) && <p className={`activity-notice-inline is-${activity.notice_level || "informativo"}`}><AlertTriangle size={17} aria-hidden="true" /> {activity.notice_message}</p>}
                  <div className="activity-meta">
                    <span><Clock3 size={16} /> {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}</span>
                    <span><MapPin size={16} /> {activity.location}</span>
                    <span><CalendarDays size={16} /> {date.toLocaleDateString("pt-BR", { weekday: "long", timeZone: "America/Sao_Paulo" })}</span>
                  </div>
                  {isApprovedMember && activity.attendance_open && activity.status !== "cancelado" && activity.status !== "finalizado" && (
                    <div className="calendar-attendance-actions">
                      <Link className="button button-primary calendar-attendance-link" href={`/membro/atividades#activity-${activity.id}`}>
                        {attendanceByActivity[activity.id] ? "Ver resposta" : "Confirmar presença"} <ArrowRight size={17} />
                      </Link>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : <CalendarYearView activities={activities} initialYear={initialYear} isApprovedMember={isApprovedMember} attendanceByActivity={attendanceByActivity} birthdays={isApprovedMember ? birthdays : []} />}
    </>
  );
}
