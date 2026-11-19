"use client";

import { useState } from "react";
import { CheckCircle2, Save } from "lucide-react";
import { jsonApiFetch } from "@/lib/api-client";
import { SECURITY_PHRASE_MAX } from "@/lib/security-phrase";

/**
 * Frase de segurança dentro da edição de perfil. Tem o próprio botão: não faz
 * parte do Salvar do perfil, porque vale na hora e é lida pelos e-mails do Auth.
 */
export default function SecurityPhraseFields({ initial }: { initial: string }) {
  const [phrase, setPhrase] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function save(next: string) {
    if (saving) return;
    setSaving(true);
    setError("");
    setDone(false);
    try {
      const response = await jsonApiFetch("/api/account/security-phrase", { phrase: next });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "Não foi possível salvar a frase agora. Tente novamente.");
        return;
      }
      const stored = typeof data?.phrase === "string" ? data.phrase : "";
      setPhrase(stored);
      setSaved(stored);
      setDone(true);
    } catch {
      setError("Sem conexão com o servidor. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  // Enter dentro do campo salva a frase; sem isso enviaria o formulário do perfil inteiro.
  const onEnter = (event: React.KeyboardEvent) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void save(phrase);
  };

  return (
    <div className="profile-dialog-password" onKeyDown={onEnter}>
      <div className="field">
        <label htmlFor="member-security-phrase">Frase de segurança</label>
        <input
          id="member-security-phrase"
          value={phrase}
          maxLength={SECURITY_PHRASE_MAX}
          placeholder="Ex.: Lobo cinza 42"
          autoComplete="off"
          onChange={(event) => { setError(""); setDone(false); setPhrase(event.target.value); }}
        />
      </div>
      {error && <p className="profile-dialog-error" role="alert">{error}</p>}
      {done && (
        <p className="profile-dialog-sent" role="status">
          <CheckCircle2 size={16} aria-hidden="true" /> {saved ? "Frase salva. Ela aparece nos e-mails que enviamos." : "Frase removida."}
        </p>
      )}
      <div className="profile-dialog-forgot">
        <button className="button button-primary button-small" type="button" onClick={() => save(phrase)} disabled={saving || phrase === saved}>
          <Save aria-hidden="true" /> {saving ? "Salvando…" : "Salvar frase"}
        </button>
        {saved && (
          <button className="button button-ghost button-small" type="button" onClick={() => save("")} disabled={saving}>Remover</button>
        )}
      </div>
    </div>
  );
}
