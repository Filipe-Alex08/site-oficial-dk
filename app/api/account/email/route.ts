import { NextResponse } from "next/server";
import { createClient as createStatelessClient } from "@supabase/supabase-js";
import { forbidden, isSameOriginRequest, notConfigured, requestOrigin } from "@/lib/api-guard";
import { logEvent } from "@/lib/app-log";
import { maskEmail } from "@/lib/log-sanitize";
import { normalizeEmail, usesPasswordLogin } from "@/lib/password-recovery";
import { createClient } from "@/lib/supabase/server";

const NO_STORE = { "cache-control": "no-store" };

// Pedido de troca do próprio e-mail. O e-mail do login NÃO muda aqui: o Auth manda
// o link de confirmação e só troca depois que o membro o abre (a cópia em
// profiles.email acompanha por gatilho, migração 027). Isso impede pôr o e-mail
// de outra pessoa na própria conta sem provar que a caixa é sua. A senha atual é
// exigida pelo mesmo motivo da troca de senha: sessão roubada não basta.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  if (!supabase) return notConfigured();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user?.email) return NextResponse.json({ error: "Faça login para continuar." }, { status: 401, headers: NO_STORE });

  // Quem entra só pelo Google não tem senha atual para informar: cria uma antes (link por e-mail).
  if (!usesPasswordLogin(user)) {
    return NextResponse.json({ error: "Sua conta entra pelo Google e ainda não tem senha. Crie uma senha antes de trocar o e-mail." }, { status: 400, headers: NO_STORE });
  }

  let current: unknown;
  let nextRaw: unknown;
  try {
    const body = await request.json();
    current = body?.current_password;
    nextRaw = body?.new_email;
  } catch {
    // Corpo ausente ou inválido: cai na validação abaixo.
  }
  if (typeof current !== "string" || !current) {
    return NextResponse.json({ error: "Informe a senha atual." }, { status: 400, headers: NO_STORE });
  }
  const newEmail = normalizeEmail(nextRaw)?.toLowerCase();
  if (!newEmail) return NextResponse.json({ error: "Informe um e-mail válido." }, { status: 400, headers: NO_STORE });
  if (newEmail === user.email.toLowerCase()) {
    return NextResponse.json({ error: "Esse já é o e-mail da sua conta." }, { status: 400, headers: NO_STORE });
  }

  const origin = requestOrigin(request);
  if (!origin) {
    console.error("Troca de e-mail indisponível: não foi possível determinar a origem pública do site.");
    return NextResponse.json({ error: "Não foi possível enviar o e-mail agora. Tente novamente." }, { status: 500, headers: NO_STORE });
  }

  // Confere a senha atual com um cliente sem sessão própria (veja /api/account/password).
  const verifier = createStatelessClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { error: verifyError } = await verifier.auth.signInWithPassword({ email: user.email, password: current });
  if (verifyError) {
    if (verifyError.status === 429) {
      return NextResponse.json({ error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." }, { status: 429, headers: NO_STORE });
    }
    logEvent({ level: "aviso", category: "conta", action: "senha_atual_incorreta", message: "Troca de e-mail recusada: senha atual incorreta", actorId: user.id, request });
    return NextResponse.json({ error: "Senha atual incorreta." }, { status: 400, headers: NO_STORE });
  }
  await verifier.auth.signOut({ scope: "local" }).catch(() => undefined);

  const { error } = await supabase.auth.updateUser({ email: newEmail }, { emailRedirectTo: `${origin}/auth/callback` });
  if (error) {
    if (error.code === "email_exists") {
      return NextResponse.json({ error: "Não foi possível usar esse e-mail. Tente outro." }, { status: 400, headers: NO_STORE });
    }
    if (error.status === 429 || error.code === "over_email_send_rate_limit" || error.code === "over_request_rate_limit") {
      return NextResponse.json({ error: "Aguarde um minuto antes de pedir outro e-mail." }, { status: 429, headers: NO_STORE });
    }
    console.error("Falha ao pedir a troca de e-mail", error);
    return NextResponse.json({ error: "Não foi possível enviar a confirmação agora. Tente novamente." }, { status: 502, headers: NO_STORE });
  }

  logEvent({ category: "conta", action: "email_troca_pedida", message: "Troca de e-mail pedida pelo próprio membro", actorId: user.id, request, details: { de: maskEmail(user.email), para: maskEmail(newEmail) } });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
