import type { SupabaseClient, User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest, notConfigured } from "@/lib/api-guard";
import { loadNotesSettings, type NotesSettings } from "@/lib/member-notes";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const isUuid = (value: unknown): value is string => typeof value === "string" && uuid.test(value);

export const NO_STORE = { "Cache-Control": "no-store" };

export type NoteActor = {
  user: User;
  /** Cliente com a sessão do membro (as regras de RLS valem). */
  supabase: SupabaseClient;
  /** Service role: só depois de conferir quem está pedindo. */
  admin: SupabaseClient;
  settings: NotesSettings;
};

/**
 * Porta de entrada das rotas de anotação: mesma origem, sessão válida, perfil
 * aprovado e sistema de anotações ligado. Devolve a resposta de erro pronta
 * quando algo falha.
 */
export async function requireNoteActor(request: Request): Promise<NoteActor | NextResponse> {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) return notConfigured();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Entre na sua conta para continuar." }, { status: 401, headers: NO_STORE });

  const { data: profile } = await supabase.from("profiles").select("status").eq("id", user.id).maybeSingle();
  if (profile?.status !== "aprovado") return NextResponse.json({ error: "Acesso negado." }, { status: 403, headers: NO_STORE });

  const settings = await loadNotesSettings(admin);
  if (!settings.enabled) return NextResponse.json({ error: "O sistema de anotações está desativado." }, { status: 403, headers: NO_STORE });

  return { user, supabase, admin, settings };
}
