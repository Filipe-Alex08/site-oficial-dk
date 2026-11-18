import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest, notConfigured } from "@/lib/api-guard";
import { logEvent } from "@/lib/app-log";
import { maskEmail } from "@/lib/log-sanitize";
import { createClient } from "@/lib/supabase/server";

// Entrada por e-mail e senha. Fica no servidor para que a sessão nasça dentro
// de um cookie HttpOnly, em vez de passar pelo JavaScript da página.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  if (!supabase) return notConfigured();

  let email = "";
  let password = "";
  try {
    const body = await request.json();
    if (typeof body?.email === "string") email = body.email.trim();
    if (typeof body?.password === "string") password = body.password;
  } catch {
    // Corpo ausente ou inválido: cai na validação abaixo.
  }
  if (!email || !password) {
    return NextResponse.json({ error: "Informe e-mail e senha." }, { status: 400 });
  }

  const maskedEmail = maskEmail(email);
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    if (error?.status === 429) {
      logEvent({ level: "aviso", category: "auth", action: "login_bloqueado", message: "Login bloqueado por excesso de tentativas", request, details: { email: maskedEmail } });
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde alguns minutos e tente de novo." },
        { status: 429 },
      );
    }
    logEvent({ level: "aviso", category: "auth", action: "login_falhou", message: "Login com e-mail ou senha inválidos", request, details: { email: maskedEmail } });
    // Mensagem única para não revelar se o e-mail existe.
    return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .single();

  if (!profile || profile.status !== "aprovado") {
    await supabase.auth.signOut();
    logEvent({ level: "aviso", category: "auth", action: "login_sem_acesso", message: "Login recusado: cadastro não aprovado", actorId: data.user.id, request, details: { status: profile?.status ?? null } });
    const text = profile?.status === "pendente"
      ? "Seu cadastro ainda está aguardando aprovação."
      : "Seu acesso ainda não está liberado.";
    return NextResponse.json({ error: text }, { status: 403 });
  }

  logEvent({ category: "auth", action: "login", message: "Login realizado", actorId: data.user.id, request });
  return NextResponse.json({ ok: true }, { headers: { "cache-control": "no-store" } });
}
