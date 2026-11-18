"use client";

import { Copy, TicketPlus, XCircle } from "lucide-react";
import { useState } from "react";
import { useAdminData, type Invite } from "@/components/admin/AdminDataContext";
import AdminTable from "@/components/admin/AdminTable";
import AdminTitle from "@/components/admin/AdminTitle";
import { useToast } from "@/components/admin/ToastProvider";
import { friendlyError } from "@/lib/friendly-error";

export default function InvitesSection() {
  const { supabase, invites, setInvites } = useAdminData();
  const toast = useToast();
  const [inviteBusy, setInviteBusy] = useState<string | null>(null);

  async function createInvite() {
    if (!supabase || inviteBusy) return;
    setInviteBusy("create");
    try {
      const code = `DK-${crypto.randomUUID().replace(/-/g, "").toUpperCase()}`;
      const expires = new Date();
      expires.setDate(expires.getDate() + 15);
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

  async function copyInviteLink(code: string) {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/area-do-membro/cadastro?convite=${code}`);
      toast.success("Link do convite copiado.");
    } catch {
      toast.error("Não foi possível copiar o link.");
    }
  }

  async function disableInvite(id: string) {
    if (!supabase || inviteBusy) return;
    setInviteBusy(id);
    try {
      const { data, error } = await supabase.from("invites").update({ active: false }).eq("id", id).select("*").single();
      if (error) throw error;
      setInvites((current) => current.map((invite) => invite.id === id ? data as Invite : invite));
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
      description="Links de cadastro de uso único, válidos por 15 dias."
      action={<button className="button button-primary" disabled={Boolean(inviteBusy)} onClick={createInvite}>{inviteBusy === "create" ? <span className="inline-spinner" aria-hidden="true" /> : <TicketPlus size={18} />} {inviteBusy === "create" ? "Gerando…" : "Gerar convite"}</button>}
    />
    <AdminTable headers={["Código", "Validade", "Uso", "Situação", "Ações"]} count={invites.length} empty="Nenhum convite gerado ainda.">
      {invites.map((invite) => <tr key={invite.id}>
        <td><strong>{invite.code}</strong></td>
        <td>{new Date(invite.expires_at).toLocaleDateString("pt-BR")}</td>
        <td>{invite.current_uses}/{invite.max_uses}</td>
        <td><span className={`badge ${invite.active ? "aprovado" : "suspenso"}`}>{invite.active ? "Ativo" : "Inativo"}</span></td>
        <td className="row-actions">
          <button title="Copiar link" aria-label="Copiar link do convite" onClick={() => void copyInviteLink(invite.code)}><Copy /></button>
          <button className="is-danger" title="Desativar" aria-label={inviteBusy === invite.id ? "Desativando convite" : "Desativar convite"} disabled={Boolean(inviteBusy) || !invite.active} onClick={() => disableInvite(invite.id)}>{inviteBusy === invite.id ? <span className="inline-spinner" aria-hidden="true" /> : <XCircle />}</button>
        </td>
      </tr>)}
    </AdminTable>
  </div>;
}
