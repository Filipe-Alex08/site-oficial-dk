import type { Metadata } from "next";
import { redirect } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { loginErrorMessage } from "@/lib/auth-callback";
import { isGoogleLoginAvailable } from "@/lib/google-login";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string | string[] }>;
}) {
  const { erro } = await searchParams;
  const notice = loginErrorMessage(erro);
  const [googleAvailable, supabase] = await Promise.all([isGoogleLoginAvailable(), createClient()]);
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("status").eq("id", user.id).maybeSingle();
      if (profile?.status === "aprovado") redirect("/membro");
    }
  }

  return (
    <AuthShell title="Entrar" description="Acesse a área do membro." notice={notice}>
      <LoginForm googleAvailable={googleAvailable} />
    </AuthShell>
  );
}
