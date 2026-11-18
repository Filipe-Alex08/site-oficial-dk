"use client";

import Image from "next/image";
import { UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiFetch, jsonApiFetch } from "@/lib/api-client";
import type { ClientAccount } from "@/lib/account-switch";

function initialsOf(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

/** Contas já usadas neste navegador: um clique entra, sem digitar a senha. */
export default function SavedAccounts({ accounts: initial }: { accounts: ClientAccount[] }) {
  const router = useRouter();
  const [accounts, setAccounts] = useState(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function enter(id: string) {
    setBusyId(id);
    setMessage(null);
    try {
      const response = await jsonApiFetch("/api/auth/accounts/switch", { id });
      if (response.ok) {
        // Recarrega de verdade: zera qualquer estado da conta anterior.
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination
        window.location.assign("/membro");
        return;
      }
      const data = await response.json().catch(() => null);
      setMessage(data?.error ?? "Não foi possível entrar nessa conta.");
      // 401/403/404: o servidor já tirou a conta da lista.
      if (response.status !== 500) setAccounts((list) => list.filter((account) => account.id !== id));
    } catch {
      setMessage("Não foi possível entrar agora. Tente novamente.");
    }
    setBusyId(null);
  }

  async function forget(id: string) {
    setBusyId(id);
    setMessage(null);
    try {
      const response = await apiFetch("/api/auth/accounts", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setAccounts((list) => list.filter((account) => account.id !== id));
      router.refresh();
    } catch {
      setMessage("Não foi possível remover a conta agora.");
    }
    setBusyId(null);
  }

  if (accounts.length === 0 && !message) return null;

  return (
    <div className="saved-accounts">
      <p className="saved-accounts-title">Contas neste navegador</p>
      <ul>
        {accounts.map((account) => (
          <li key={account.id}>
            <button className="saved-account" type="button" onClick={() => enter(account.id)} disabled={busyId !== null}>
              <span className="header-avatar">
                {account.avatarUrl ? <Image src={account.avatarUrl} alt="" width={36} height={36} unoptimized /> : initialsOf(account.name) || <UserRound size={19} />}
              </span>
              <span className="saved-account-text">
                <strong>{busyId === account.id ? "Entrando…" : account.name}</strong>
                <small>{account.email}</small>
              </span>
            </button>
            <button className="saved-account-forget" type="button" aria-label={`Esquecer ${account.name}`} title="Esquecer esta conta" onClick={() => forget(account.id)} disabled={busyId !== null}>
              <X size={16} />
            </button>
          </li>
        ))}
      </ul>
      {message && <p className="form-message error" role="alert">{message}</p>}
    </div>
  );
}
