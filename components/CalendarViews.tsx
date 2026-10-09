"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, CalendarRange, Clock3, List, MapPin } from "lucide-react";
import CalendarYearView from "@/components/CalendarYearView";
import type { Activity, ActivityStatus } from "@/lib/types";

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
  isApprovedMember,
  initialYear,
}: {
  activities: Activity[];
  upcomingActivities: Activity[];
  isApprovedMember: boolean;
  initialYear: number;
}) {
  const [view, setView] = useState<"cronograma" | "agenda">("cronograma");

  return (
    <>
      <div className="calendar-mode-toggle" role="group" aria-label="Modo de visualização do calendário">
        <button type="button" className={view === "cronograma" ? "active" : ""} aria-pressed={view === "cronograma"} onClick={() => setView("cronograma")}>
          <List size={17} /> Cronograma
        </button>
        <button type="button" className={view === "agenda" ? "active" : ""} aria-pressed={view === "agenda"} onClick={() => setView("agenda")}>
          <CalendarRange size={17} /> Agenda
        </button>
      </div>

      {view === "cronograma" ? (
        <div className="activity-list">
          {!upcomingActivities.length && (
            <div className="empty-state">
              <CalendarDays />
              <h3>Nenhuma atividade agendada</h3>
              <p>As próximas atividades do DK aparecerão aqui assim que forem cadastradas.</p>
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
                    <span className={`badge ${activity.status}`}>{statusLabel[activity.status]}</span>
                  </div>
                  <p>{activity.description}</p>
                  <div className="activity-meta">
                    <span><Clock3 size={16} /> {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}</span>
                    <span><MapPin size={16} /> {activity.location}</span>
                    <span><CalendarDays size={16} /> {date.toLocaleDateString("pt-BR", { weekday: "long", timeZone: "America/Sao_Paulo" })}</span>
                  </div>
                  {isApprovedMember && activity.attendance_open && activity.status !== "cancelado" && activity.status !== "finalizado" && (
                    <Link className="button button-primary calendar-attendance-link" href={`/membro/atividades#activity-${activity.id}`}>
                      Confirmar presença <ArrowRight size={17} />
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ) : <CalendarYearView activities={activities} initialYear={initialYear} isApprovedMember={isApprovedMember} />}
    </>
  );
}
