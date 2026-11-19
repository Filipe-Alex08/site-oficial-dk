import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AppPageHeader from "@/components/member/AppPageHeader";
import AssessmentRunner from "@/components/member/AssessmentRunner";
import Unavailable from "@/components/member/Unavailable";
import { getMember } from "@/lib/viewer";

export const metadata: Metadata = { title: "Realizar avaliação" };

export default async function AssessmentAttemptPage({ params }: { params: Promise<{ token: string }> }) {
  const [{ supabase, user, profile }, { token }] = await Promise.all([getMember(), params]);
  if (!supabase) return <Unavailable />;
  if (!user) redirect("/area-do-membro/login");
  if (!profile || profile.status !== "aprovado") redirect("/area-do-membro/login");

  return (
    <>
      <AppPageHeader title="Avaliação" crumbs={[{ label: "Início", href: "/membro" }, { label: "Avaliações", href: "/membro/simulados" }]} />
      <section className="section assessment-runner-section"><div className="container"><AssessmentRunner token={token} /></div></section>
    </>
  );
}
