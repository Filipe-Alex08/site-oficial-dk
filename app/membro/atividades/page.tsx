import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppPageHeader from "@/components/member/AppPageHeader";
import AttendancePanel from "@/components/member/AttendancePanel";
import Unavailable from "@/components/member/Unavailable";
import { createClient } from "@/lib/supabase/server";
import type { Activity, MemberProfile } from "@/lib/types";

export const metadata: Metadata = { title: "Atividades e presença" };

export default async function MemberActivitiesPage() {
  const supabase = await createClient();
  if (!supabase) return <Unavailable />;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/area-do-membro/login");

  const [{ data: profileData }, { data: activityData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("activities").select("*").gte("starts_at", new Date().toISOString()).order("starts_at"),
  ]);
  const profile = profileData as MemberProfile | null;
  if (!profile || profile.status !== "aprovado") redirect("/area-do-membro/login");

  return (
    <>
      <AppPageHeader title="Atividades e presença" crumbs={[{ label: "Painel", href: "/membro" }]} />
      <section className="section"><div className="container"><AttendancePanel activities={(activityData ?? []) as Activity[]} userId={user.id} /></div></section>
    </>
  );
}
