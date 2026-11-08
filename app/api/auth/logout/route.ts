import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest } from "@/lib/api-guard";
import { createClient } from "@/lib/supabase/server";

// Sair da conta. Encerra a sessão no Supabase e apaga os cookies. Responde JSON
// porque quem chama é o botão do cabeçalho, por fetch — o formulário de
// app/auth/signout continua existindo para quem navega sem JavaScript.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  if (supabase) await supabase.auth.signOut();

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
