import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest, notConfigured, requestOrigin } from "@/lib/api-guard";
import { logEvent } from "@/lib/app-log";
import { maskEmail } from "@/lib/log-sanitize";
import { RECOVERY_COOKIE, RECOVERY_COOKIE_MAX_AGE, normalizeEmail } from "@/lib/password-recovery";
import { createClient } from "@/lib/supabase/server";

const NO_STORE = { "cache-control": "no-store" };

// Pede o e-mail de "esqueci minha senha". O link volta por /auth/callback (PKCE:
// o comprovante fica num cookie gravado aqui, então o link só funciona no mesmo
// navegador). Sem `email` no corpo, vale o e-mail de quem está logado, que é o
// caso do botão dentro da edição de perfil.
//
// A resposta é a mesma exista ou não cadastro para o e-mail, para a tela não
// servir de consulta de quem é membro.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  if (!supabase) return notConfigured();

  let body: { email?: unknown } | null = null;
  try {
    body = await request.json();
  } catch {
    // Corpo ausente ou inválido: cai na validação abaixo.
  }

  let email = normalizeEmail(body?.email);
  if (!email && (body?.email === undefined || body?.email === null || body?.email === "")) {
    const { data } = await supabase.auth.getUser();
    email = normalizeEmail(data.user?.email);
  }
  if (!email) return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400, headers: NO_STORE });

  const origin = requestOrigin(request);
  if (!origin) {
    console.error("Recuperação de senha indisponível: não foi possível determinar a origem pública do site.");
    return NextResponse.json({ error: "Não foi possível enviar o e-mail agora. Tente novamente." }, { status: 500, headers: NO_STORE });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${origin}/auth/callback` });
  if (error) {
    if (error.status === 429 || error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") {
      logEvent({ level: "aviso", category: "auth", action: "recuperacao_bloqueada", message: "Pedido de redefinição de senha bloqueado por excesso de tentativas", request, details: { email: maskEmail(email) } });
      return NextResponse.json({ error: "Aguarde um minuto antes de pedir outro e-mail." }, { status: 429, headers: NO_STORE });
    }
    console.error("Falha ao pedir o e-mail de redefinição de senha", error);
    return NextResponse.json({ error: "Não foi possível enviar o e-mail agora. Tente novamente." }, { status: 502, headers: NO_STORE });
  }

  // Marca este navegador como o que pediu a redefinição (veja lib/password-recovery.ts).
  try {
    (await cookies()).set(RECOVERY_COOKIE, "1", { httpOnly: true, sameSite: "lax", secure: origin.startsWith("https://"), path: "/", maxAge: RECOVERY_COOKIE_MAX_AGE });
  } catch (cookieError) {
    console.error("Falha ao gravar a marca de recuperação", cookieError);
  }

  logEvent({ category: "auth", action: "recuperacao_pedida", message: "Redefinição de senha pedida por e-mail", request, details: { email: maskEmail(email) } });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
