import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = { title: "Área do Membro" };

export default function LoginPage() {
  return (
    <>
      <PageHero eyebrow="Acesso restrito" title="Área do Membro" description="Entre com sua conta aprovada para acessar as informações internas do DK." />
      <section className="section"><div className="container auth-wrap"><LoginForm /></div></section>
    </>
  );
}
