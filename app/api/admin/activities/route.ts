import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { logAdminAudit } from "@/lib/admin-audit";
import { forbidden, isSameOriginRequest } from "@/lib/api-guard";
import { deleteActivityFromGoogle, syncActivityToGoogle } from "@/lib/google-calendar";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Activity, ActivityNoticeLevel, ActivityStatus } from "@/lib/types";

const activityStatuses = new Set<ActivityStatus>(["confirmado", "a_definir", "adiado", "cancelado", "finalizado"]);
const noticeLevels = new Set<ActivityNoticeLevel>(["informativo", "atencao", "urgente"]);
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type ActivityInput = {
  id?: string;
  title?: unknown;
  starts_at?: unknown;
  ends_at?: unknown;
  location?: unknown;
  type?: unknown;
  status?: unknown;
  description?: unknown;
  attendance_open?: unknown;
  notice_level?: unknown;
  notice_message?: unknown;
  notice_expires_at?: unknown;
};

function textField(value: unknown, maximum: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= maximum ? text : null;
}

function optionalText(value: unknown, maximum: number) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") return undefined;
  const text = value.trim();
  return text.length <= maximum ? text || null : undefined;
}

function validDate(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function parseActivity(body: ActivityInput, previous?: Activity) {
  const title = textField(body.title, 160);
  const startsAt = validDate(body.starts_at);
  const endsAt = body.ends_at ? validDate(body.ends_at) : null;
  const location = textField(body.location, 240);
  const type = textField(body.type, 80);
  const description = optionalText(body.description, 3000);
  const status = typeof body.status === "string" && activityStatuses.has(body.status as ActivityStatus)
    ? body.status as ActivityStatus
    : null;
  const noticeMessage = optionalText(body.notice_message, 500);
  const noticeLevel = noticeMessage
    ? typeof body.notice_level === "string" && noticeLevels.has(body.notice_level as ActivityNoticeLevel)
      ? body.notice_level as ActivityNoticeLevel
      : null
    : null;
  const noticeExpiresAt = noticeMessage ? validDate(body.notice_expires_at) : null;

  if (!title || !startsAt || !location || !type || !status || description === undefined || noticeMessage === undefined) {
    return { error: "Preencha os dados obrigatórios da atividade com valores válidos." } as const;
  }
  if (endsAt && endsAt <= startsAt) return { error: "O término precisa ser posterior ao início." } as const;
  if ((status === "cancelado" || status === "adiado") && !noticeMessage) {
    return { error: "Informe o aviso público ao cancelar ou adiar uma atividade." } as const;
  }
  if (noticeMessage && (!noticeLevel || !noticeExpiresAt || noticeExpiresAt <= new Date())) {
    return { error: "Todo aviso precisa de nível e validade futura." } as const;
  }
  if (typeof body.attendance_open !== "boolean") return { error: "Defina se a confirmação de presença está aberta." } as const;

  const previousNoticeExpiry = previous?.notice_expires_at
    ? new Date(previous.notice_expires_at).getTime()
    : null;
  const noticeChanged = noticeMessage !== (previous?.notice_message ?? null)
    || noticeLevel !== (previous?.notice_level ?? null)
    || (noticeExpiresAt?.getTime() ?? null) !== previousNoticeExpiry;
  const noticePublishedAt = noticeMessage
    ? noticeChanged ? new Date().toISOString() : previous?.notice_published_at ?? new Date().toISOString()
    : null;

  return { value: {
    title,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt?.toISOString() ?? null,
    location,
    type,
    status,
    description,
    attendance_open: status === "cancelado" || status === "finalizado" ? false : body.attendance_open,
    notice_level: noticeLevel,
    notice_message: noticeMessage,
    notice_published_at: noticePublishedAt,
    notice_expires_at: noticeExpiresAt?.toISOString() ?? null,
  } } as const;
}

async function context() {
  const session = await requireAdmin(["atividades"]);
  const admin = createAdminClient();
  return session && admin ? { session, admin } : null;
}

export async function GET() {
  const access = await context();
  if (!access) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const { data: activities, error } = await access.admin.from("activities").select("*").order("starts_at");
  if (error) return NextResponse.json({ error: "Não foi possível carregar o calendário." }, { status: 500 });

  const ids = (activities ?? []).map((activity) => activity.id);
  const syncByActivity = new Map<string, Record<string, unknown>>();
  if (ids.length) {
    const { data: rows, error: syncError } = await access.admin.from("activity_calendar_sync")
      .select("activity_id,sync_status,sync_error,google_event_html_link,last_synced_at")
      .in("activity_id", ids);
    if (syncError) return NextResponse.json({ error: "A integração do calendário ainda não foi ativada no banco." }, { status: 503 });
    for (const row of rows ?? []) syncByActivity.set(row.activity_id, row);
  }
  return NextResponse.json({ activities: (activities ?? []).map((activity) => {
    const sync = syncByActivity.get(activity.id);
    return {
      ...activity,
      google_sync_status: sync?.sync_status ?? "disabled",
      google_sync_error: sync?.sync_error ?? null,
      google_event_html_link: sync?.google_event_html_link ?? null,
      google_last_synced_at: sync?.last_synced_at ?? null,
    };
  }) }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();
  const access = await context();
  if (!access) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const body = await request.json().catch(() => null) as ActivityInput | null;
  if (!body) return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  const parsed = parseActivity(body);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { data, error } = await access.admin.from("activities")
    .insert({ ...parsed.value, created_by: access.session.user.id })
    .select("*")
    .single();
  if (error || !data) return NextResponse.json({ error: "Não foi possível criar a atividade." }, { status: 500 });

  const googleSync = await syncActivityToGoogle(data as Activity);
  await logAdminAudit(access.session.user.id, "activities", data.id, "create", { status: data.status, google_sync_status: googleSync.status });
  return NextResponse.json({ activity: data, googleSync }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();
  const access = await context();
  if (!access) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const body = await request.json().catch(() => null) as ActivityInput | null;
  if (!body || !body.id || !uuid.test(body.id)) return NextResponse.json({ error: "Atividade inválida." }, { status: 400 });
  const { data: current, error: currentError } = await access.admin.from("activities").select("*").eq("id", body.id).maybeSingle();
  if (currentError) return NextResponse.json({ error: "Não foi possível consultar a atividade." }, { status: 500 });
  if (!current) return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
  const parsed = parseActivity(body, current as Activity);
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const { data, error } = await access.admin.from("activities")
    .update(parsed.value)
    .eq("id", body.id)
    .select("*")
    .single();
  if (error || !data) return NextResponse.json({ error: "Não foi possível atualizar a atividade." }, { status: 500 });

  const googleSync = await syncActivityToGoogle(data as Activity);
  await logAdminAudit(access.session.user.id, "activities", data.id, "update", { previous_status: current.status, status: data.status, google_sync_status: googleSync.status });
  return NextResponse.json({ activity: data, googleSync });
}

export async function PUT(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();
  const access = await context();
  if (!access) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id || !uuid.test(body.id)) return NextResponse.json({ error: "Atividade inválida." }, { status: 400 });
  const { data, error } = await access.admin.from("activities").select("*").eq("id", body.id).maybeSingle();
  if (error) return NextResponse.json({ error: "Não foi possível consultar a atividade." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });
  const googleSync = await syncActivityToGoogle(data as Activity);
  await logAdminAudit(access.session.user.id, "activities", data.id, "sync_google_calendar", { google_sync_status: googleSync.status });
  return NextResponse.json({ googleSync });
}

export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();
  const access = await context();
  if (!access) return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  const body = await request.json().catch(() => null) as { id?: string } | null;
  if (!body?.id || !uuid.test(body.id)) return NextResponse.json({ error: "Atividade inválida." }, { status: 400 });
  const { data, error: lookupError } = await access.admin.from("activities").select("*").eq("id", body.id).maybeSingle();
  if (lookupError) return NextResponse.json({ error: "Não foi possível consultar a atividade." }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Atividade não encontrada." }, { status: 404 });

  const googleSync = await deleteActivityFromGoogle(body.id);
  if (googleSync.status === "error") {
    return NextResponse.json({ error: `A atividade foi preservada porque o Google Agenda não confirmou a exclusão: ${googleSync.message}` }, { status: 502 });
  }
  const { error } = await access.admin.from("activities").delete().eq("id", body.id);
  if (error) {
    // O evento já foi removido do Google. Recria o espelho para que a falha no
    // banco não deixe os dois calendários silenciosamente divergentes.
    if (googleSync.status === "synced") await syncActivityToGoogle(data as Activity);
    return NextResponse.json({ error: "Não foi possível excluir a atividade." }, { status: 500 });
  }
  await logAdminAudit(access.session.user.id, "activities", body.id, "delete", { title: data.title, status: data.status, google_sync_status: googleSync.status });
  return NextResponse.json({ success: true, googleSync });
}
