import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

/**
 * Porteiro da aba de logs. Usa a função can_view_logs() do banco: perfil
 * aprovado e (ADM Principal ou permissão "Ver logs" concedida).
 */
export async function requireLogViewer(): Promise<{ user: User } | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase.rpc("can_view_logs");
  if (error || data !== true) return null;

  return { user };
}
