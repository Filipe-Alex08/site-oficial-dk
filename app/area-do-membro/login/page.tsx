import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import SavedAccounts from "@/components/auth/SavedAccounts";
import { withoutActive } from "@/lib/account-vault";
import { readVault, toClientAccounts } from "@/lib/account-switch";
import { loginErrorMessage } from "@/lib/auth-callback";
import { isGoogleLoginAvailable } from "@/lib/google-login";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string | string[]; adicionar?: string | string[] }>;
}) {
  const { erro, adicionar } = await searchParams;
  const notice = loginErrorMessage(erro);
  // ?adicionar=1: quem já está logado quer entrar com OUTRA conta, então a
  // página não o devolve para a área do membro.
  const adding = (Array.isArray(adicionar) ? adicionar[0] : adicionar) === "1";
  const [googleAvailable, supabase, vault] = await Promise.all([isGoogleLoginAvailable(), createClient(), readVault()]);

  let activeId: string | null = null;
  let activeName = "";
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("status, nickname, full_name").eq("id", user.id).maybeSingle();
      if (profile?.status === "aprovado") {
        if (!adding) redirect("/membro");
        activeId = user.id;
        activeName = profile.nickname || profile.full_name || user.email || "";
      }
    }
  }

  const saved = toClientAccounts(withoutActive(vault, activeId));

  return (
    <AuthShell
      title={adding && activeId ? "Adicionar conta" : "Entrar"}
      description={adding && activeId ? `Você continua conectado como ${activeName}. Entre com outra conta para alternar entre elas.` : undefined}
      notice={notice}
    >
      {saved.length > 0 && <SavedAccounts accounts={saved} />}
      <LoginForm googleAvailable={googleAvailable} addingAccount={adding && Boolean(activeId)} />
      {adding && activeId && <p className="form-help"><Link href="/membro">Voltar para a área do membro</Link></p>}
    </AuthShell>
  );
}
