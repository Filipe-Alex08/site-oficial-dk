import { NextResponse } from "next/server";
import { requireLogViewer } from "@/lib/log-access";
import { createAdminClient } from "@/lib/supabase/admin";

const PAGE_SIZE = 50;
const NO_STORE = { "Cache-Control": "no-store" };
const PERIODS: Record<string, number> = { "24h": 1, "3d": 3, "7d": 7 };
const LEVELS = ["info", "aviso", "erro"];
const SOURCES = ["evento", "servidor", "auditoria"];

type FeedRow = {
  uid: string;
  occurred_at: string;
  level: string;
  source: string;
  category: string;
  action: string | null;
  message: string;
  actor_id: string | null;
  ip: string | null;
  path: string | null;
  details: unknown;
};

// Termo de busca vai dentro de um filtro .or(): tira o que tem significado ali.
function safeSearch(value: string) {
  return value.replace(/[^\p{L}\p{N} _.@#/-]/gu, " ").trim().slice(0, 80);
}

export async function GET(request: Request) {
  if (!(await requireLogViewer())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });

  const params = new URL(request.url).searchParams;
  const days = PERIODS[params.get("periodo") ?? "7d"] ?? 7;
  const level = params.get("nivel") ?? "";
  const source = params.get("origem") ?? "";
  const category = (params.get("categoria") ?? "").trim().slice(0, 60);
  const search = safeSearch(params.get("busca") ?? "");
  const page = Math.max(0, Math.min(Number.parseInt(params.get("pagina") ?? "0", 10) || 0, 1000));

  if (level && !LEVELS.includes(level)) return NextResponse.json({ error: "Nível inválido." }, { status: 400 });
  if (source && !SOURCES.includes(source)) return NextResponse.json({ error: "Origem inválida." }, { status: 400 });

  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  let query = admin
    .from("log_feed")
    .select("*")
    .gte("occurred_at", since)
    .order("occurred_at", { ascending: false })
    .order("uid", { ascending: false })
    // Pede uma linha a mais para saber se existe próxima página.
    .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  if (level) query = query.eq("level", level);
  if (source) query = query.eq("source", source);
  if (category) query = query.eq("category", category);
  if (search) query = query.or(`message.ilike.%${search}%,action.ilike.%${search}%,path.ilike.%${search}%`);

  const { data, error } = await query;
  if (error) {
    console.error("Falha ao carregar os logs", error);
    return NextResponse.json({ error: "Não foi possível carregar os logs." }, { status: 500 });
  }

  const rows = (data ?? []) as FeedRow[];
  const hasMore = rows.length > PAGE_SIZE;
  const items = rows.slice(0, PAGE_SIZE);

  const actorIds = [...new Set(items.map((row) => row.actor_id).filter((id): id is string => Boolean(id)))];
  const actors = new Map<string, string>();
  if (actorIds.length) {
    const { data: profiles } = await admin.from("profiles").select("id,nickname,full_name").in("id", actorIds);
    for (const profile of profiles ?? []) actors.set(profile.id, profile.nickname || profile.full_name);
  }

  return NextResponse.json({
    items: items.map((row) => ({ ...row, actor_name: row.actor_id ? actors.get(row.actor_id) ?? null : null })),
    hasMore,
  }, { headers: NO_STORE });
}
