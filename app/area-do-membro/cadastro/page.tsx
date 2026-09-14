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
      <PageHero eyebrow="Cadastro restrito" title="Cadastro por convite" description="Preencha seu perfil. O acesso será liberado somente após a aprovação de um administrador." />
      <section className="section"><div className="container auth-wrap"><RegistrationForm initialCode={convite} /></div></section>
    </>
  );
}
