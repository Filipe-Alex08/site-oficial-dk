"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function MemberAvatar({ avatarUrl, avatarPath, nickname }: { avatarUrl: string | null; avatarPath: string | null; nickname: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ left: 0, top: 0 });
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!menuOpen) return;
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !controlRef.current?.contains(event.target)) setMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  async function changePhoto(file: File | undefined) {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setMessage("Escolha uma imagem JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("A foto deve ter no máximo 5 MB.");
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      setMessage("Não foi possível conectar ao banco de dados.");
      return;
    }

    setUploading(true);
    setMenuOpen(false);
    setMessage("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("Entre novamente para alterar sua foto.");
      setUploading(false);
      return;
    }

    const extension = file.type === "image/jpeg" ? "jpg" : file.type === "image/png" ? "png" : "webp";
    const nextPath = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("profile-avatars").upload(nextPath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });
    if (uploadError) {
      setMessage("Não foi possível enviar a foto. Tente novamente.");
      setUploading(false);
      return;
    }

    const { error: saveError } = await supabase.rpc("update_own_member_avatar", { requested_avatar_path: nextPath });
    if (saveError) {
      await supabase.storage.from("profile-avatars").remove([nextPath]);
      setMessage("Não foi possível salvar a foto. Tente novamente.");
      setUploading(false);
      return;
    }

    if (avatarPath) await supabase.storage.from("profile-avatars").remove([avatarPath]);
    window.dispatchEvent(new Event("dk-profile-updated"));
    router.refresh();
    setMessage("Foto atualizada.");
    setUploading(false);
  }

  async function removePhoto() {
    if (!avatarPath) return;
    const supabase = createClient();
    if (!supabase) {
      setMessage("Não foi possível conectar ao banco de dados.");
      setMenuOpen(false);
      return;
    }

    setUploading(true);
    setMenuOpen(false);
    setMessage("");
    const { error } = await supabase.rpc("update_own_member_avatar", { requested_avatar_path: null });
    if (error) {
      setMessage("Não foi possível remover a foto. Tente novamente.");
      setUploading(false);
      return;
    }

    await supabase.storage.from("profile-avatars").remove([avatarPath]);
    window.dispatchEvent(new Event("dk-profile-updated"));
    router.refresh();
    setMessage("Foto removida.");
    setUploading(false);
  }

  function toggleMenu(event: ReactMouseEvent<HTMLButtonElement>) {
    if (menuOpen) {
      setMenuOpen(false);
      return;
    }
    const avatarBounds = event.currentTarget.getBoundingClientRect();
    const menuWidth = 176;
    const menuHeight = 92;
    const pointerX = event.detail === 0 ? avatarBounds.right : event.clientX;
    const pointerY = event.detail === 0 ? avatarBounds.top + avatarBounds.height / 2 : event.clientY;
    let left = Math.max(avatarBounds.right + 8, pointerX + 8);
    if (left + menuWidth > window.innerWidth - 8) left = Math.max(8, avatarBounds.left - menuWidth - 8);
    const top = Math.min(Math.max(8, pointerY - 18), window.innerHeight - menuHeight - 8);
    setMenuPosition({ left, top });
    setMenuOpen(true);
  }

  return (
    <div className="member-avatar-control" ref={controlRef}>
      <button className="profile-avatar" type="button" aria-label={uploading ? "Atualizando foto de perfil" : "Opções da foto de perfil"} aria-expanded={menuOpen} aria-haspopup="menu" title="Opções da foto de perfil" disabled={uploading} onClick={toggleMenu}>
        {avatarUrl ? <Image src={avatarUrl} alt={`Foto de ${nickname}`} width={84} height={84} unoptimized /> : <UserRound />}
      </button>
      {menuOpen && <div className="profile-avatar-menu" style={menuPosition} role="group" aria-label="Opções da foto de perfil">
        <button type="button" onClick={() => inputRef.current?.click()}><ImagePlus size={16} /> Mudar foto</button>
        <button type="button" disabled={!avatarPath} onClick={removePhoto}><Trash2 size={16} /> Remover foto</button>
      </div>}
      <input ref={inputRef} className="member-avatar-input" type="file" accept="image/jpeg,image/png,image/webp" aria-label="Escolher nova foto de perfil" onChange={(event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        void changePhoto(file);
      }} />
      {uploading && <small className="member-avatar-message">Enviando foto…</small>}
      {message && <small className={`member-avatar-message ${message === "Foto atualizada." || message === "Foto removida." ? "success" : "error"}`} role="status">{message}</small>}
    </div>
  );
}
