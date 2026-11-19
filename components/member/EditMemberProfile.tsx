"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Edit3 } from "lucide-react";
import { useToast } from "@/components/admin/ToastProvider";
import { createClient } from "@/lib/supabase/client";
import { jsonApiFetch } from "@/lib/api-client";
import { validatePasswordChange } from "@/lib/account-password";
import ProfileEditDialog, {
  EMPTY_PASSWORD, countProfileChanges, profileFormFrom, type ProfileFormErrors,
} from "@/components/member/ProfileEditDialog";
import type { MemberProfile } from "@/lib/types";

type EditableProfile = Pick<MemberProfile, "full_name" | "nickname" | "birth_date" | "house_cavalaria" | "house_arquearia" | "shirt_number" | "primary_build" | "secondary_build">;

/**
 * Botão "Editar perfil" e o modal de edição. `children` (opcional) é a visão
 * somente leitura renderizada no servidor, mostrada acima do botão.
 */
export default function EditMemberProfile({ profile, canEditAccessDirectly = false, children }: { profile: MemberProfile; canEditAccessDirectly?: boolean; children?: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [password, setPassword] = useState(EMPTY_PASSWORD);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [form, setForm] = useState(() => profileFormFrom(profile));
  const triggerRef = useRef<HTMLButtonElement>(null);
  // O que o formulário tinha ao abrir; as alterações são contadas contra isso.
  const [initial, setInitial] = useState(form);
  const changes = countProfileChanges(initial, form, password);

  useEffect(() => {
    if (!closing) return;
    const timeout = window.setTimeout(() => { setOpen(false); setClosing(false); }, 200);
    return () => window.clearTimeout(timeout);
  }, [closing]);

  // Ao fechar, o foco volta para o botão que abriu o modal.
  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    return () => trigger?.focus({ preventScroll: true });
  }, [open]);

  const closeDialog = useCallback(() => setClosing(true), []);
  const clearError = useCallback((key: keyof ProfileFormErrors) => {
    setErrors((current) => (current[key] ? { ...current, [key]: undefined } : current));
  }, []);

  function openDialog() {
    // Parte sempre do perfil mais recente, descartando o que ficou de uma edição anterior.
    const fresh = profileFormFrom(profile);
    setForm(fresh);
    setInitial(fresh);
    setPassword(EMPTY_PASSWORD);
    setPasswordOpen(false);
    setErrors({});
    setClosing(false);
    setOpen(true);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;
    setErrors({});
    const supabase = createClient();
    if (!supabase) return setErrors({ general: "Serviço indisponível no momento. Tente novamente." });

    // Senha é opcional: só entra em jogo se algum dos três campos foi preenchido.
    const changingPassword = Boolean(password.current || password.next || password.confirm);
    if (changingPassword) {
      const invalid = validatePasswordChange(password.current, password.next)
        ?? (password.next !== password.confirm ? "A confirmação não é igual à nova senha." : null);
      if (invalid) {
        setPasswordOpen(true);
        return setErrors({ password: invalid });
      }
    }

    setSaving(true);
    if (changingPassword) {
      // Primeiro a senha: se a senha atual estiver errada, nada do perfil é salvo pela metade.
      try {
        const response = await jsonApiFetch("/api/account/password", { current_password: password.current, new_password: password.next });
        const data = await response.json().catch(() => null);
        if (!response.ok) {
          setErrors({ password: data?.error ?? "Não foi possível trocar a senha." });
          setSaving(false);
          return;
        }
      } catch {
        setErrors({ password: "Não foi possível trocar a senha agora. Tente novamente." });
        setSaving(false);
        return;
      }
      setPassword(EMPTY_PASSWORD);
      setPasswordOpen(false);
    }
    // Patente e graduação passam por aprovação de um administrador, inclusive
    // quando quem edita é o próprio administrador.
    const commanderChanged = {
      commander_cavalaria: form.commander_cavalaria !== (profile.commander_cavalaria ?? false),
      commander_arquearia: form.commander_arquearia !== (profile.commander_arquearia ?? false),
    };
    const accessDetailsChanged = form.rank !== profile.rank
      || form.graduation_cavalaria !== (profile.graduation_cavalaria ?? "sem_graduacao")
      || form.graduation_arquearia !== (profile.graduation_arquearia ?? "sem_graduacao")
      || commanderChanged.commander_cavalaria
      || commanderChanged.commander_arquearia;
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
      // Só vão quando mudam: sem o parâmetro a função mantém o comando como está, e um
      // banco ainda sem a migração 024 continua aceitando o resto do perfil.
      ...(commanderChanged.commander_cavalaria ? { requested_commander_cavalaria: form.commander_cavalaria } : {}),
      ...(commanderChanged.commander_arquearia ? { requested_commander_arquearia: form.commander_arquearia } : {}),
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
      const prefix = changingPassword ? "Senha alterada, mas o restante do perfil não foi salvo." : "";
      if (error.code === "23505") {
        setErrors({ nickname: "Esse apelido já está sendo usado por outro membro.", general: prefix || undefined });
      } else {
        const reason = error.code === "22023"
          ? "Confira o apelido e o número da camisa."
          : "Não foi possível salvar as alterações. Tente novamente.";
        setErrors({ general: prefix ? `${prefix} ${reason}` : reason });
      }
      setSaving(false);
      return;
    }

    const saved = {
      ...form,
      full_name: updated.full_name,
      nickname: updated.nickname,
      house_cavalaria: updated.house_cavalaria || "",
      house_arquearia: updated.house_arquearia || "",
      shirt_number: updated.shirt_number?.toString() || "",
      primary_build: updated.primary_build || "",
      secondary_build: updated.secondary_build || "",
    };
    setForm(saved);
    setInitial(saved);
    window.dispatchEvent(new Event("dk-profile-updated"));
    router.refresh();
    const done = changingPassword ? "Perfil e senha atualizados." : "Perfil atualizado.";
    toast.success(accessDetailsChanged ? done + " Patente, graduação ou comando aguardam aprovação de um administrador." : done);
    setSaving(false);
    closeDialog();
  }

  return (
    <div className="profile-edit">
      {children}
      <button ref={triggerRef} className="button button-ghost button-small profile-edit-open" type="button" aria-haspopup="dialog" onClick={openDialog}>
        <Edit3 size={16} aria-hidden="true" /> Editar perfil
      </button>
      {open && (
        <ProfileEditDialog
          profile={profile}
          canEditAccessDirectly={canEditAccessDirectly}
          form={form}
          setForm={setForm}
          password={password}
          setPassword={setPassword}
          passwordOpen={passwordOpen}
          setPasswordOpen={setPasswordOpen}
          errors={errors}
          clearError={clearError}
          changes={changes}
          saving={saving}
          closing={closing}
          onSubmit={submit}
          onClose={closeDialog}
        />
      )}
    </div>
  );
}
