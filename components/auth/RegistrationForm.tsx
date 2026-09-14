"use client";

import { CheckCircle2, UserPlus } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { getZodiacSign } from "@/lib/zodiac";

const empty = {
  invite_code: "", email: "", password: "", full_name: "", nickname: "",
  rank: "", graduation_order: "", house: "", shirt_number: "",
  primary_build: "", secondary_build: "", birth_date: "",
};

export default function RegistrationForm({ initialCode = "" }: { initialCode?: string }) {
  const [form, setForm] = useState({ ...empty, invite_code: initialCode.toUpperCase() });
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const zodiac = useMemo(() => getZodiacSign(form.birth_date), [form.birth_date]);

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
      body: JSON.stringify({ ...form, zodiac_sign: zodiac }),
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
        <p>As informações foram registradas. Agora é necessário aguardar a aprovação do ADM de Gerenciamento de Membros.</p>
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
        <div className="field">
          <label htmlFor="rank">Patente</label>
          <input id="rank" value={form.rank} onChange={(e) => update("rank", e.target.value)} placeholder="Será acompanhada por imagem futuramente" />
        </div>
        <div className="field">
          <label htmlFor="graduation_order">Ordem de graduação</label>
          <input id="graduation_order" value={form.graduation_order} onChange={(e) => update("graduation_order", e.target.value)} placeholder="Ex.: Cavaleiro de Bronze" />
        </div>
        <div className="field">
          <label htmlFor="house">Casa</label>
          <input id="house" value={form.house} onChange={(e) => update("house", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="shirt_number">Número da camisa</label>
          <input id="shirt_number" type="number" min="0" value={form.shirt_number} onChange={(e) => update("shirt_number", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="primary_build">Build principal</label>
          <input id="primary_build" value={form.primary_build} onChange={(e) => update("primary_build", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="secondary_build">Build secundária</label>
          <input id="secondary_build" value={form.secondary_build} onChange={(e) => update("secondary_build", e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="birth_date">Data de nascimento</label>
          <input id="birth_date" type="date" value={form.birth_date} onChange={(e) => update("birth_date", e.target.value)} required />
        </div>
        <div className="field">
          <label htmlFor="zodiac_sign">Signo do Zodíaco</label>
          <input id="zodiac_sign" value={zodiac} readOnly aria-readonly="true" placeholder="Preenchido automaticamente" />
        </div>
      </div>
      <button className="button button-primary" type="submit" disabled={loading}>
        <UserPlus size={18} /> {loading ? "Enviando..." : "Enviar cadastro"}
      </button>
      {error && <p className="form-message error">{error}</p>}
    </form>
  );
}
