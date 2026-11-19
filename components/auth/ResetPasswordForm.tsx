"use client";

import { Eye, EyeOff, KeyRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { jsonApiFetch } from "@/lib/api-client";
import { PASSWORD_MAX, PASSWORD_MIN, validateNewPassword } from "@/lib/account-password";

export default function ResetPasswordForm() {
  const router = useRouter();
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [reveal, setReveal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const invalid = validateNewPassword(next) ?? (next !== confirm ? "A confirmação não é igual à nova senha." : null);
    if (invalid) return setError(invalid);

    setLoading(true);
    setError("");
    try {
      const response = await jsonApiFetch("/api/account/password/reset", { new_password: next });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        setError(data?.error ?? "Não foi possível redefinir a senha agora. Tente novamente.");
        setLoading(false);
        return;
      }
    } catch {
      setError("Sem conexão com o servidor. Tente novamente.");
      setLoading(false);
      return;
    }
    router.push("/membro");
    router.refresh();
  }

  const type = reveal ? "text" : "password";
  const edit = (set: (value: string) => void) => (event: { target: { value: string } }) => {
    setError("");
    set(event.target.value);
  };

  return (
    <form className="form-card login-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="reset-new-password">Nova senha</label>
        <input id="reset-new-password" type={type} autoComplete="new-password" required autoFocus minLength={PASSWORD_MIN} maxLength={PASSWORD_MAX} value={next} onChange={edit(setNext)} />
      </div>
      <div className="field">
        <label htmlFor="reset-confirm-password">Confirmar nova senha</label>
        <input id="reset-confirm-password" type={type} autoComplete="new-password" required minLength={PASSWORD_MIN} maxLength={PASSWORD_MAX} value={confirm} onChange={edit(setConfirm)} />
      </div>
      {error && <p className="form-message error" role="alert">{error}</p>}
      <div className="reset-actions">
        <button className="button button-primary" type="submit" disabled={loading}>
          <KeyRound size={18} /> {loading ? "Salvando…" : "Salvar nova senha"}
        </button>
        <button className="icon-button" type="button" aria-pressed={reveal} onClick={() => setReveal((current) => !current)} title={reveal ? "Ocultar senhas" : "Mostrar senhas"} aria-label={reveal ? "Ocultar senhas" : "Mostrar senhas"}>
          {reveal ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </button>
      </div>
    </form>
  );
}
