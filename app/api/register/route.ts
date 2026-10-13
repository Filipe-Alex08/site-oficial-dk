import { NextResponse } from "next/server";
import { graduationOptions, rankOptions } from "@/lib/member-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { getZodiacSign } from "@/lib/zodiac";
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
  const admin = createAdminClient();

  if (!admin) {
    return NextResponse.json({ error: "O banco de dados ainda não foi configurado." }, { status: 503 });
  }

  try {
    const forwardedFor = request.headers.get("x-forwarded-for");
    const clientIp = request.headers.get("x-real-ip") || forwardedFor?.split(",")[0]?.trim() || "unknown";
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
      return NextResponse.json({ error: "Muitas tentativas. Tente novamente mais tarde." }, { status: 429 });
    }

    const body = await readRegistrationBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Dados de cadastro inválidos." }, { status: 400 });
    }
    const required = ["invite_code", "email", "password", "full_name", "nickname", "birth_date"];
    if (required.some((field) => !String(body[field] || "").trim())) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }
    const fields = [body.invite_code, body.email, body.password, body.full_name, body.nickname, body.birth_date];
    if (fields.some((value) => typeof value !== "string") || String(body.password).length < 8 || String(body.password).length > 128) {
      return NextResponse.json({ error: "Verifique os campos e use uma senha entre 8 e 128 caracteres." }, { status: 400 });
    }
    if (String(body.email).length > 254 || String(body.full_name).length > 120 || String(body.nickname).length > 60 || String(body.invite_code).length > 80) {
      return NextResponse.json({ error: "Um ou mais campos excedem o tamanho permitido." }, { status: 400 });
    }

    const code = String(body.invite_code).trim().toUpperCase();
    const { data: invite } = await admin.from("invites").select("*").eq("code", code).eq("active", true).maybeSingle();

    if (!invite || (invite.expires_at && new Date(invite.expires_at) < new Date()) || invite.current_uses >= invite.max_uses) {
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

    const { data: consumedInvite, error: consumeError } = await admin.rpc("consume_registration_invite", {
      requested_invite_id: invite.id,
      new_user_id: authData.user.id,
    });
    const consumed = Array.isArray(consumedInvite) ? consumedInvite[0] : consumedInvite;
    if (consumeError || !consumed) {
      await admin.auth.admin.deleteUser(authData.user.id);
      if (consumeError) console.error("Falha ao consumir convite", consumeError);
      return NextResponse.json({ error: "Convite inválido, expirado ou já utilizado." }, { status: 403 });
    }

    const requestedRank = String(body.rank || "recruta");
    const requestedGraduation = String(body.graduation_level || "sem_graduacao");
    const rank = rankOptions.some((item) => item.value === requestedRank) ? requestedRank : "recruta";
    const graduationLevel = graduationOptions.some((item) => item.value === requestedGraduation)
      ? requestedGraduation
      : "sem_graduacao";

    const profile = {
      id: authData.user.id,
      email: String(body.email).trim().toLowerCase(),
      full_name: String(body.full_name).trim(),
      nickname: String(body.nickname).trim(),
      member_kind: "membro",
      rank,
      graduation_level: graduationLevel,
      graduation_order: String(body.graduation_order || "").trim() || null,
      house: String(body.house || "").trim() || null,
      shirt_number: body.shirt_number ? Number(body.shirt_number) : null,
      primary_build: String(body.primary_build || "").trim() || null,
      secondary_build: String(body.secondary_build || "").trim() || null,
      birth_date: body.birth_date,
      zodiac_sign: getZodiacSign(body.birth_date),
      status: "pendente",
      invited_by: consumed.invited_by,
    };

    const { error: profileError } = await admin.from("profiles").insert(profile);
    if (profileError) {
      await admin.rpc("release_registration_invite", {
        requested_invite_id: invite.id,
        failed_user_id: authData.user.id,
      });
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Não foi possível registrar o perfil." }, { status: 400 });
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "payload_too_large") {
      return NextResponse.json({ error: "Os dados enviados excedem o tamanho permitido." }, { status: 413 });
    }
    return NextResponse.json({ error: "Dados de cadastro inválidos." }, { status: 400 });
  }
}
