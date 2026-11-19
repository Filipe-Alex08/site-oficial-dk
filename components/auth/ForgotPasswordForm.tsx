"use client";

import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { jsonApiFetch } from "@/lib/api-client";
import { LOGIN_PATH } from "@/lib/auth-callback";

export default function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    setLoading(true);
    setError("");
    try {
      const response = await jsonApiFetch("/api/auth/password-reset", { email });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "Não foi possível enviar o e-mail agora. Tente novamente.");
        return;
      }
      setSentTo(email);
    } catch {
      setError("Sem conexão com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (sentTo) {
    return (
      <div className="form-card registration-success" role="status">
        <CheckCircle2 size={46} />
        <h2>Confira seu e-mail</h2>
        <p>Se {sentTo} tiver cadastro, o link para criar uma nova senha chega em instantes. Abra-o neste mesmo navegador.</p>
        <button className="button button-ghost" type="button" onClick={() => setSentTo(null)}>Usar outro e-mail</button>
        <p className="form-help"><Link href={LOGIN_PATH}>Voltar para o login</Link></p>
      </div>
    );
  }

  return (
    <form className="form-card login-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="forgot-email">E-mail do cadastro</label>
        <input id="forgot-email" name="email" type="email" autoComplete="email" required autoFocus maxLength={254} onChange={() => setError("")} />
      </div>
      {error && <p className="form-message error" role="alert">{error}</p>}
      <button className="button button-primary" type="submit" disabled={loading}>
        <Mail size={18} /> {loading ? "Enviando…" : "Enviar link"}
      </button>
      <p className="form-help"><Link href={LOGIN_PATH}>Voltar para o login</Link></p>
    </form>
  );
}
