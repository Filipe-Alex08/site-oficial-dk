import { CalendarDays, Clock3, MapPin } from "lucide-react";
import { demoActivities } from "@/lib/content";
import type { ActivityStatus } from "@/lib/types";

const statusLabel: Record<ActivityStatus, string> = {
  confirmado: "Confirmado",
  a_definir: "A definir",
  adiado: "Adiado",
  cancelado: "Cancelado",
  finalizado: "Finalizado",
};

export default function CalendarSection() {
  return (
    <section className="section calendar-section" id="calendario">
      <div className="container">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Cronograma</p>
            <h2>Calendário do DK</h2>
          </div>
          <p>Confira os próximos treinos e atividades. Alterações são publicadas diretamente pela equipe responsável.</p>
        </div>

        <div className="activity-list">
          {demoActivities.map((activity) => {
            const date = new Date(activity.starts_at);
            return (
              <article className="activity-card" key={activity.id}>
                <div className="date-block">
                  <strong>{date.toLocaleDateString("pt-BR", { day: "2-digit", timeZone: "America/Sao_Paulo" })}</strong>
                  <span>{date.toLocaleDateString("pt-BR", { month: "short", timeZone: "America/Sao_Paulo" }).replace(".", "")}</span>
                </div>
                <div className="activity-content">
                  <div className="activity-title-row">
                    <div>
                      <span className="activity-type">{activity.type}</span>
                      <h3>{activity.title}</h3>
                    </div>
                    <span className={"badge " + activity.status}>{statusLabel[activity.status]}</span>
                  </div>
                  <p>{activity.description}</p>
                  <div className="activity-meta">
                    <span><Clock3 size={16} /> {date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })}</span>
                    <span><MapPin size={16} /> {activity.location}</span>
                    <span><CalendarDays size={16} /> {date.toLocaleDateString("pt-BR", { weekday: "long", timeZone: "America/Sao_Paulo" })}</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
