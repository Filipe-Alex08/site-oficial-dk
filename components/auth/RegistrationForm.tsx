"use client";

import { CheckCircle2, Mail, Shield, Ticket, UserPlus, UserRound } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";
import AuthInput, { PasswordInput } from "@/components/auth/AuthInput";
import { jsonApiFetch } from "@/lib/api-client";

const empty = {
  invite_code: "", email: "", password: "", full_name: "", nickname: "",
};

export default function RegistrationForm({ initialCode = "" }: { initialCode?: string }) {
  const [form, setForm] = useState({ ...empty, invite_code: initialCode.toUpperCase() });
  // A confirmação só existe na tela: não faz parte do que é enviado ao servidor.
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const mismatch = confirmPassword !== "" && confirmPassword !== form.password;
  const matched = confirmPassword.length >= 8 && confirmPassword === form.password;

  function update(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (confirmPassword !== form.password) {
      setError("A confirmação não é igual à senha.");
      return;
    }
    setLoading(true);
    setError("");

    // Sem o try/catch, uma queda de rede ou uma página de erro HTML (502 do
    // proxy) deixava o botão preso em "Enviando…" para sempre.
    try {
      const response = await jsonApiFetch("/api/register", form);
      const result = await response.json().catch(() => null);

      if (!response.ok) {
        setError(result?.error || "Não foi possível concluir o cadastro. Tente novamente em instantes.");
        return;
      }

      setDone(true);
    } catch {
      setError("Sem conexão com o servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="form-card registration-success" role="status">
        <span className="crest" aria-hidden="true"><CheckCircle2 /></span>
        <h2>Cadastro enviado</h2>
        <p>Assim que um administrador aprovar, você poderá entrar e completar seu perfil.</p>
        <Link className="button button-ghost" href="/">Voltar ao site</Link>
      </div>
    );
  }

  return (
    <form className="form-card registration-form numbered" onSubmit={submit}>
      <fieldset className="auth-fieldset">
        <legend><span className="numeral" aria-hidden="true" />Convite</legend>
        <div className="field auth-invite">
          <label htmlFor="invite_code">Código do convite</label>
          <AuthInput icon={Ticket} id="invite_code" value={form.invite_code} onChange={(e) => update("invite_code", e.target.value.toUpperCase())} autoComplete="off" spellCheck={false} required />
        </div>
      </fieldset>
      <fieldset className="auth-fieldset">
        <legend><span className="numeral" aria-hidden="true" />Identificação</legend>
        <div className="form-grid">
          <div className="field">
            <label htmlFor="full_name">Nome completo</label>
            <AuthInput icon={UserRound} id="full_name" autoComplete="name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="nickname">Apelido</label>
            <AuthInput icon={Shield} id="nickname" autoComplete="nickname" value={form.nickname} onChange={(e) => update("nickname", e.target.value)} required />
          </div>
        </div>
      </fieldset>
      <fieldset className="auth-fieldset">
        <legend><span className="numeral" aria-hidden="true" />Acesso</legend>
        <div className="form-grid">
          <div className="field field-full">
            <label htmlFor="email">E-mail</label>
            <AuthInput icon={Mail} id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
          </div>
          <div className="field">
            <label htmlFor="password">Senha</label>
            <PasswordInput id="password" autoComplete="new-password" minLength={8} value={form.password} onChange={(e) => { setError(""); update("password", e.target.value); }} required />
          </div>
          <div className="field">
            <label htmlFor="confirm_password">Confirmar senha</label>
            <PasswordInput
              id="confirm_password"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={(e) => { setError(""); setConfirmPassword(e.target.value); }}
              valid={matched}
              aria-invalid={mismatch || undefined}
              aria-describedby={mismatch ? "confirm_password_error" : undefined}
              required
            />
            {mismatch && <small id="confirm_password_error" className="auth-field-error" role="alert">As senhas não são iguais.</small>}
          </div>
        </div>
      </fieldset>
      <button className="button button-primary" type="submit" disabled={loading}>
        <UserPlus size={18} /> {loading ? "Enviando…" : "Enviar cadastro"}
      </button>
      {error && <p className="form-message error" role="alert">{error}</p>}
    </form>
  );
}
