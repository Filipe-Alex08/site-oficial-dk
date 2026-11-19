"use client";

import { useState } from "react";
import { CheckCircle2, Mail } from "lucide-react";
import { jsonApiFetch } from "@/lib/api-client";

/**
 * Troca de e-mail dentro da edição de perfil. Não faz parte do botão Salvar: o
 * e-mail do login só muda depois que o membro abre o link enviado ao novo
 * endereço, então o pedido tem o próprio botão.
 */
export default function EmailChangeFields({ currentEmail }: { currentEmail: string }) {
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function send() {
    if (sending) return;
    if (!newEmail.trim() || !password) return setError("Informe o novo e-mail e a senha atual.");
    setSending(true);
    setError("");
    try {
      const response = await jsonApiFetch("/api/account/email", { current_password: password, new_email: newEmail.trim() });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "Não foi possível enviar a confirmação agora. Tente novamente.");
        return;
      }
      setSentTo(newEmail.trim());
      setPassword("");
    } catch {
      setError("Sem conexão com o servidor. Tente novamente.");
    } finally {
      setSending(false);
    }
  }

  if (sentTo) {
    return (
      <div className="profile-dialog-password">
        <p className="profile-dialog-sent" role="status">
          <CheckCircle2 size={16} aria-hidden="true" /> Confirmação enviada para {sentTo}. O e-mail só muda depois que você abrir o link.
        </p>
      </div>
    );
  }

  // Enter dentro destes campos pediria a troca; sem isso enviaria o formulário do perfil inteiro.
  const onEnter = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void send();
  };

  return (
    <div className="profile-dialog-password" onKeyDown={onEnter}>
      <div className="form-grid profile-dialog-grid">
        <div className="field field-full">
          <label htmlFor="member-current-email">E-mail atual</label>
          <input id="member-current-email" className="profile-dialog-readonly" value={currentEmail} readOnly aria-readonly="true" />
        </div>
        <div className="field">
          <label htmlFor="member-new-email">Novo e-mail</label>
          <input id="member-new-email" type="email" autoComplete="email" maxLength={254} value={newEmail} onChange={(event) => { setError(""); setNewEmail(event.target.value); }} />
        </div>
        <div className="field">
          <label htmlFor="member-email-password">Senha atual</label>
          <input id="member-email-password" type="password" autoComplete="current-password" value={password} onChange={(event) => { setError(""); setPassword(event.target.value); }} />
        </div>
      </div>
      {error && <p className="profile-dialog-error" role="alert">{error}</p>}
      <div className="profile-dialog-forgot">
        <button className="button button-primary button-small" type="button" onClick={send} disabled={sending}>
          <Mail aria-hidden="true" /> {sending ? "Enviando…" : "Enviar confirmação"}
        </button>
      </div>
    </div>
  );
}
