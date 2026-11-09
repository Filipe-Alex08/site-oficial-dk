import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import RegistrationForm from "@/components/auth/RegistrationForm";

export const metadata: Metadata = { title: "Cadastro por convite" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ convite?: string }>;
}) {
  const { convite = "" } = await searchParams;
  return (
    <AuthShell title="Criar conta" description="Use o código do convite que você recebeu." wide>
      <RegistrationForm initialCode={convite} />
    </AuthShell>
  );
}
