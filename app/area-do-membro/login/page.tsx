import type { Metadata } from "next";
import { redirect } from "next/navigation";
import LoginForm from "@/components/auth/LoginForm";
import PageHero from "@/components/PageHero";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Área do Membro" };

export default async function LoginPage() {
  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("status").eq("id", user.id).maybeSingle();
      if (profile?.status === "aprovado") redirect("/membro");
    }
  }

  return (
    <>
      <PageHero eyebrow="Acesso restrito" title="Área do Membro" description="Entre com sua conta aprovada para acessar as informações internas do DK." />
      <section className="section"><div className="container auth-wrap"><LoginForm /></div></section>
    </>
  );
}
