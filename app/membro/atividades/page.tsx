import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import AttendancePanel from "@/components/member/AttendancePanel";
import { createClient } from "@/lib/supabase/server";
import type { Activity, MemberProfile } from "@/lib/types";

export const metadata: Metadata = { title: "Atividades e presença" };

export default async function MemberActivitiesPage() {
  const supabase = await createClient();
  if (!supabase) {
    return <section className="section"><div className="container info-band"><strong>Banco ainda não conectado</strong><p>Configure o Supabase para ativar as confirmações de presença.</p></div></section>;
  }

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
      <section className="member-heading">
        <div className="container member-heading-inner">
          <div><p className="eyebrow">Área interna</p><h1>Atividades e presença</h1><p>Confirme sua participação e acompanhe a lista atualizada do DK.</p></div>
          <Link className="button button-ghost" href="/membro"><ArrowLeft size={18} /> Voltar</Link>
        </div>
      </section>
      <section className="section"><div className="container"><AttendancePanel activities={(activityData ?? []) as Activity[]} userId={user.id} /></div></section>
    </>
  );
}
