import type { Metadata } from "next";
import { redirect } from "next/navigation";
import MemberHomeView, { type UpcomingActivity } from "@/components/member/MemberHomeView";
import Unavailable from "@/components/member/Unavailable";
import { getMemberBadges } from "@/lib/member-badges";
import LiveRefresh from "@/components/LiveRefresh";
import { usesPasswordLogin } from "@/lib/password-recovery";
import { readSecurityPhrase } from "@/lib/security-phrase";
import { getViewer } from "@/lib/viewer";

export const metadata: Metadata = { title: "Painel do Membro" };

export default async function MemberPage() {
  // Perfil, papéis e permissões saem juntos (e compartilhados com o resto da requisição).
  const { supabase, user, profile, roles: roleList } = await getViewer();

  if (!supabase) return <Unavailable />;
  if (!user) redirect("/area-do-membro/login");
  if (!profile || profile.status !== "aprovado") redirect("/area-do-membro/login");
  const profileAvatarUrl = profile.avatar_path
    ? supabase.storage.from("profile-avatars").getPublicUrl(profile.avatar_path).data.publicUrl
    : null;

  // Os totais vêm de getMemberBadges (o mesmo cálculo da barra de navegação).
  const { isAdmin, ...counts } = await getMemberBadges();

  // Próximas atividades e as respostas do próprio membro.
  const nowIso = new Date().toISOString();
  const [{ data: upcomingData }, { data: myResponses }] = await Promise.all([
    supabase.from("activities").select("id,title,starts_at,location,type,status,attendance_open").gte("starts_at", nowIso).neq("status", "cancelado").order("starts_at").limit(3),
    supabase.from("activity_attendance").select("activity_id,response").eq("user_id", user.id),
  ]);
  const responses = Object.fromEntries((myResponses ?? []).map((row) => [row.activity_id as string, row.response as string]));

  return (
    <>
      <LiveRefresh tables={["activities", "activity_attendance", "assessment_assignments", "profiles", "user_admin_roles", "member_notes"]} />
      <MemberHomeView
        profile={profile}
        profileAvatarUrl={profileAvatarUrl}
        userId={user.id}
        hasPassword={usesPasswordLogin(user)}
        securityPhrase={readSecurityPhrase(user.user_metadata)}
        canEditAccessDirectly={roleList.length > 0}
        isAdmin={isAdmin}
        counts={counts}
        upcoming={(upcomingData ?? []) as UpcomingActivity[]}
        responses={responses}
      />
    </>
  );
}
