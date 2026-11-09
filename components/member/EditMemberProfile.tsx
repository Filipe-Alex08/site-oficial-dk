"use client";

import { buildOptions } from "@/lib/insignias";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Save, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getZodiacSign } from "@/lib/zodiac";
import Select from "@/components/ui/Select";
import { graduationOptions, graduationTracks, houseFor, rankGroups } from "@/lib/member-access";
import type { DkRank, GraduationLevel, MemberProfile } from "@/lib/types";

type EditableProfile = Pick<MemberProfile, "full_name" | "nickname" | "birth_date" | "house_cavalaria" | "house_arquearia" | "shirt_number" | "primary_build" | "secondary_build">;

export default function EditMemberProfile({ profile, canEditAccessDirectly = false }: { profile: MemberProfile; canEditAccessDirectly?: boolean }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (message !== "Perfil atualizado.") return;
    const timeout = window.setTimeout(() => setMessage(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [message]);
  const [form, setForm] = useState({
    rank: profile.requested_rank ?? profile.rank,
    graduation_cavalaria: profile.requested_graduation_cavalaria ?? profile.graduation_cavalaria ?? "sem_graduacao",
    graduation_arquearia: profile.requested_graduation_arquearia ?? profile.graduation_arquearia ?? "sem_graduacao",
    full_name: profile.full_name,
    nickname: profile.nickname,
    birth_date: profile.birth_date || "",
    house_cavalaria: houseFor(profile, "cavalaria"),
    house_arquearia: houseFor(profile, "arquearia"),
    shirt_number: profile.shirt_number?.toString() || "",
    primary_build: profile.primary_build || "",
    secondary_build: profile.secondary_build || "",
  });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();
    if (!supabase) return setMessage("Serviço indisponível no momento. Tente novamente.");

    setSaving(true);
    setMessage("");
    // Patente e graduação passam por aprovação de um administrador, inclusive
    // quando quem edita é o próprio administrador.
    const accessDetailsChanged = form.rank !== profile.rank
      || form.graduation_cavalaria !== (profile.graduation_cavalaria ?? "sem_graduacao")
      || form.graduation_arquearia !== (profile.graduation_arquearia ?? "sem_graduacao");
    const updated: EditableProfile = {
      full_name: form.full_name.trim(),
      nickname: form.nickname.trim(),
      birth_date: form.birth_date || null,
      house_cavalaria: form.house_cavalaria.trim() || null,
      house_arquearia: form.house_arquearia.trim() || null,
      shirt_number: form.shirt_number === "" ? null : Number(form.shirt_number),
      primary_build: form.primary_build.trim() || null,
      secondary_build: form.secondary_build.trim() || null,
    };
    const { error } = await supabase.rpc("update_own_member_profile_with_access_request", {
      requested_rank: form.rank,
      requested_graduation_cavalaria: form.graduation_cavalaria,
      requested_graduation_arquearia: form.graduation_arquearia,
      requested_full_name: updated.full_name,
      requested_nickname: updated.nickname,
      requested_birth_date: updated.birth_date,
      requested_house_cavalaria: updated.house_cavalaria,
      requested_house_arquearia: updated.house_arquearia,
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
      rank: form.rank,
      graduation_cavalaria: form.graduation_cavalaria,
      graduation_arquearia: form.graduation_arquearia,
      full_name: updated.full_name,
      nickname: updated.nickname,
      birth_date: updated.birth_date || "",
      house_cavalaria: updated.house_cavalaria || "",
      house_arquearia: updated.house_arquearia || "",
      shirt_number: updated.shirt_number?.toString() || "",
      primary_build: updated.primary_build || "",
      secondary_build: updated.secondary_build || "",
    });
    window.dispatchEvent(new Event("dk-profile-updated"));
    router.refresh();
    setMessage(accessDetailsChanged
      ? "Perfil atualizado. Patente e graduação aguardam aprovação de um administrador."
      : "Perfil atualizado.");
    setEditing(false);
    setSaving(false);
  }

  function cancel() {
    setForm({
      rank: profile.requested_rank ?? profile.rank,
      graduation_cavalaria: profile.requested_graduation_cavalaria ?? profile.graduation_cavalaria ?? "sem_graduacao",
      graduation_arquearia: profile.requested_graduation_arquearia ?? profile.graduation_arquearia ?? "sem_graduacao",
      full_name: profile.full_name,
      nickname: profile.nickname,
      birth_date: profile.birth_date || "",
      house_cavalaria: houseFor(profile, "cavalaria"),
      house_arquearia: houseFor(profile, "arquearia"),
      shirt_number: profile.shirt_number?.toString() || "",
      primary_build: profile.primary_build || "",
      secondary_build: profile.secondary_build || "",
    });
    setMessage("");
    setEditing(false);
  }

  return (
    <>
    {profile.access_request_id && <p className="profile-edit-help" role="status">Alteração de patente e graduação aguardando aprovação.</p>}
    <div className={`profile-edit ${editing ? "is-editing" : ""}`}>
      {!editing ? <button className="profile-edit-trigger" type="button" aria-label="Editar perfil" title="Editar perfil" onClick={() => { cancel(); setEditing(true); }}><Edit3 size={14} /></button> : (
        <form onSubmit={submit}>
          <div className="profile-edit-fields">
            <div className="field"><label htmlFor="member-full-name">Nome completo</label><input id="member-full-name" value={form.full_name} minLength={2} maxLength={120} required onChange={(event) => setForm((current) => ({ ...current, full_name: event.target.value }))} /></div>
            <div className="field"><label htmlFor="member-nickname">Apelido</label><input id="member-nickname" value={form.nickname} minLength={2} maxLength={60} required onChange={(event) => setForm((current) => ({ ...current, nickname: event.target.value }))} /></div>
            <div className="field"><label htmlFor="profile-rank">Patente</label><Select id="profile-rank" value={form.rank} options={rankGroups.flatMap((group) => group.ranks.map((rank) => ({ ...rank, group: group.category })))} onChange={(value) => setForm((current) => ({ ...current, rank: value as DkRank }))} /></div>
            {graduationTracks.map((track) => <div className="field" key={track.value}><label htmlFor={`profile-${track.field}`}>Graduação em {track.label}</label><Select id={`profile-${track.field}`} value={form[track.field]} options={graduationOptions} onChange={(value) => setForm((current) => ({ ...current, [track.field]: value as GraduationLevel }))} /></div>)}
            <div className="field"><label htmlFor="member-birth-date">Data de nascimento</label><input id="member-birth-date" type="date" value={form.birth_date} onChange={(event) => setForm((current) => ({ ...current, birth_date: event.target.value }))} /></div>
            <div className="field"><label htmlFor="member-zodiac-sign">Signo do Zodíaco</label><input id="member-zodiac-sign" value={getZodiacSign(form.birth_date)} readOnly aria-readonly="true" placeholder="Preenchido automaticamente" /></div>
            {graduationTracks.map((track) => <div className="field" key={track.houseField}><label htmlFor={`member-${track.houseField}`}>Casa na {track.label}</label><input id={`member-${track.houseField}`} value={form[track.houseField]} maxLength={80} onChange={(event) => setForm((current) => ({ ...current, [track.houseField]: event.target.value }))} /></div>)}
            <div className="field"><label htmlFor="member-shirt-number">Número da camisa</label><input id="member-shirt-number" type="number" min="0" step="1" value={form.shirt_number} onChange={(event) => setForm((current) => ({ ...current, shirt_number: event.target.value }))} /></div>
            <div className="field"><label htmlFor="member-primary-build">Build principal</label><input id="member-primary-build" list="member-build-options" value={form.primary_build} maxLength={120} onChange={(event) => setForm((current) => ({ ...current, primary_build: event.target.value }))} /></div>
            <div className="field"><label htmlFor="member-secondary-build">Build secundária</label><input id="member-secondary-build" list="member-build-options" value={form.secondary_build} maxLength={120} onChange={(event) => setForm((current) => ({ ...current, secondary_build: event.target.value }))} /></div>
            <datalist id="member-build-options">{buildOptions.map((build) => <option key={build} value={build} />)}</datalist>
          </div>
          <p className="profile-edit-help">{canEditAccessDirectly ? "Suas alterações de patente e graduação valem na hora." : "Alterações de patente e graduação passam por aprovação; seus acessos atuais continuam até lá."}</p>
          <div className="profile-edit-actions">
            <button className="button button-primary button-small" type="submit" disabled={saving}><Save size={16} /> {saving ? "Salvando…" : "Salvar"}</button>
            <button className="button button-ghost button-small" type="button" onClick={cancel} disabled={saving}><X size={16} /> Cancelar</button>
          </div>
        </form>
      )}
      {message && <p className={`profile-edit-message ${message === "Perfil atualizado." ? "success" : "error"}`} role="status">{message}</p>}
    </div>
    </>
  );
}
