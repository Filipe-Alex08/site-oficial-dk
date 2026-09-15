import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getZodiacSign } from "@/lib/zodiac";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !secretKey) {
    return NextResponse.json({ error: "O banco de dados ainda não foi configurado." }, { status: 503 });
  }

  try {
    const body = await request.json();
    const required = ["invite_code", "email", "password", "full_name", "nickname", "birth_date"];
    if (required.some((field) => !String(body[field] || "").trim())) {
      return NextResponse.json({ error: "Preencha todos os campos obrigatórios." }, { status: 400 });
    }
    if (String(body.password).length < 8) {
      return NextResponse.json({ error: "A senha precisa ter pelo menos 8 caracteres." }, { status: 400 });
    }

    const admin = createClient(url, secretKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const code = String(body.invite_code).trim().toUpperCase();
    const { data: invite } = await admin.from("invites").select("*").eq("code", code).eq("active", true).maybeSingle();

    const expired = invite?.expires_at && new Date(invite.expires_at) < new Date();
    const exhausted = invite && invite.current_uses >= invite.max_uses;
    if (!invite || expired || exhausted) {
      return NextResponse.json({ error: "Convite inválido, expirado ou já utilizado." }, { status: 403 });
    }

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: String(body.email).trim().toLowerCase(),
      password: String(body.password),
      email_confirm: true,
    });
    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || "Não foi possível criar a conta." }, { status: 400 });
    }

    const profile = {
      id: authData.user.id,
      email: String(body.email).trim().toLowerCase(),
      full_name: String(body.full_name).trim(),
      nickname: String(body.nickname).trim(),
      rank: String(body.rank || "").trim() || null,
      graduation_order: String(body.graduation_order || "").trim() || null,
      house: String(body.house || "").trim() || null,
      shirt_number: body.shirt_number ? Number(body.shirt_number) : null,
      primary_build: String(body.primary_build || "").trim() || null,
      secondary_build: String(body.secondary_build || "").trim() || null,
      birth_date: body.birth_date,
      zodiac_sign: getZodiacSign(body.birth_date),
      status: "pendente",
      invited_by: invite.created_by,
    };

    const { error: profileError } = await admin.from("profiles").insert(profile);
    if (profileError) {
      await admin.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: "Não foi possível registrar o perfil." }, { status: 400 });
    }

    const nextUses = invite.current_uses + 1;
    await admin.from("invites").update({
      current_uses: nextUses,
      active: nextUses < invite.max_uses,
      used_by: authData.user.id,
      used_at: new Date().toISOString(),
    }).eq("id", invite.id);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Dados de cadastro inválidos." }, { status: 400 });
  }
}
