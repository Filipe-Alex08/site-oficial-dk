import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();
  // Location relativo para não expor o host interno atrás de proxy reverso.
  return new Response(null, { status: 303, headers: { Location: "/area-do-membro/login" } });
}
