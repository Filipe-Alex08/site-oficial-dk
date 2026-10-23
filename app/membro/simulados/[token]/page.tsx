import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { redirect } from "next/navigation";
import AssessmentRunner from "@/components/member/AssessmentRunner";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Realizar avaliação" };

export default async function AssessmentAttemptPage({ params }: { params: Promise<{ token: string }> }) {
  const supabase = await createClient();
  if (!supabase) return <section className="section"><div className="container info-band"><strong>Banco ainda não conectado</strong><p>Configure o Supabase para ativar as avaliações.</p></div></section>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/area-do-membro/login");
  const { token } = await params;

  return (
    <>
      <section className="member-heading compact-heading">
        <div className="container member-heading-inner">
          <div><p className="eyebrow">Avaliação individual</p><h1>Ambiente de avaliação</h1><p>Suas respostas são salvas durante a tentativa.</p></div>
          <Link className="button button-ghost" href="/membro/simulados"><ArrowLeft size={18} /> Minhas avaliações</Link>
        </div>
      </section>
      <section className="section assessment-runner-section"><div className="container"><AssessmentRunner token={token} /></div></section>
    </>
  );
}
