import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logEvent } from "@/lib/app-log";
import { createAdminClient } from "@/lib/supabase/admin";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NO_STORE = { "Cache-Control": "no-store" };

// Só o ADM Principal enxerga e concede a permissão "Ver logs".
export async function GET() {
  if (!(await requireAdmin(["principal"]))) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });

  const { data, error } = await admin.from("log_viewer_permissions").select("user_id");
  if (error) {
    console.error("Falha ao listar permissões de logs", error);
    return NextResponse.json({ error: "Não foi possível carregar as permissões." }, { status: 500 });
  }
  return NextResponse.json({ userIds: (data ?? []).map((row) => row.user_id) }, { headers: NO_STORE });
}

export async function POST(request: Request) {
  const session = await requireAdmin(["principal"]);
  if (!session) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || typeof body.userId !== "string" || !uuid.test(body.userId) || typeof body.granted !== "boolean") {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { data: target } = await admin.from("profiles").select("id").eq("id", body.userId).maybeSingle();
  if (!target) return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });

  const { error } = body.granted
    ? await admin.from("log_viewer_permissions").upsert({ user_id: body.userId, granted_by: session.user.id }, { onConflict: "user_id" })
    : await admin.from("log_viewer_permissions").delete().eq("user_id", body.userId);
  if (error) {
    console.error("Falha ao salvar a permissão de logs", error);
    return NextResponse.json({ error: "Não foi possível salvar a permissão." }, { status: 500 });
  }

  logEvent({
    level: "aviso",
    category: "permissao",
    action: body.granted ? "logs_concedido" : "logs_revogado",
    message: body.granted ? 'Permissão "Ver logs" concedida' : 'Permissão "Ver logs" revogada',
    actorId: session.user.id,
    request,
    details: { membro: body.userId },
  });
  return NextResponse.json({ success: true });
}
