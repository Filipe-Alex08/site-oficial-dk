"use client";

import { Check, Copy, TicketPlus, XCircle } from "lucide-react";
import { useState } from "react";
import { useAdminData, type Invite } from "@/components/admin/AdminDataContext";
import AdminTitle from "@/components/admin/AdminTitle";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import { useToast } from "@/components/admin/ToastProvider";
import Panel from "@/components/admin/ui/Panel";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { friendlyError } from "@/lib/friendly-error";

const DAY = 24 * 60 * 60 * 1000;
const VALIDITY_DAYS = 15;

/** Situação real de um convite: ele pode estar "ativo" no banco mas vencido ou já usado. */
function inviteState(invite: Invite, now: number): { status: "aprovado" | "suspenso" | "pendente"; label: string; daysLeft: number } {
  const daysLeft = Math.ceil((new Date(invite.expires_at).getTime() - now) / DAY);
  if (!invite.active) return { status: "suspenso", label: "Desativado", daysLeft };
  if (invite.current_uses >= invite.max_uses) return { status: "pendente", label: "Usado", daysLeft };
  if (daysLeft <= 0) return { status: "suspenso", label: "Vencido", daysLeft };
  return { status: "aprovado", label: "Disponível", daysLeft };
}

export default function InvitesSection() {
  const { supabase, invites, setInvites } = useAdminData();
  const toast = useToast();
  const confirm = useConfirm();
  const [inviteBusy, setInviteBusy] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  // O "agora" é fixado na abertura da tela: o prazo restante é uma foto do momento.
  const [now] = useState(() => Date.now());

  async function createInvite() {
    if (!supabase || inviteBusy) return;
    setInviteBusy("create");
    try {
      const code = `DK-${crypto.randomUUID().replace(/-/g, "").toUpperCase()}`;
      const expires = new Date();
      expires.setDate(expires.getDate() + VALIDITY_DAYS);
      const { data, error } = await supabase.from("invites").insert({ code, expires_at: expires.toISOString(), max_uses: 1 }).select("*").single();
      if (error) throw error;
      setInvites((current) => [data as Invite, ...current]);
      toast.success("Convite criado.");
    } catch (error) {
      toast.error(friendlyError(error, "Não foi possível criar o convite."));
    } finally {
      setInviteBusy(null);
    }
  }

  async function copyInviteLink(invite: Invite) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/area-do-membro/cadastro?convite=${invite.code}`);
      setCopiedId(invite.id);
      window.setTimeout(() => setCopiedId((current) => current === invite.id ? null : current), 2000);
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  async function disableInvite(invite: Invite) {
    if (!supabase || inviteBusy) return;
    if (!(await confirm({ title: "Desativar convite?", message: "O link deixa de funcionar para novos cadastros.", confirmLabel: "Desativar", danger: true }))) return;
    setInviteBusy(invite.id);
    try {
      const { data, error } = await supabase.from("invites").update({ active: false }).eq("id", invite.id).select("*").single();
      if (error) throw error;
      setInvites((current) => current.map((item) => item.id === invite.id ? data as Invite : item));
      toast.success("Convite desativado.");
    } catch (error) {
      toast.error(friendlyError(error, "Não foi possível desativar o convite."));
    } finally {
      setInviteBusy(null);
    }
  }

  return <div>
    <AdminTitle
      eyebrow="Pessoas"
      title="Convites"
      description={`Links de cadastro de uso único, válidos por ${VALIDITY_DAYS} dias.`}
      action={<button className="button button-primary" disabled={Boolean(inviteBusy)} onClick={createInvite}>{inviteBusy === "create" ? <span className="inline-spinner" aria-hidden="true" /> : <TicketPlus size={18} />} {inviteBusy === "create" ? "Gerando…" : "Gerar convite"}</button>}
    />
    {invites.length === 0
      ? <div className="empty-state"><TicketPlus /><h3>Nenhum convite gerado ainda</h3><p>Gere um link para convidar alguém a se cadastrar.</p></div>
      : <Panel flush>
        <ul className="invite-list">{invites.map((invite) => {
          const state = inviteState(invite, now);
          const live = state.label === "Disponível";
          const tone = state.daysLeft <= 3 ? "is-danger" : state.daysLeft <= 7 ? "is-warn" : "is-ok";
          const share = Math.max(0, Math.min(100, state.daysLeft / VALIDITY_DAYS * 100));
          return <li key={invite.id} className={live ? "" : "is-dim"}>
            <div className="invite-main">
              <code className="invite-code">{invite.code}</code>
              <span className="invite-meta">{invite.current_uses}/{invite.max_uses} {invite.max_uses === 1 ? "uso" : "usos"} · vence em {new Date(invite.expires_at).toLocaleDateString("pt-BR")}</span>
              {live && <span className="invite-validity" role="img" aria-label={`${state.daysLeft} ${state.daysLeft === 1 ? "dia restante" : "dias restantes"}`}><span className={tone} style={{ width: `${share}%` }} /></span>}
            </div>
            <StatusBadge status={state.status} label={state.label} />
            <div className="invite-actions">
              <button className={`button button-ghost button-small${copiedId === invite.id ? " is-copied" : ""}`} type="button" onClick={() => void copyInviteLink(invite)} aria-label="Copiar link do convite">
                {copiedId === invite.id ? <><Check size={16} /> Copiado</> : <><Copy size={16} /> Copiar link</>}
              </button>
              <button className="button button-ghost button-small" type="button" disabled={Boolean(inviteBusy) || !invite.active} onClick={() => void disableInvite(invite)} aria-label={inviteBusy === invite.id ? "Desativando convite" : "Desativar convite"}>
                {inviteBusy === invite.id ? <span className="inline-spinner" aria-hidden="true" /> : <XCircle size={16} />} Desativar
              </button>
            </div>
          </li>;
        })}</ul>
      </Panel>}
  </div>;
}
