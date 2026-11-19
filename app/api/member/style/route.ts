import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest } from "@/lib/api-guard";
import { MEMBER_STYLE_COOKIE, MEMBER_STYLE_COOKIE_OPTIONS, isMemberStyle } from "@/lib/member-style";
import { SUPABASE_COOKIE_OPTIONS } from "@/lib/supabase/cookie-options";

const NO_STORE = { "cache-control": "no-store" };

// Guarda a aparência escolhida na área do membro (graduação ou padrão). Não exige
// login: é só uma preferência do navegador, sem dado pessoal.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  let style: unknown;
  try {
    style = (await request.json())?.style;
  } catch {
    // Corpo ausente ou inválido: cai na validação abaixo.
  }
  if (!isMemberStyle(style)) return NextResponse.json({ error: "Aparência inválida." }, { status: 400, headers: NO_STORE });

  const response = NextResponse.json({ style }, { headers: NO_STORE });
  // `Secure` segue a mesma regra do cookie de sessão (derivada da URL pública do site).
  response.cookies.set(MEMBER_STYLE_COOKIE, style, { ...MEMBER_STYLE_COOKIE_OPTIONS, secure: SUPABASE_COOKIE_OPTIONS.secure });
  return response;
}
