import { NextResponse } from "next/server";
import { logAdminAudit } from "@/lib/admin-audit";
import { requireAdmin } from "@/lib/admin-auth";
import { graduationOptions, rankOptions } from "@/lib/member-access";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requireAdmin(["principal", "membros"]);
  if (!caller) return NextResponse.json({ error: "Acesso permitido ao ADM Principal ou ADM de Membros." }, { status: 403 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const rules = (body as Record<string, unknown>).access_rules;
  const logic = (body as Record<string, unknown>).access_logic;
  if (!Array.isArray(rules) || rules.length > 20 || !["and", "or"].includes(String(logic))) {
    return NextResponse.json({ error: "Regras inválidas." }, { status: 400 });
  }
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
  if (error) {
    console.error("Falha ao atualizar regras de documento", error);
    return NextResponse.json({ error: "Não foi possível atualizar o documento." }, { status: 400 });
  }

  await logAdminAudit(caller.user.id, "documents", id, "update_access", {
    access_logic: logic,
    access_rules: rules,
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const caller = await requireAdmin(["principal", "membros"]);
  if (!caller) {
    return NextResponse.json({ error: "Acesso permitido ao ADM Principal ou ADM de Membros." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });

  const { id } = await params;
  const { data: document, error: readError } = await admin
    .from("documents")
    .select("file_path, file_name, title")
    .eq("id", id)
    .single();

  if (readError || !document) return NextResponse.json({ error: "Documento não encontrado." }, { status: 404 });

  const { error: deleteError } = await admin.from("documents").delete().eq("id", id);
  if (deleteError) {
    console.error("Falha ao excluir documento", deleteError);
    return NextResponse.json({ error: "Não foi possível excluir o documento." }, { status: 400 });
  }

  await admin.storage.from("dk-documents").remove([document.file_path]);
  await logAdminAudit(caller.user.id, "documents", id, "delete", {
    title: document.title,
    file_name: document.file_name,
    file_path: document.file_path,
  });

  return NextResponse.json({ success: true });
}