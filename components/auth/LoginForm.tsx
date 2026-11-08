"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { jsonApiFetch } from "@/lib/api-client";
import { isSupabaseConfigured } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    // Ao voltar do Google com o botão "Voltar", o navegador restaura a página como ela estava.
    const restore = (event: PageTransitionEvent) => {
      if (event.persisted) setGoogleLoading(false);
    };
    window.addEventListener("pageshow", restore);
    return () => window.removeEventListener("pageshow", restore);
  }, []);

  async function handleGoogle() {
    setGoogleLoading(true);
    setMessage(null);

    if (!isSupabaseConfigured()) {
      setMessage({ type: "error", text: "Configure o Supabase para habilitar o login." });
      setGoogleLoading(false);
      return;
    }

    try {
      // A URL de autorização vem pronta do servidor, que também guarda o
      // comprovante PKCE num cookie. Esta página nunca toca no token.
      const response = await jsonApiFetch("/api/auth/google", {});
      const data = await response.json().catch(() => null);
      // Só http(s): a URL vem do Supabase, mas o navegador obedece qualquer
      // esquema, e um "javascript:" aqui seria execução de script.
      if (!response.ok || typeof data?.url !== "string" || !/^https?:\/\//.test(data.url)) {
        throw new Error(data?.error ?? "resposta inesperada");
      }
      window.location.assign(data.url);
    } catch {
      setMessage({ type: "error", text: "Não foi possível iniciar o login com o Google." });
      setGoogleLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);
    const form = new FormData(event.currentTarget);

    if (!isSupabaseConfigured()) {
      setMessage({ type: "error", text: "Configure o Supabase para habilitar o login." });
      setLoading(false);
      return;
    }

    try {
      const response = await jsonApiFetch("/api/auth/login", {
        email: String(form.get("email")),
        password: String(form.get("password")),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        setMessage({ type: "error", text: data?.error ?? "E-mail ou senha inválidos." });
        setLoading(false);
        return;
      }
    } catch {
      setMessage({ type: "error", text: "Não foi possível entrar agora. Tente novamente." });
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
      <button className="button button-primary" type="submit" disabled={loading || googleLoading}>
        <LogIn size={18} /> {loading ? "Entrando..." : "Entrar"}
      </button>
      <div className="login-divider" aria-hidden="true">ou</div>
      <button className="button button-ghost" type="button" onClick={handleGoogle} disabled={loading || googleLoading}>
        <GoogleIcon /> {googleLoading ? "Redirecionando..." : "Entrar com Google"}
      </button>
      {message && <p className={"form-message " + message.type}>{message.text}</p>}
      <p className="form-help">
        Recebeu um convite? <Link href="/area-do-membro/cadastro">Faça seu cadastro</Link>.
      </p>
    </form>
  );
}
