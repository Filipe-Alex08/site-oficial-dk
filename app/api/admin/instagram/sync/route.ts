import { NextResponse } from "next/server";
import { syncInstagram } from "@/lib/instagram-sync";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 800;

function isDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

async function runSync(start?: string, end?: string) {
  try {
    return NextResponse.json(await syncInstagram(start, end));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Falha ao sincronizar mídias." }, { status: 502 });
  }
}

async function isMediaAdmin() {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("user_admin_roles").select("role")
    .eq("user_id", user.id).in("role", ["principal", "midias"]);
  return Boolean(data?.length);
}

export async function POST(request: Request) {
  if (!await isMediaAdmin()) return NextResponse.json({ error: "Acesso permitido somente ao ADM Principal ou ADM de Mídias." }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Informe a data inicial e final para importar." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || !("start" in body) || !("end" in body)
    || !isDateOnly(body.start) || !isDateOnly(body.end) || body.start > body.end) {
    return NextResponse.json({ error: "O intervalo de datas informado é inválido." }, { status: 400 });
  }
  return runSync(body.start, body.end);
}

// Permite configurar um agendador externo com Authorization: Bearer <CRON_SECRET>.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return runSync();
}
