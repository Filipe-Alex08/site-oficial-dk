"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { MemberProfile } from "@/lib/types";

type EditableProfile = Pick<MemberProfile, "full_name" | "nickname" | "birth_date" | "house" | "shirt_number" | "primary_build" | "secondary_build">;

export default function EditMemberProfile({ profile }: { profile: EditableProfile }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    full_name: profile.full_name,
    nickname: profile.nickname,
    birth_date: profile.birth_date || "",
    house: profile.house || "",
    shirt_number: profile.shirt_number?.toString() || "",
    primary_build: profile.primary_build || "",
    secondary_build: profile.secondary_build || "",
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) return setMessage("Não foi possível conectar ao banco de dados.");

    setSaving(true);
    setMessage("");
    const updated: EditableProfile = {
      full_name: form.full_name.trim(),
      nickname: form.nickname.trim(),
      birth_date: form.birth_date || null,
      house: form.house.trim() || null,
      shirt_number: form.shirt_number === "" ? null : Number(form.shirt_number),
      primary_build: form.primary_build.trim() || null,
      secondary_build: form.secondary_build.trim() || null,
    };
    const { error } = await supabase.rpc("update_own_member_profile", {
      requested_full_name: updated.full_name,
      requested_nickname: updated.nickname,
      requested_birth_date: updated.birth_date,
      requested_house: updated.house,
      requested_shirt_number: updated.shirt_number,
      requested_primary_build: updated.primary_build,
      requested_secondary_build: updated.secondary_build,
    });

    if (error) {
      setMessage(error.code === "23505"
        ? "Esse apelido já está sendo usado por outro membro."
        : error.code === "22023"
          ? "Confira o apelido e o número da camisa."
          : "Não foi possível salvar as alterações. Tente novamente.");
      setSaving(false);
      return;
    }

    setForm({
      full_name: updated.full_name,
      nickname: updated.nickname,
      birth_date: updated.birth_date || "",
      house: updated.house || "",
      shirt_number: updated.shirt_number?.toString() || "",
      primary_build: updated.primary_build || "",
      secondary_build: updated.secondary_build || "",
    });
    window.dispatchEvent(new Event("dk-profile-updated"));
    router.refresh();
    setMessage("Perfil atualizado.");
    setEditing(false);
    setSaving(false);
  }

  function cancel() {
    setForm({
      full_name: profile.full_name,
      nickname: profile.nickname,
      birth_date: profile.birth_date || "",
      house: profile.house || "",
      shirt_number: profile.shirt_number?.toString() || "",
      primary_build: profile.primary_build || "",
      secondary_build: profile.secondary_build || "",
    });
    setMessage("");
    setEditing(false);
  }

  return (
    <div className={`profile-edit ${editing ? "is-editing" : ""}`}>
      {!editing ? <button className="profile-edit-trigger" type="button" aria-label="Editar perfil" title="Editar perfil" onClick={() => { setMessage(""); setEditing(true); }}><Edit3 size={14} /></button> : (
        <form onSubmit={submit}>
          <div className="profile-edit-fields">
            <div className="field"><label htmlFor="member-full-name">Nome completo</label><input id="member-full-name" value={form.full_name} minLength={2} maxLength={120} required onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} /></div>
            <div className="field"><label htmlFor="member-nickname">Apelido</label><input id="member-nickname" value={form.nickname} minLength={2} maxLength={60} required onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))} /></div>
            <div className="field"><label htmlFor="member-birth-date">Data de nascimento</label><input id="member-birth-date" type="date" value={form.birth_date} onChange={(event) => setForm((current) => ({ ...current, birth_date: event.target.value }))} /></div>
            <div className="field"><label htmlFor="member-house">Casa</label><input id="member-house" value={form.house} maxLength={80} onChange={(event) => setForm((current) => ({ ...current, house: event.target.value }))} /></div>
            <div className="field"><label htmlFor="member-shirt-number">Número da camisa</label><input id="member-shirt-number" type="number" min="0" step="1" value={form.shirt_number} onChange={(event) => setForm((current) => ({ ...current, shirt_number: event.target.value }))} /></div>
            <div className="field"><label htmlFor="member-primary-build">Build principal</label><input id="member-primary-build" value={form.primary_build} maxLength={120} onChange={(event) => setForm((current) => ({ ...current, primary_build: event.target.value }))} /></div>
            <div className="field"><label htmlFor="member-secondary-build">Build secundária</label><input id="member-secondary-build" value={form.secondary_build} maxLength={120} onChange={(event) => setForm((current) => ({ ...current, secondary_build: event.target.value }))} /></div>
          </div>
          <p className="profile-edit-help">E-mail, nível interno, patente e graduação são gerenciados pela equipe do DK.</p>
          <div className="profile-edit-actions">
            <button className="button button-primary button-small" type="submit" disabled={saving}><Save size={16} /> {saving ? "Salvando…" : "Salvar"}</button>
            <button className="button button-ghost button-small" type="button" onClick={cancel} disabled={saving}><X size={16} /> Cancelar</button>
          </div>
        </form>
      )}
      {message && <p className={`profile-edit-message ${message === "Perfil atualizado." ? "success" : "error"}`} role="status">{message}</p>}
    </div>
  );
}
