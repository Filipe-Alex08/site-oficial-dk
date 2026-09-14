"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);
    const supabase = createClient();

    if (!supabase) {
      setMessage({ type: "error", text: "Configure o Supabase para habilitar o login." });
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });

    if (error || !data.user) {
      setMessage({ type: "error", text: "E-mail ou senha inválidos." });
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("status")
      .eq("id", data.user.id)
      .single();

    if (!profile || profile.status !== "aprovado") {
      await supabase.auth.signOut();
      const text = profile?.status === "pendente"
        ? "Seu cadastro ainda está aguardando aprovação."
        : "Seu acesso ainda não está liberado.";
      setMessage({ type: "error", text });
      setLoading(false);
      return;
    }

    router.push("/membro");
    router.refresh();
  }

  return (
    <form className="form-card login-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="field">
        <label htmlFor="password">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required minLength={8} />
      </div>
      <button className="button button-primary" type="submit" disabled={loading}>
        <LogIn size={18} /> {loading ? "Entrando..." : "Entrar"}
      </button>
      {message && <p className={"form-message " + message.type}>{message.text}</p>}
      <p className="form-help">
        Recebeu um convite? <Link href="/area-do-membro/cadastro">Faça seu cadastro</Link>.
      </p>
    </form>
  );
}
