"use client";

import { CheckCircle2, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
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
      <div className="form-card registration-success">
        <CheckCircle2 size={46} />
        <h2>Cadastro enviado</h2>
        <p>Assim que um administrador aprovar, você poderá entrar e completar seu perfil.</p>
      </div>
    );
  }

  return (
    <form className="form-card registration-form" onSubmit={submit}>
      <div className="form-grid">
        <div className="field field-full">
          <label htmlFor="invite_code">Código do convite</label>
          <input id="invite_code" value={form.invite_code} onChange={(e) => update("invite_code", e.target.value.toUpperCase())} required />
        </div>
        <div className="field">
          <label htmlFor="full_name">Nome completo</label>
          <input id="full_name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="nickname">Apelido</label>
          <input id="nickname" value={form.nickname} onChange={(e) => update("nickname", e.target.value)} required />
        </div>
        <div className="field field-full">
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Senha</label>
          <input id="password" type="password" autoComplete="new-password" minLength={8} value={form.password} onChange={(e) => { setError(""); update("password", e.target.value); }} required />
        </div>
        <div className="field">
          <label htmlFor="confirm_password">Confirmar senha</label>
          <input
            id="confirm_password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            value={confirmPassword}
            onChange={(e) => { setError(""); setConfirmPassword(e.target.value); }}
            aria-invalid={mismatch || undefined}
            aria-describedby={mismatch ? "confirm_password_error" : undefined}
            required
          />
          {mismatch && <small id="confirm_password_error" className="form-help" role="alert">As senhas não são iguais.</small>}
        </div>
      </div>
      <button className="button button-primary" type="submit" disabled={loading}>
        <UserPlus size={18} /> {loading ? "Enviando…" : "Enviar cadastro"}
      </button>
      {error && <p className="form-message error">{error}</p>}
    </form>
  );
}
