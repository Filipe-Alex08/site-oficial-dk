import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, ClipboardCheck, FileText, LogOut, Settings } from "lucide-react";
import AppPageHeader from "@/components/member/AppPageHeader";
import Unavailable from "@/components/member/Unavailable";
import EditMemberProfile from "@/components/member/EditMemberProfile";
import BirthdayBadge from "@/components/member/BirthdayBadge";
import MemberAvatar from "@/components/member/MemberAvatar";
import { BuildInsignia, GraduationInsignia, GraduationInsignias, RankInsignia } from "@/components/member/Insignia";
import TrackSection from "@/components/member/TrackSection";
import { getBuildIcon } from "@/lib/insignias";
import { graduationLabels, graduationTracks, houseFor, memberKindLabels, rankLabels } from "@/lib/member-access";
import type { MemberProfile } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Painel do Membro" };

export default async function MemberPage() {
  const supabase = await createClient();

  if (!supabase) return <Unavailable />;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/area-do-membro/login");

  const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const profile = profileData as MemberProfile | null;
  if (!profile || profile.status !== "aprovado") redirect("/area-do-membro/login");
  const profileAvatarUrl = profile.avatar_path
    ? supabase.storage.from("profile-avatars").getPublicUrl(profile.avatar_path).data.publicUrl
    : null;

  const [{ data: adminRoles }, { data: canManageAssessments }] = await Promise.all([
    supabase.from("user_admin_roles").select("role").eq("user_id", user.id),
    supabase.rpc("can_manage_assessments"),
  ]);
  const isAdmin = Boolean(adminRoles?.length) || Boolean(canManageAssessments);

  return (
    <>
      <AppPageHeader
        title={`Salve, ${profile.nickname}!`}
        action={<form action="/auth/signout" method="post"><button className="button button-ghost" type="submit"><LogOut size={18} /> Sair</button></form>}
      />
      <section className="section">
        <div className="container member-grid">
          <article className="profile-card">
            <MemberAvatar avatarUrl={profileAvatarUrl} avatarPath={profile.avatar_path ?? null} nickname={profile.nickname} userId={user.id} />
            <h2>{profile.full_name}</h2>
            <BirthdayBadge birthDate={profile.birth_date} />
            <p>@{profile.nickname}</p>
            <div className="profile-insignias" role="group" aria-label="Patente, graduação e builds">
              <RankInsignia rank={profile.rank} variant="badge" />
              <GraduationInsignias profile={profile} variant="badge" />
              {getBuildIcon(profile.primary_build) && <BuildInsignia build={profile.primary_build} variant="badge" caption="Principal" />}
              {getBuildIcon(profile.secondary_build) && <BuildInsignia build={profile.secondary_build} variant="badge" caption="Secundária" />}
            </div>
            {profile.graduation_review_needed && <p className="form-help">Sua graduação está em revisão: um administrador vai definir o nível em cada trilha.</p>}
            <dl>
              <div><dt>Vínculo</dt><dd>{memberKindLabels[profile.member_kind]}</dd></div>
              <div><dt>Patente</dt><dd>{rankLabels[profile.rank]}</dd></div>
              <div><dt>Camisa</dt><dd>{profile.shirt_number ?? "—"}</dd></div>
              <div><dt>Build principal</dt><dd><BuildInsignia build={profile.primary_build} /></dd></div>
              <div><dt>Build secundária</dt><dd><BuildInsignia build={profile.secondary_build} /></dd></div>
              <div><dt>Signo</dt><dd>{profile.zodiac_sign || "—"}</dd></div>
            </dl>
            {graduationTracks.map((track) => {
              const level = profile[track.field] ?? "sem_graduacao";
              const house = houseFor(profile, track.value);
              return (
                <TrackSection
                  key={track.value}
                  title={track.label}
                  icon={level !== "sem_graduacao" ? <GraduationInsignia level={level} track={track.value} variant="icon" /> : undefined}
                  defaultOpen={level !== "sem_graduacao" || Boolean(house)}
                >
                  <dl>
                    <div><dt>Graduação</dt><dd>{graduationLabels[level]}</dd></div>
                    <div><dt>Casa</dt><dd>{house || "Não informada"}</dd></div>
                  </dl>
                </TrackSection>
              );
            })}
            <EditMemberProfile profile={profile} canEditAccessDirectly={Boolean(adminRoles?.length)} />
          </article>
          <div className="member-options">
            <Link className="card" href="/membro/atividades"><span className="card-icon"><CalendarDays /></span><h3>Atividades e presença</h3><p>Confirme sua participação e veja quem vai.</p></Link>
            <Link className="card" href="/membro/documentos"><span className="card-icon"><FileText /></span><h3>Documentos</h3><p>Materiais liberados para o seu perfil.</p></Link>
            <Link className="card" href="/membro/simulados"><span className="card-icon"><ClipboardCheck /></span><h3>Avaliações</h3><p>Suas indicações, provas e resultados.</p></Link>
            {isAdmin && <Link className="card admin-access" href="/admin"><span className="card-icon"><Settings /></span><h3>Painel administrativo</h3><p>Mídias, calendário, membros e mais.</p></Link>}
          </div>
        </div>
      </section>
    </>
  );
}
