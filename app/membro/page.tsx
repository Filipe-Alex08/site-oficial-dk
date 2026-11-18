import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CalendarCheck, ClipboardCheck, FileText, LogOut, Settings } from "lucide-react";
import AppPageHeader from "@/components/member/AppPageHeader";
import Unavailable from "@/components/member/Unavailable";
import EditMemberProfile from "@/components/member/EditMemberProfile";
import { getZodiacSign } from "@/lib/zodiac";
import BirthdayBadge from "@/components/member/BirthdayBadge";
import MemberAvatar from "@/components/member/MemberAvatar";
import { BuildInsignia, GraduationInsignia, GraduationInsignias, RankInsignia } from "@/components/member/Insignia";
import TrackGroup from "@/components/member/TrackGroup";
import CountBadge from "@/components/ui/CountBadge";
import { createAdminClient } from "@/lib/supabase/admin";
import { getBuildIcon } from "@/lib/insignias";
import { graduationLabels, graduationTracks, houseFor, isCommander, memberKindLabels, rankLabels } from "@/lib/member-access";
import LiveRefresh from "@/components/LiveRefresh";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Painel do Membro" };

export default async function MemberPage() {
  // Perfil, papéis e permissões saem juntos (e compartilhados com o resto da requisição).
  const { supabase, user, profile, roles: roleList, canManageAssessments, canViewLogs } = await getViewer();

  if (!supabase) return <Unavailable />;
  if (!user) redirect("/area-do-membro/login");
  if (!profile || profile.status !== "aprovado") redirect("/area-do-membro/login");
  const profileAvatarUrl = profile.avatar_path
    ? supabase.storage.from("profile-avatars").getPublicUrl(profile.avatar_path).data.publicUrl
    : null;

  const isAdmin = roleList.length > 0 || canManageAssessments || canViewLogs;

  // Badges dos cartões: só o que exige ação do próprio membro/administrador.
  // Nenhuma dessas consultas depende das outras: todas partem ao mesmo tempo.
  const nowIso = new Date().toISOString();
  const managesMembers = roleList.includes("principal") || roleList.includes("membros");
  const admin = createAdminClient();
  const [{ data: openActivities }, { data: myResponses }, assignmentsResult, { data: reviewRows }] = await Promise.all([
    supabase.from("activities").select("id").gte("starts_at", nowIso).eq("attendance_open", true).neq("status", "cancelado"),
    supabase.from("activity_attendance").select("activity_id").eq("user_id", user.id),
    admin
      ? admin.from("assessment_assignments").select("id", { count: "exact", head: true }).eq("member_id", user.id).in("status", ["convidado", "em_andamento"]).or(`expires_at.is.null,expires_at.gt.${nowIso}`)
      : Promise.resolve({ count: 0 }),
    managesMembers
      ? supabase.from("profiles").select("id,status,access_request_id,graduation_review_needed").or("status.eq.pendente,access_request_id.not.is.null,graduation_review_needed.eq.true")
      : Promise.resolve({ data: [] as { id: string; status: string; access_request_id: string | null; graduation_review_needed: boolean | null }[] }),
  ]);
  const answered = new Set((myResponses ?? []).map((row) => row.activity_id as string));
  const activitiesToAnswer = (openActivities ?? []).filter((activity) => !answered.has(activity.id as string)).length;
  const assessmentsToTake = assignmentsResult.count ?? 0;
  // Mesma regra da aba Membros do painel administrativo.
  const isPrincipal = roleList.includes("principal");
  const membersToReview = (reviewRows ?? []).filter((row) =>
    row.status === "pendente" || (Boolean(row.access_request_id) && row.id !== user.id) || (isPrincipal && Boolean(row.graduation_review_needed)),
  ).length;

  return (
    <>
      <LiveRefresh tables={["activities", "activity_attendance", "assessment_assignments", "profiles", "user_admin_roles"]} />
      <AppPageHeader
        title={`Salve, ${profile.nickname}!`}
        action={<form action="/auth/signout" method="post"><button className="button button-ghost" type="submit"><LogOut size={18} /> Sair</button></form>}
      />
      <section className="section">
        <div className="container member-grid">
          <article className="profile-card">
            <MemberAvatar avatarUrl={profileAvatarUrl} avatarPath={profile.avatar_path ?? null} nickname={profile.nickname} userId={user.id} />
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
            <EditMemberProfile profile={profile} canEditAccessDirectly={roleList.length > 0}>
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
          <div className="member-options">
            <Link className="card" href="/membro/atividades"><span className="card-icon"><CalendarCheck /></span><h3>Atividades e presença</h3><p>Confirme sua participação e veja quem vai.</p><span className="card-cta">Abrir <ArrowRight aria-hidden="true" /></span><CountBadge count={activitiesToAnswer} label="atividades sem resposta" /></Link>
            <Link className="card" href="/membro/documentos"><span className="card-icon"><FileText /></span><h3>Documentos</h3><p>Materiais liberados para o seu perfil.</p><span className="card-cta">Abrir <ArrowRight aria-hidden="true" /></span></Link>
            <Link className="card" href="/membro/simulados"><span className="card-icon"><ClipboardCheck /></span><h3>Avaliações</h3><p>Suas indicações, provas e resultados.</p><span className="card-cta">Abrir <ArrowRight aria-hidden="true" /></span><CountBadge count={assessmentsToTake} label="avaliações para fazer" /></Link>
            {isAdmin && <Link className="card admin-access" href="/admin"><span className="card-icon"><Settings /></span><h3>Painel administrativo</h3><p>Mídias, calendário, membros e mais.</p><span className="card-cta">Abrir painel <ArrowRight aria-hidden="true" /></span><CountBadge count={membersToReview} label="membros aguardando ação" /></Link>}
          </div>
        </div>
      </section>
    </>
  );
}
