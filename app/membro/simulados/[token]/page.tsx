import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppPageHeader from "@/components/member/AppPageHeader";
import AssessmentRunner from "@/components/member/AssessmentRunner";
import Unavailable from "@/components/member/Unavailable";
import { createClient } from "@/lib/supabase/server";
import type { MemberProfile } from "@/lib/types";

export const metadata: Metadata = { title: "Realizar avaliação" };

export default async function AssessmentAttemptPage({ params }: { params: Promise<{ token: string }> }) {
  const supabase = await createClient();
  if (!supabase) return <Unavailable />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/area-do-membro/login");
  const { data: profileData } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const profile = profileData as MemberProfile | null;
  if (!profile || profile.status !== "aprovado") redirect("/area-do-membro/login");
  const { token } = await params;

  return (
    <>
      <AppPageHeader title="Avaliação" crumbs={[{ label: "Painel", href: "/membro" }, { label: "Avaliações", href: "/membro/simulados" }]} />
      <section className="section assessment-runner-section"><div className="container"><AssessmentRunner token={token} /></div></section>
    </>
  );
}
