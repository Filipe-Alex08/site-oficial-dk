import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";
import { RECOVERY_COOKIE, hasFreshRecovery } from "@/lib/password-recovery";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Nova senha" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data } = supabase ? await supabase.auth.getClaims() : { data: null };
  // Só chega aqui quem acabou de abrir o link do e-mail; os demais pedem outro.
  const marked = (await cookies()).get(RECOVERY_COOKIE)?.value === "1";
  if (!marked || !hasFreshRecovery(data?.claims?.amr)) redirect("/area-do-membro/esqueci-senha?erro=vencido");

  return (
    <AuthShell title="Nova senha">
      <ResetPasswordForm />
    </AuthShell>
  );
}
