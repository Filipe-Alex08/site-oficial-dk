"use client";

import Image from "next/image";
import { useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

/** Foto de perfil em tamanho de lista, com iniciais quando não há foto. */
export default function Avatar({ name, path, size = 36 }: { name: string; path?: string | null; size?: number }) {
  const supabase = useMemo(() => createClient(), []);
  const url = path && supabase ? supabase.storage.from("profile-avatars").getPublicUrl(path).data.publicUrl : null;
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "?";
  return <span className="admin-avatar" style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden="true">
    {url ? <Image src={url} alt="" width={size} height={size} unoptimized /> : initials}
  </span>;
}
