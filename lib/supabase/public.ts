import { createClient } from "@supabase/supabase-js";

// Cliente anônimo, sem cookies e sem sessão, para dados públicos.
//
// O cliente de lib/supabase/server.ts lê cookies(), o que força a página a ser
// renderizada a cada visita. Este não toca em nenhuma API de requisição, então
// páginas que o usam podem ser geradas uma vez e servidas do cache (ISR).
export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}
