"use client";

import { CheckCircle2, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";

const empty = {
  invite_code: "", email: "", password: "", full_name: "", nickname: "",
};

export default function RegistrationForm({ initialCode = "" }: { initialCode?: string }) {
  const [form, setForm] = useState({ ...empty, invite_code: initialCode.toUpperCase() });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  function update(name: string, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Não foi possível concluir o cadastro.");
      setLoading(false);
      return;
    }

    setDone(true);
    setLoading(false);
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
          <label htmlFor="email">E-mail</label>
          <input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="password">Senha</label>
          <input id="password" type="password" minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="full_name">Nome completo</label>
          <input id="full_name" value={form.full_name} onChange={(e) => update("full_name", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="nickname">Apelido</label>
          <input id="nickname" value={form.nickname} onChange={(e) => update("nickname", e.target.value)} required />
        </div>
      </div>
      <button className="button button-primary" type="submit" disabled={loading}>
        <UserPlus size={18} /> {loading ? "Enviando…" : "Enviar cadastro"}
      </button>
      {error && <p className="form-message error">{error}</p>}
    </form>
  );
}
