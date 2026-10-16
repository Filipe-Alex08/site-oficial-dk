import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function authorize() {
  const client = await createClient();
  if (!client) return false;
  const { data: { user } } = await client.auth.getUser();
  if (!user) return false;
  const [{ data: profile }, { data: roles }] = await Promise.all([
    client.from("profiles").select("status").eq("id", user.id).single(),
    client.from("user_admin_roles").select("role").eq("user_id", user.id).in("role", ["principal", "atividades"]),
  ]);
  return profile?.status === "aprovado" && Boolean(roles?.length);
}

// Read every page so historical totals are not truncated by Supabase's row limit.
async function allRows<T>(page: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const rows: T[] = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await page(from, from + 499);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
    if (!data || data.length < 500) return rows;
  }
}

export async function GET(request: Request) {
  if (!(await authorize())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });
  const memberId = new URL(request.url).searchParams.get("memberId");
  if (memberId && !uuid.test(memberId)) return NextResponse.json({ error: "Membro inválido." }, { status: 400 });
  try {
    if (!memberId) {
      const [members, attendance] = await Promise.all([
        allRows((from, to) => admin.from("profiles").select("id,full_name,nickname,status").order("id").range(from, to)),
        allRows((from, to) => admin.from("activity_attendance").select("user_id,response").order("user_id").order("activity_id").range(from, to)),
      ]);
      const totals = new Map<string, { presences: number; absences: number }>();
      for (const entry of attendance) {
        const count = totals.get(entry.user_id) ?? { presences: 0, absences: 0 };
        if (entry.response === "vai") count.presences++;
        if (entry.response === "nao_vai") count.absences++;
        totals.set(entry.user_id, count);
      }
      return NextResponse.json({ members: members.map((member) => ({ ...member, ...(totals.get(member.id) ?? { presences: 0, absences: 0 }) })) }, { headers: { "Cache-Control": "no-store" } });
    }
    const [activities, attendance] = await Promise.all([
      allRows((from, to) => admin.from("activities").select("id,title,starts_at,status,attendance_open").order("starts_at", { ascending: false }).order("id").range(from, to)),
      allRows((from, to) => admin.from("activity_attendance").select("activity_id,response,guest_count,note").eq("user_id", memberId).order("activity_id").range(from, to)),
    ]);
    return NextResponse.json({ activities, attendance }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar as presenças." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await authorize())) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !uuid.test(body.memberId ?? "") || !uuid.test(body.activityId ?? "") || !["vai", "nao_vai", null].includes(body.response)) {
    return NextResponse.json({ error: "Resposta ou identificação inválida." }, { status: 400 });
  }
  if (body.response !== null && (!Number.isInteger(body.guest_count) || body.guest_count < 0 || body.guest_count > 30 || typeof body.note !== "string" || body.note.length > 180)) {
    return NextResponse.json({ error: "Informe de 0 a 30 convidados e uma observação de até 180 caracteres." }, { status: 400 });
  }
  const [{ data: member }, { data: activity }] = await Promise.all([
    admin.from("profiles").select("id").eq("id", body.memberId).maybeSingle(),
    admin.from("activities").select("id").eq("id", body.activityId).maybeSingle(),
  ]);
  if (!member || !activity) return NextResponse.json({ error: "Membro ou atividade não encontrado." }, { status: 404 });
  const { error } = body.response === null
    ? await admin.from("activity_attendance").delete().eq("user_id", body.memberId).eq("activity_id", body.activityId)
    : await admin.from("activity_attendance").upsert({ user_id: body.memberId, activity_id: body.activityId, response: body.response, guest_count: body.response === "vai" ? body.guest_count : 0, note: body.note.trim() || null }, { onConflict: "activity_id,user_id" });
  if (error) return NextResponse.json({ error: "Não foi possível salvar a correção." }, { status: 500 });
  return NextResponse.json({ success: true });
}
