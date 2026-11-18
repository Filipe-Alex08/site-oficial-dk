import Link from "next/link";
import { CalendarCheck, CheckCircle2, ChevronRight, ClipboardCheck, FileText, Settings, UserCheck } from "lucide-react";
import Panel from "@/components/admin/ui/Panel";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import BirthdayBadge from "@/components/member/BirthdayBadge";
import EditMemberProfile from "@/components/member/EditMemberProfile";
import { BuildInsignia, GraduationInsignia, GraduationInsignias, RankInsignia } from "@/components/member/Insignia";
import MemberAvatar from "@/components/member/MemberAvatar";
import TrackGroup from "@/components/member/TrackGroup";
import { getBuildIcon } from "@/lib/insignias";
import { graduationLabels, graduationTracks, houseFor, isCommander, memberKindLabels, rankLabels } from "@/lib/member-access";
import { getZodiacSign } from "@/lib/zodiac";
import type { MemberProfile } from "@/lib/types";

export type UpcomingActivity = { id: string; title: string; starts_at: string; location: string; type: string; status: string; attendance_open: boolean | null };

/** Corpo da página inicial do membro: só apresentação, sem acesso a dados (a página busca e entrega pronto). */
export default function MemberHomeView({ profile, profileAvatarUrl, userId, canEditAccessDirectly, isAdmin, counts, upcoming, responses }: {
  profile: MemberProfile;
  profileAvatarUrl: string | null;
  userId: string;
  canEditAccessDirectly: boolean;
  isAdmin: boolean;
  counts: { activitiesToAnswer: number; assessmentsToTake: number; membersToReview: number };
  upcoming: UpcomingActivity[];
  /** Resposta do membro por atividade: "vai" ou "nao_vai". */
  responses: Record<string, string>;
}) {
  const { activitiesToAnswer, assessmentsToTake, membersToReview } = counts;
  const attention = [
    { href: "/membro/atividades", icon: <CalendarCheck />, count: activitiesToAnswer, title: `${activitiesToAnswer} ${activitiesToAnswer === 1 ? "atividade" : "atividades"} sem resposta`, text: "Confirme se você vai participar." },
    { href: "/membro/simulados", icon: <ClipboardCheck />, count: assessmentsToTake, title: `${assessmentsToTake} ${assessmentsToTake === 1 ? "avaliação" : "avaliações"} para fazer`, text: "Indicações abertas esperando você." },
    ...(isAdmin ? [{ href: "/admin?secao=membros", icon: <UserCheck />, count: membersToReview, title: `${membersToReview} ${membersToReview === 1 ? "membro aguardando" : "membros aguardando"} ação`, text: "Cadastros e dados para conferir no painel." }] : []),
  ].filter((item) => item.count > 0);

  return (
      <section className="section">
        <div className="container m-home">
          <div className="m-home-main">
            <Panel title="Precisa da sua atenção" description={attention.length ? "O que está esperando por você." : undefined} flush>
              {attention.length
                ? <ul className="m-attention">{attention.map((item) => <li key={item.href}>
                  <Link href={item.href}><span className="m-attention-icon" aria-hidden="true">{item.icon}</span><span className="m-attention-text"><strong>{item.title}</strong><small>{item.text}</small></span><ChevronRight aria-hidden="true" /></Link>
                </li>)}</ul>
                : <p className="m-allclear"><CheckCircle2 aria-hidden="true" /> Tudo em dia. Nada esperando por você agora.</p>}
            </Panel>

            <Panel title="Próximas atividades" actions={<Link className="text-button" href="/membro/atividades">Ver todas</Link>} flush>
              {upcoming.length
                ? <ul className="m-upcoming">{upcoming.map((activity) => {
                  const start = new Date(activity.starts_at);
                  const answer = responses[activity.id];
                  const closed = !activity.attendance_open || activity.status === "finalizado";
                  return <li key={activity.id}>
                    <Link href={`/membro/atividades#activity-${activity.id}`}>
                      <span className="date-chip" aria-hidden="true"><strong>{start.toLocaleDateString("pt-BR", { day: "2-digit", timeZone: "America/Sao_Paulo" })}</strong><small>{start.toLocaleDateString("pt-BR", { month: "short", timeZone: "America/Sao_Paulo" }).replace(".", "")}</small></span>
                      <span className="m-upcoming-text"><strong>{activity.title}</strong><small>{start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" })} · {activity.location}</small></span>
                      {answer ? <StatusBadge status={answer === "vai" ? "aprovado" : "suspenso"} label={answer === "vai" ? "Você vai" : "Você não vai"} /> : closed ? <span className="m-muted">Lista fechada</span> : <StatusBadge status="pendente" label="Responder" />}
                    </Link>
                  </li>;
                })}</ul>
                : <p className="m-allclear">Nenhuma atividade marcada por enquanto.</p>}
            </Panel>

            <div className="m-shortcuts">
              <Link href="/membro/documentos"><span className="m-attention-icon" aria-hidden="true"><FileText /></span><span><strong>Documentos</strong><small>Materiais liberados para o seu perfil.</small></span><ChevronRight aria-hidden="true" /></Link>
              <Link href="/membro/simulados"><span className="m-attention-icon" aria-hidden="true"><ClipboardCheck /></span><span><strong>Avaliações</strong><small>Indicações, provas e resultados.</small></span><ChevronRight aria-hidden="true" /></Link>
              {isAdmin && <Link className="is-admin" href="/admin"><span className="m-attention-icon" aria-hidden="true"><Settings /></span><span><strong>Painel administrativo</strong><small>Mídias, calendário, membros e mais.</small></span><ChevronRight aria-hidden="true" /></Link>}
            </div>
          </div>

          <aside className="m-home-side">
          <article className="profile-card">
            <MemberAvatar avatarUrl={profileAvatarUrl} avatarPath={profile.avatar_path ?? null} nickname={profile.nickname} userId={userId} />
            <h2>{profile.nickname}</h2>
            <BirthdayBadge birthDate={profile.birth_date} />
            <p className="profile-fullname">{profile.full_name}</p>
            <div className="profile-insignias" role="group" aria-label="Patente, graduação e builds">
              <RankInsignia rank={profile.rank} variant="badge" />
              <GraduationInsignias profile={profile} variant="badge" />
              {getBuildIcon(profile.primary_build) && <BuildInsignia build={profile.primary_build} variant="badge" caption="Principal" />}
              {getBuildIcon(profile.secondary_build) && <BuildInsignia build={profile.secondary_build} variant="badge" caption="Secundária" />}
            </div>
            {profile.graduation_review_needed && <p className="form-help">Sua graduação está em revisão: um administrador vai definir o nível em cada trilha.</p>}
            <EditMemberProfile profile={profile} canEditAccessDirectly={canEditAccessDirectly}>
              <dl>
                <div><dt>Vínculo</dt><dd>{memberKindLabels[profile.member_kind]}</dd></div>
                <div><dt>Patente</dt><dd>{rankLabels[profile.rank]}</dd></div>
                <div><dt>Camisa</dt><dd>{profile.shirt_number ?? "—"}</dd></div>
                <div><dt>Build principal</dt><dd><BuildInsignia build={profile.primary_build} /></dd></div>
                <div><dt>Build secundária</dt><dd><BuildInsignia build={profile.secondary_build} /></dd></div>
                <div><dt>Signo</dt><dd>{getZodiacSign(profile.birth_date ?? "") || "—"}</dd></div>
              </dl>
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
                    <dl>
                      <div><dt>Graduação</dt><dd>{graduationLabels[level]}</dd></div>
                      {commander && <div><dt>Função</dt><dd>Comandante de {track.label}</dd></div>}
                      <div><dt>Casa</dt><dd>{house || "Não informada"}</dd></div>
                    </dl>
                  </TrackGroup>
                );
              })}
            </EditMemberProfile>
          </article>
          </aside>
        </div>
      </section>
  );
}
