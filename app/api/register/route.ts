import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest } from "@/lib/api-guard";
import { logEvent } from "@/lib/app-log";
import { getClientIp } from "@/lib/client-ip";
import { maskEmail } from "@/lib/log-sanitize";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHash } from "node:crypto";

async function readRegistrationBody(request: Request) {
  const maxBytes = 16 * 1024;
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > maxBytes) throw new Error("payload_too_large");

  const reader = request.body?.getReader();
  if (!reader) throw new Error("missing_body");
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    totalBytes += value.byteLength;
    if (totalBytes > maxBytes) {
      await reader.cancel();
      throw new Error("payload_too_large");
    }
    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return JSON.parse(new TextDecoder().decode(bytes));
}

export async function POST(request: Request) {
  // Mesma defesa das outras rotas de autenticação: um site de terceiro não pode
  // disparar cadastros (nem gastar o limite de tentativas) em nome do visitante.
  if (!isSameOriginRequest(request)) return forbidden();

  const admin = createAdminClient();

  if (!admin) {
    return NextResponse.json({ error: "O banco de dados ainda não foi configurado." }, { status: 503 });
  }

  // Conta do Auth criada nesta requisição e ainda sem cadastro completo. Se algo
  // lançar exceção no meio, ela seria deixada sem perfil e o e-mail ficaria preso.
  let pendingUserId: string | null = null;

  try {
    const clientIp = getClientIp(request);
    const rateLimitSalt = process.env.SUPABASE_SECRET_KEY || process.env.CRON_SECRET;
    if (!rateLimitSalt) {
      return NextResponse.json({ error: "Cadastro temporariamente indisponível." }, { status: 503 });
    }
    const keyHash = createHash("sha256").update(`${rateLimitSalt}:${clientIp}`).digest("hex");
    const { data: allowed, error: rateLimitError } = await admin.rpc("check_registration_rate_limit", {
      requested_key_hash: keyHash,
      max_attempts: 5,
      window_seconds: 900,
    });
    if (rateLimitError) {
      console.error("Falha ao validar limite de cadastro", rateLimitError);
      return NextResponse.json({ error: "Cadastro temporariamente indisponível." }, { status: 503 });
    }
    if (!allowed) {
      logEvent({ level: "aviso", category: "cadastro", action: "cadastro_bloqueado", message: "Cadastro bloqueado pelo limitador de tentativas", request });
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
    }

    const body = await readRegistrationBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Dados de cadastro inválidos." }, { status: 400 });
    }
    const required = ["invite_code", "email", "password", "full_name", "nickname"];
    if (required.some((field) => !String(body[field] || "").trim())) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }
    const fields = [body.invite_code, body.email, body.password, body.full_name, body.nickname];
    if (fields.some((value) => typeof value !== "string") || String(body.password).length < 8 || String(body.password).length > 128) {
      return NextResponse.json({ error: "Verifique os campos e use uma senha entre 8 e 128 caracteres." }, { status: 400 });
    }
    if (String(body.email).length > 254 || String(body.full_name).length > 120 || String(body.nickname).length > 60 || String(body.invite_code).length > 80) {
      return NextResponse.json({ error: "Um ou mais campos excedem o tamanho permitido." }, { status: 400 });
    }

    const code = String(body.invite_code).trim().toUpperCase();
    const { data: invite, error: inviteError } = await admin.from("invites").select("*").eq("code", code).eq("active", true).maybeSingle();
    if (inviteError) console.error("Falha ao buscar convite", inviteError);

    if (!invite || (invite.expires_at && new Date(invite.expires_at) < new Date()) || invite.current_uses >= invite.max_uses) {
      logEvent({ level: "aviso", category: "cadastro", action: "convite_invalido", message: "Cadastro recusado: convite inválido, expirado ou esgotado", request, details: { email: maskEmail(String(body.email)) } });
      return NextResponse.json({ error: "Convite inválido, expirado ou já utilizado." }, { status: 403 });
    }

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: String(body.email).trim().toLowerCase(),
      password: String(body.password),
      email_confirm: true,
    });
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Não foi possível criar a conta. Verifique os dados e tente novamente." }, { status: 400 });
    }

    // O perfil precisa existir antes de o convite ser consumido: invites.used_by
    // tem chave estrangeira para profiles(id). Consumir primeiro falhava sempre.
    pendingUserId = authData.user.id;
    const profile = {
      id: authData.user.id,
      email: String(body.email).trim().toLowerCase(),
      full_name: String(body.full_name).trim(),
      nickname: String(body.nickname).trim(),
      member_kind: "membro",
      rank: "recruta",
      graduation_level: "sem_graduacao",
      status: "pendente",
      invited_by: invite.created_by ?? null,
    };

    // Apagar o usuário do Auth remove o perfil junto (on delete cascade).
    const { error: profileError } = await admin.from("profiles").insert(profile);
    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      if (profileError.code === "23505") {
        return NextResponse.json({ error: "Esse apelido já está em uso. Escolha outro." }, { status: 409 });
      }
      console.error("Falha ao registrar o perfil", profileError);
      return NextResponse.json({ error: "Não foi possível registrar o perfil." }, { status: 400 });
    }

    // A função trava a linha do convite, então dois cadastros simultâneos não
    // usam o mesmo convite; quem perder a corrida desfaz a própria conta.
    const { data: consumedInvite, error: consumeError } = await admin.rpc("consume_registration_invite", {
      requested_invite_id: invite.id,
      new_user_id: authData.user.id,
    });
    const consumed = Array.isArray(consumedInvite) ? consumedInvite[0] : consumedInvite;
    if (consumeError || !consumed) {
      await admin.auth.admin.deleteUser(authData.user.id);
      if (consumeError) console.error("Falha ao consumir convite", consumeError);
      logEvent({ level: "aviso", category: "cadastro", action: "convite_perdido", message: "Cadastro desfeito: convite consumido por outro cadastro", request });
      return NextResponse.json({ error: "Convite inválido, expirado ou já utilizado." }, { status: 403 });
    }

    pendingUserId = null;
    logEvent({ category: "cadastro", action: "cadastro", message: "Novo cadastro aguardando aprovação", actorId: authData.user.id, request, details: { email: maskEmail(String(body.email)), apelido: String(body.nickname).trim() } });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (pendingUserId) {
      const { error: cleanupError } = await admin.auth.admin.deleteUser(pendingUserId).catch((e: unknown) => ({ error: e }));
      if (cleanupError) console.error("Falha ao desfazer conta incompleta", cleanupError);
    }
    if (error instanceof Error && error.message === "payload_too_large") {
      return NextResponse.json({ error: "Os dados enviados excedem o tamanho permitido." }, { status: 413 });
    }
    return NextResponse.json({ error: "Dados de cadastro inválidos." }, { status: 400 });
  }
}
