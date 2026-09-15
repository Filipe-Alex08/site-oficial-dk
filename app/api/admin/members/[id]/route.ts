import { createClient as createAdminClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function authorize() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("user_admin_roles").select("role").eq("user_id", user.id).in("role", ["principal", "membros"]);
  return data?.length ? user : null;
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  return url && key ? createAdminClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } }) : null;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorize())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const admin = adminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });
  const { id } = await params;
  const { status } = await request.json();
  const allowed = ["pendente", "aprovado", "recusado", "suspenso", "desativado"];
  if (!allowed.includes(status)) return NextResponse.json({ error: "Situação inválida." }, { status: 400 });
  const { error } = await admin.from("profiles").update({ status }).eq("id", id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorize())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const admin = adminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });
  const { id } = await params;
  const { error } = await admin.auth.admin.deleteUser(id);
  return error ? NextResponse.json({ error: error.message }, { status: 400 }) : NextResponse.json({ success: true });
}
