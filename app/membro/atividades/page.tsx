import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppPageHeader from "@/components/member/AppPageHeader";
import AttendancePanel from "@/components/member/AttendancePanel";
import Unavailable from "@/components/member/Unavailable";
import LiveRefresh from "@/components/LiveRefresh";
import { getAuth, getMember } from "@/lib/viewer";
import type { Activity } from "@/lib/types";

export const metadata: Metadata = { title: "Atividades e presença" };

export default async function MemberActivitiesPage({ searchParams }: { searchParams: Promise<{ filtro?: string }> }) {
  const { supabase, user } = await getAuth();
  if (!supabase) return <Unavailable />;
  if (!user) redirect("/area-do-membro/login");

  // Perfil e atividades não dependem um do outro.
  const [{ profile }, { data: activityData }, { filtro }] = await Promise.all([
    getMember(),
    supabase.from("activities").select("*").gte("starts_at", new Date().toISOString()).order("starts_at"),
    searchParams,
  ]);
  if (!profile || profile.status !== "aprovado") redirect("/area-do-membro/login");

  return (
    <>
      <LiveRefresh tables={["activities"]} />
      <AppPageHeader title="Atividades e presença" crumbs={[{ label: "Início", href: "/membro" }]} />
      <section className="section"><div className="container"><AttendancePanel activities={(activityData ?? []) as Activity[]} userId={user.id} initialFilter={filtro === "pendentes" ? "pendentes" : "todas"} /></div></section>
    </>
  );
}
