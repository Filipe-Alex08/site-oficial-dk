import { NextResponse } from "next/server";
import { graduationOptions, memberKindOptions, rankOptions } from "@/lib/member-access";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function authorize() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("user_admin_roles").select("role").eq("user_id", user.id).in("role", ["principal", "membros"]);
  return data?.length ? user : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorize())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });
  const { id } = await params;
  const body = await request.json();
  const allowedStatuses = ["pendente", "aprovado", "recusado", "suspenso", "desativado"];
  const update: Record<string, string> = {};

  if (body.status !== undefined) {
    if (!allowedStatuses.includes(body.status)) return NextResponse.json({ error: "Situação inválida." }, { status: 400 });
    update.status = body.status;
  }
  if (body.member_kind !== undefined) {
    if (!memberKindOptions.some((item) => item.value === body.member_kind)) return NextResponse.json({ error: "Tipo de membro inválido." }, { status: 400 });
    update.member_kind = body.member_kind;
  }
  if (body.rank !== undefined) {
    if (!rankOptions.some((item) => item.value === body.rank)) return NextResponse.json({ error: "Patente inválida." }, { status: 400 });
    update.rank = body.rank;
  }
  if (body.graduation_level !== undefined) {
    if (!graduationOptions.some((item) => item.value === body.graduation_level)) return NextResponse.json({ error: "Graduação inválida." }, { status: 400 });
    update.graduation_level = body.graduation_level;
  }
  if (body.graduation_order !== undefined) update.graduation_order = String(body.graduation_order).trim();
  if (!Object.keys(update).length) return NextResponse.json({ error: "Nenhuma alteração informada." }, { status: 400 });

  const { error } = await admin.from("profiles").update(update).eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorize())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });
  const { id } = await params;
  const { error } = await admin.auth.admin.deleteUser(id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
}
