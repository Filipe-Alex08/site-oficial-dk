import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { forbidden, isSameOriginRequest, notConfigured } from "@/lib/api-guard";
import { logEvent } from "@/lib/app-log";
import { isRank, loadNotesSettings, notesScopeOptions, notesWritersOptions, type NotesSettings } from "@/lib/member-notes";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const NO_STORE = { "Cache-Control": "no-store" };

// Chave de site_settings, campo da API e validação de cada configuração das anotações.
const fields = [
  { key: "notes_enabled", name: "enabled", valid: (value: unknown) => typeof value === "boolean" },
  { key: "notes_writers", name: "writers", valid: (value: unknown) => notesWritersOptions.some((option) => option.value === value) },
  { key: "notes_commander_scope", name: "commanderScope", valid: (value: unknown) => notesScopeOptions.some((option) => option.value === value) },
  { key: "notes_min_rank", name: "minRank", valid: isRank },
] as const satisfies ReadonlyArray<{ key: string; name: keyof NotesSettings; valid: (value: unknown) => boolean }>;

// Configurações do site. Só o ADM Principal lê e altera.
export async function GET() {
  if (!(await requireAdmin(["principal"]))) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return notConfigured();

  return NextResponse.json({ notes: await loadNotesSettings(admin) }, { headers: NO_STORE });
}

// Corpo: { notes: { enabled?, writers?, commanderScope?, minRank? } }. Só o que vier é alterado.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();
  const session = await requireAdmin(["principal"]);
  if (!session) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return notConfigured();

  const body = await request.json().catch(() => null);
  const notes = body && typeof body === "object" ? (body as { notes?: unknown }).notes : null;
  if (!notes || typeof notes !== "object") return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const input = notes as Record<string, unknown>;

  const sent = fields.filter((field) => field.name in input);
  if (sent.length === 0 || sent.some((field) => !field.valid(input[field.name]))) {
    return NextResponse.json({ error: "Configuração inválida." }, { status: 400 });
  }

  const previous = await loadNotesSettings(admin);
  const now = new Date().toISOString();
  const { error } = await admin
    .from("site_settings")
    .upsert(sent.map((field) => ({ key: field.key, value: input[field.name], updated_by: session.user.id, updated_at: now })), { onConflict: "key" });
  if (error) {
    console.error("Falha ao salvar as configurações de anotações", error.code);
    // PGRST205 (cache do PostgREST) e 42P01 (Postgres): a tabela não existe porque a migração 025 não foi aplicada.
    const missingTable = error.code === "PGRST205" || error.code === "42P01";
    return NextResponse.json(
      { error: missingTable ? "A tabela de configurações não existe no banco. Aplique as migrações 025 e 026 no SQL Editor do Supabase." : "Não foi possível salvar a configuração." },
      { status: 500 },
    );
  }

  const changes = Object.fromEntries(sent.map((field) => [field.name, { de: previous[field.name], para: input[field.name] }]));
  logEvent({
    level: "aviso",
    category: "configuracao",
    action: "anotacoes_configuracao",
    message: "Configurações das anotações alteradas",
    actorId: session.user.id,
    request,
    details: changes,
  });
  return NextResponse.json({ notes: await loadNotesSettings(admin) }, { headers: NO_STORE });
}
