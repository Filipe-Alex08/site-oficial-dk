import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { graduationOptions, rankOptions } from "@/lib/member-access";

async function authorizeDocumentAdmin() {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("user_admin_roles")
    .select("role")
    .eq("user_id", user.id)
    .in("role", ["principal", "membros"])
    .limit(1);
  return Boolean(data?.length);
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorizeDocumentAdmin())) return NextResponse.json({ error: "Acesso permitido ao ADM Principal ou ADM de Membros." }, { status: 403 });
  const body = await request.json();
  const rules = body.access_rules;
  const logic = body.access_logic;
  if (!Array.isArray(rules) || rules.length > 20 || !["and", "or"].includes(logic)) return NextResponse.json({ error: "Regras inválidas." }, { status: 400 });
  for (const [index, rule] of (rules as Array<Record<string, unknown>>).entries()) {
    const rank = rule.kind === "rank" && rankOptions.some((item) => item.value === rule.minimum_rank);
    const graduation = rule.kind === "graduation" && ["cavalaria", "arquearia"].includes(String(rule.track)) && graduationOptions.some((item) => item.value === rule.minimum_graduation && item.value !== "sem_graduacao");
    const validJoin = index === 0 || ["and", "or"].includes(String(rule.join));
    if ((!rank && !graduation) || !validJoin) return NextResponse.json({ error: "Uma regra de acesso contém valores inválidos." }, { status: 400 });
  }
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });
  const { id } = await params;
  const { error } = await admin.from("documents").update({ access_logic: logic, access_rules: rules }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await authorizeDocumentAdmin())) {
    return NextResponse.json({ error: "Acesso permitido ao ADM Principal ou ADM de Membros." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });

  const { id } = await params;
  const { data: document, error: readError } = await admin
    .from("documents")
    .select("file_path")
    .eq("id", id)
    .single();

  if (readError || !document) return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });

  const { error: deleteError } = await admin.from("documents").delete().eq("id", id);
  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 400 });

  await admin.storage.from("dk-documents").remove([document.file_path]);
  return NextResponse.json({ success: true });
}
