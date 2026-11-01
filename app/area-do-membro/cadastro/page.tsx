import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import RegistrationForm from "@/components/auth/RegistrationForm";

export const metadata: Metadata = { title: "Cadastro por convite" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ convite?: string }>;
}) {
  const { convite = "" } = await searchParams;
  return (
    <>
      <PageHero eyebrow="Cadastro restrito" title="Cadastro por convite" description="Crie sua conta com um convite. Após a aprovação de um administrador e o login, você poderá completar seu perfil." />
      <section className="section"><div className="container auth-wrap"><RegistrationForm initialCode={convite} /></div></section>
    </>
  );
}
