import { NextResponse } from "next/server";
import { graduationOptions, rankOptions } from "@/lib/member-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { getZodiacSign } from "@/lib/zodiac";

export async function POST(request: Request) {
  const admin = createAdminClient();

  if (!admin) {
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
