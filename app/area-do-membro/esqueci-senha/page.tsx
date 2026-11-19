import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata: Metadata = { title: "Esqueci minha senha" };

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string | string[] }>;
}) {
  const { erro } = await searchParams;
  // Só texto fixo: nada que venha da URL é exibido.
  const notice = (Array.isArray(erro) ? erro[0] : erro) === "vencido"
    ? "O link de redefinição venceu. Peça um novo."
    : null;

  return (
    <AuthShell title="Esqueci minha senha" notice={notice}>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
