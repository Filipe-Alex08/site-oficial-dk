import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest } from "@/lib/api-guard";
import { createClient } from "@/lib/supabase/server";

// Sair da conta. Encerra a sessão no Supabase e apaga os cookies. Responde JSON
// porque quem chama é o botão do cabeçalho, por fetch — o formulário de
// app/auth/signout continua existindo para quem navega sem JavaScript.
//
// Sai SÓ da conta ativa. O cofre de contas salvas (cookie dk-contas, veja
// lib/account-vault.ts) fica como está de propósito: o navegador permanece
// deslogado e quem escolhe em qual conta entrar é a pessoa, na tela de login.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  // "local": sair neste aparelho não pode derrubar a sessão dos outros (o padrão,
  // "global", encerraria todas).
  if (supabase) await supabase.auth.signOut({ scope: "local" });

  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
