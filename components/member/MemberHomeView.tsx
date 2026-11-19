import Link from "next/link";
import { CalendarCheck, CalendarX, ChevronRight, ClipboardCheck, MapPin, NotebookPen, UserCheck } from "lucide-react";
import Panel from "@/components/admin/ui/Panel";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { GraduationInsignia } from "@/components/member/Insignia";
import MemberHero from "@/components/member/MemberHero";
import TrackGroup from "@/components/member/TrackGroup";
import { graduationLabels, graduationTracks, houseFor, isCommander, memberKindLabels, rankLabels } from "@/lib/member-access";
import { normalizeBuildName } from "@/lib/insignias";
import { relativeDayLabel } from "@/lib/relative-day";
import { getZodiacSign } from "@/lib/zodiac";
import type { MemberProfile } from "@/lib/types";

export type UpcomingActivity = { id: string; title: string; starts_at: string; location: string; type: string; status: string; attendance_open: boolean | null };

const TIME_ZONE = "America/Sao_Paulo";
const time = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });
const day = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", timeZone: TIME_ZONE });
const month = (iso: string) => new Date(iso).toLocaleDateString("pt-BR", { month: "short", timeZone: TIME_ZONE }).replace(".", "");

/** O que o membro respondeu (ou ainda pode responder) numa atividade, como selo. */
function AnswerBadge({ activity, answer }: { activity: UpcomingActivity; answer: string | undefined }) {
  const closed = !activity.attendance_open || activity.status === "finalizado";
  if (answer) return <StatusBadge status={answer === "vai" ? "aprovado" : "suspenso"} label={answer === "vai" ? "Você vai" : "Você não vai"} />;
  if (closed) return <span className="m-muted">Lista fechada</span>;
  return <StatusBadge status="pendente" label="Responder" />;
}

/** Corpo da página inicial do membro: só apresentação, sem acesso a dados (a página busca e entrega pronto). */
export default function MemberHomeView({ profile, profileAvatarUrl, userId, canEditAccessDirectly, isAdmin, counts, upcoming, responses }: {
  profile: MemberProfile;
  profileAvatarUrl: string | null;
  userId: string;
  canEditAccessDirectly: boolean;
  isAdmin: boolean;
  counts: { activitiesToAnswer: number; assessmentsToTake: number; membersToReview: number; notesUnread: number };
  upcoming: UpcomingActivity[];
  /** Resposta do membro por atividade: "vai" ou "nao_vai". */
  responses: Record<string, string>;
}) {
  const { activitiesToAnswer, assessmentsToTake, membersToReview, notesUnread } = counts;
  const attention = [
    { href: "/membro/atividades?filtro=pendentes", icon: <CalendarCheck />, count: activitiesToAnswer, title: `${activitiesToAnswer} ${activitiesToAnswer === 1 ? "atividade" : "atividades"} sem resposta`, text: "Confirme se você vai participar." },
    { href: "/membro/simulados", icon: <ClipboardCheck />, count: assessmentsToTake, title: `${assessmentsToTake} ${assessmentsToTake === 1 ? "avaliação" : "avaliações"} para fazer`, text: "Indicações abertas esperando você." },
    { href: "/membro/anotacoes", icon: <NotebookPen />, count: notesUnread, title: `${notesUnread} ${notesUnread === 1 ? "anotação nova" : "anotações novas"}`, text: "Deixadas para você por comandantes e oficiais." },
    ...(isAdmin ? [{ href: "/admin?secao=membros", icon: <UserCheck />, count: membersToReview, title: `${membersToReview} ${membersToReview === 1 ? "membro aguardando" : "membros aguardando"} ação`, text: "Cadastros e dados para conferir no painel." }] : []),
  ].filter((item) => item.count > 0);

  const [next, ...later] = upcoming;
  const nextDays = next ? relativeDayLabel(next.starts_at) : "";

  return (
    <section className="section">
      <div className="container m-home">
        <MemberHero profile={profile} avatarUrl={profileAvatarUrl} userId={userId} canEditAccessDirectly={canEditAccessDirectly} allClear={attention.length === 0} />

        <div className="m-home-grid">
          <div className="m-home-main">
            {attention.length > 0 && (
              <Panel title="Precisa da sua atenção" flush>
                <ul className="m-attention">{attention.map((item) => <li key={item.href}>
                  <Link href={item.href}><span className="m-attention-icon" aria-hidden="true">{item.icon}</span><span className="m-attention-text"><strong>{item.title}</strong><small>{item.text}</small></span><ChevronRight aria-hidden="true" /></Link>
                </li>)}</ul>
              </Panel>
            )}

            {next ? (
              <section className="m-next" aria-labelledby="m-next-title">
                <header>
                  <h2 id="m-next-title">Próxima atividade</h2>
                </header>
                <Link className="m-next-card" href={`/membro/atividades#activity-${next.id}`} data-answer={responses[next.id] ?? (!next.attendance_open || next.status === "finalizado" ? "closed" : "open")}>
                  <span className="m-next-date" aria-hidden="true"><strong>{day(next.starts_at)}</strong><small>{month(next.starts_at)}</small></span>
                  <span className="m-next-text">
                    <span className="m-next-when">{nextDays} · {time(next.starts_at)}</span>
                    <strong>{next.title}</strong>
                    <small><MapPin aria-hidden="true" /> {next.location}</small>
                  </span>
                  <AnswerBadge activity={next} answer={responses[next.id]} />
                </Link>
                {later.length > 0 && (
                  <ul className="m-upcoming" aria-label="Depois dessa">
                    {later.map((activity) => (
                      <li key={activity.id}>
                        <Link href={`/membro/atividades#activity-${activity.id}`}>
                          <span className="date-chip" aria-hidden="true"><strong>{day(activity.starts_at)}</strong><small>{month(activity.starts_at)}</small></span>
                          <span className="m-upcoming-text"><strong>{activity.title}</strong><small>{relativeDayLabel(activity.starts_at)} · {time(activity.starts_at)} · {activity.location}</small></span>
                          <AnswerBadge activity={activity} answer={responses[activity.id]} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : (
              <div className="empty-state m-no-activity"><CalendarX /><h2>Nenhuma atividade marcada</h2></div>
            )}
          </div>

          <aside className="m-home-side" aria-label="Ficha do membro">
            <Panel title="Ficha">
              <dl className="m-facts">
                <div><dt>Vínculo</dt><dd>{memberKindLabels[profile.member_kind]}</dd></div>
                <div><dt>Patente</dt><dd>{rankLabels[profile.rank]}</dd></div>
                <div><dt>Camisa</dt><dd>{profile.shirt_number ?? "—"}</dd></div>
                <div><dt>Build principal</dt><dd>{normalizeBuildName(profile.primary_build) || "Não informada"}</dd></div>
                <div><dt>Build secundária</dt><dd>{normalizeBuildName(profile.secondary_build) || "Não informada"}</dd></div>
                <div><dt>Signo</dt><dd>{getZodiacSign(profile.birth_date ?? "") || "—"}</dd></div>
              </dl>
            </Panel>

            <div className="m-tracks">
              {graduationTracks.map((track) => {
                const level = profile[track.field] ?? "sem_graduacao";
                const commander = isCommander(level, profile[track.commanderField]);
                const house = houseFor(profile, track.value);
                return (
                  <TrackGroup
                    key={track.value}
                    title={track.label}
                    icon={level !== "sem_graduacao" ? <GraduationInsignia level={level} track={track.value} variant="icon" commander={commander} /> : undefined}
                    tier={level !== "sem_graduacao" ? level : undefined}
                  >
                    <dl className="m-facts">
                      <div><dt>Graduação</dt><dd>{graduationLabels[level]}</dd></div>
                      {commander && <div><dt>Função</dt><dd>Comandante de {track.label}</dd></div>}
                      <div><dt>Casa</dt><dd>{house || "Não informada"}</dd></div>
                    </dl>
                  </TrackGroup>
                );
              })}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
