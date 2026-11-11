import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAudit } from "@/lib/admin-audit";
import { forbidden, isSameOriginRequest } from "@/lib/api-guard";
import { createAdminClient } from "@/lib/supabase/admin";

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
  if (!(await requireAdmin(["principal", "atividades"]))) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });
  const memberId = new URL(request.url).searchParams.get("memberId");
  if (memberId && !uuid.test(memberId)) return NextResponse.json({ error: "Membro inválido." }, { status: 400 });
  try {
    if (!memberId) {
      const [members, attendance, presence] = await Promise.all([
        allRows((from, to) => admin.from("profiles").select("id,full_name,nickname,status").order("id").range(from, to)),
        allRows((from, to) => admin.from("activity_attendance").select("user_id,response").order("user_id").order("activity_id").range(from, to)),
        allRows((from, to) => admin.from("activity_presence_validations").select("user_id,actual_status").order("user_id").order("activity_id").range(from, to)),
      ]);
      const intentions = new Map<string, { intends_to_go: number; intends_not_to_go: number }>();
      for (const entry of attendance) {
        const count = intentions.get(entry.user_id) ?? { intends_to_go: 0, intends_not_to_go: 0 };
        if (entry.response === "vai") count.intends_to_go++;
        if (entry.response === "nao_vai") count.intends_not_to_go++;
        intentions.set(entry.user_id, count);
      }
      const validated = new Map<string, { presences: number; absences: number; justified: number }>();
      for (const entry of presence) {
        const count = validated.get(entry.user_id) ?? { presences: 0, absences: 0, justified: 0 };
        if (entry.actual_status === "presente") count.presences++;
        if (entry.actual_status === "ausente") count.absences++;
        if (entry.actual_status === "justificado") count.justified++;
        validated.set(entry.user_id, count);
      }
      return NextResponse.json({ members: members.map((member) => ({
        ...member,
        ...(intentions.get(member.id) ?? { intends_to_go: 0, intends_not_to_go: 0 }),
        ...(validated.get(member.id) ?? { presences: 0, absences: 0, justified: 0 }),
      })) }, { headers: { "Cache-Control": "no-store" } });
    }
    const [activities, attendance, presence] = await Promise.all([
      allRows((from, to) => admin.from("activities").select("id,title,starts_at,status,attendance_open").order("starts_at", { ascending: false }).order("id").range(from, to)),
      allRows((from, to) => admin.from("activity_attendance").select("activity_id,response,guest_count,note").eq("user_id", memberId).order("activity_id").range(from, to)),
      allRows((from, to) => admin.from("activity_presence_validations").select("activity_id,actual_status,guest_count,note,validated_by,validated_at,updated_at").eq("user_id", memberId).order("activity_id").range(from, to)),
    ]);
    return NextResponse.json({ activities, attendance, presence }, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json({ error: "Não foi possível carregar as presenças." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();
  const session = await requireAdmin(["principal", "atividades"]);
  if (!session) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || !uuid.test(body.memberId ?? "") || !uuid.test(body.activityId ?? "") || !["vai", "nao_vai", null].includes(body.response) || !["presente", "ausente", "justificado", null].includes(body.actual_status)) {
    return NextResponse.json({ error: "Resposta ou identificação inválida." }, { status: 400 });
  }
  if (typeof body.note !== "string" || body.note.length > 180 || typeof body.validation_note !== "string" || body.validation_note.length > 180) {
    return NextResponse.json({ error: "As observações devem ter no máximo 180 caracteres." }, { status: 400 });
  }
  if (body.response !== null && (!Number.isInteger(body.guest_count) || body.guest_count < 0 || body.guest_count > 30)) {
    return NextResponse.json({ error: "Informe de 0 a 30 convidados e uma observação de até 180 caracteres." }, { status: 400 });
  }
  if (body.actual_status !== null && (!Number.isInteger(body.actual_guest_count) || body.actual_guest_count < 0 || body.actual_guest_count > 30)) {
    return NextResponse.json({ error: "Informe a presença real, de 0 a 30 convidados e uma observação de até 180 caracteres." }, { status: 400 });
  }
  const [{ data: member }, { data: activity }] = await Promise.all([
    admin.from("profiles").select("id").eq("id", body.memberId).maybeSingle(),
    admin.from("activities").select("id").eq("id", body.activityId).maybeSingle(),
  ]);
  if (!member || !activity) return NextResponse.json({ error: "Membro ou atividade não encontrado." }, { status: 404 });
  const { error } = await admin.rpc("admin_save_activity_record", {
    requested_member_id: body.memberId,
    requested_activity_id: body.activityId,
    planned_response: body.response,
    planned_guest_count: body.response === "vai" ? body.guest_count : 0,
    planned_note: body.note.trim(),
    presence_status: body.actual_status,
    presence_guest_count: body.actual_status === "presente" ? body.actual_guest_count : 0,
    presence_note: body.validation_note.trim(),
    validator_id: session.user.id,
  });
  if (error) return NextResponse.json({ error: "Não foi possível salvar a correção." }, { status: 500 });
  await logAdminAudit(session.user.id, "activity_presence_validations", `${body.activityId}:${body.memberId}`, "validate_attendance", {
    planned_response: body.response,
    actual_status: body.actual_status,
    actual_guest_count: body.actual_status === "presente" ? body.actual_guest_count : 0,
  });
  return NextResponse.json({ success: true });
}
