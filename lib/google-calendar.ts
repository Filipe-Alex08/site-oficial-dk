import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildGoogleCalendarEvent, googleEventIdForActivity } from "@/lib/google-calendar-event";
import type { Activity, GoogleCalendarSyncStatus } from "@/lib/types";

type GoogleConfig = {
  calendarId: string;
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

export type GoogleSyncResult = {
  status: GoogleCalendarSyncStatus;
  message?: string;
  htmlLink?: string | null;
};

let tokenCache: { value: string; expiresAt: number } | null = null;

function googleConfig(): GoogleConfig | null {
  const calendarId = process.env.GOOGLE_CALENDAR_ID?.trim();
  const clientId = process.env.GOOGLE_CALENDAR_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CALENDAR_CLIENT_SECRET?.trim();
  const refreshToken = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN?.trim();
  if (!calendarId || !clientId || !clientSecret || !refreshToken) return null;
  return { calendarId, clientId, clientSecret, refreshToken };
}

export function isGoogleCalendarConfigured() {
  return Boolean(googleConfig());
}

function limitedError(error: unknown) {
  const message = error instanceof Error ? error.message : "Falha desconhecida na sincronização.";
  return message.replace(/\s+/g, " ").trim().slice(0, 500);
}

async function accessToken(config: GoogleConfig) {
  if (tokenCache && tokenCache.expiresAt > Date.now() + 60_000) return tokenCache.value;
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
    signal: AbortSignal.timeout(10_000),
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({})) as { access_token?: string; expires_in?: number; error_description?: string };
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || "O Google recusou a renovação da credencial do calendário.");
  }
  tokenCache = {
    value: data.access_token,
    expiresAt: Date.now() + Math.max(60, data.expires_in ?? 3600) * 1000,
  };
  return tokenCache.value;
}

async function calendarRequest(config: GoogleConfig, path: string, init: RequestInit) {
  const token = await accessToken(config);
  const response = await fetch(`https://www.googleapis.com/calendar/v3${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...init.headers,
    },
    signal: AbortSignal.timeout(12_000),
    cache: "no-store",
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error?: { message?: string } };
    const error = new Error(data.error?.message || `Google Calendar respondeu com HTTP ${response.status}.`) as Error & { status?: number };
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) return null;
  return response.json() as Promise<{ id?: string; htmlLink?: string }>;
}

async function recordSync(activityId: string, values: Record<string, unknown>) {
  const admin = createAdminClient();
  if (!admin) return;
  const { error } = await admin.from("activity_calendar_sync").upsert({ activity_id: activityId, ...values }, { onConflict: "activity_id" });
  if (error) console.error("Falha ao registrar o estado da sincronização do calendário", error);
}

export async function syncActivityToGoogle(activity: Activity): Promise<GoogleSyncResult> {
  const config = googleConfig();
  if (!config) {
    await recordSync(activity.id, { sync_status: "disabled", sync_error: null, last_attempted_at: new Date().toISOString() });
    return { status: "disabled", message: "Google Agenda ainda não configurado." };
  }

  const admin = createAdminClient();
  if (!admin) return { status: "error", message: "Servidor sem acesso administrativo ao banco." };
  const attemptedAt = new Date().toISOString();
  await recordSync(activity.id, { sync_status: "pending", sync_error: null, last_attempted_at: attemptedAt });

  try {
    const { data: existing } = await admin.from("activity_calendar_sync")
      .select("google_event_id")
      .eq("activity_id", activity.id)
      .maybeSingle();
    const eventId = existing?.google_event_id || googleEventIdForActivity(activity.id);
    const calendarId = encodeURIComponent(config.calendarId);
    const event = buildGoogleCalendarEvent(activity, process.env.NEXT_PUBLIC_SITE_URL || "https://death-knights.com.br");
    let result: { id?: string; htmlLink?: string } | null;

    if (existing?.google_event_id) {
      try {
        result = await calendarRequest(config, `/calendars/${calendarId}/events/${encodeURIComponent(eventId)}?sendUpdates=all`, {
          method: "PATCH",
          body: JSON.stringify(event),
        });
      } catch (error) {
        if ((error as Error & { status?: number }).status !== 404) throw error;
        result = await calendarRequest(config, `/calendars/${calendarId}/events?sendUpdates=all`, {
          method: "POST",
          body: JSON.stringify({ id: eventId, ...event }),
        });
      }
    } else {
      try {
        result = await calendarRequest(config, `/calendars/${calendarId}/events?sendUpdates=all`, {
          method: "POST",
          body: JSON.stringify({ id: eventId, ...event }),
        });
      } catch (error) {
        if ((error as Error & { status?: number }).status !== 409) throw error;
        result = await calendarRequest(config, `/calendars/${calendarId}/events/${encodeURIComponent(eventId)}?sendUpdates=all`, {
          method: "PATCH",
          body: JSON.stringify(event),
        });
      }
    }

    const syncedAt = new Date().toISOString();
    await recordSync(activity.id, {
      google_event_id: result?.id || eventId,
      google_event_html_link: result?.htmlLink || null,
      sync_status: "synced",
      sync_error: null,
      last_attempted_at: attemptedAt,
      last_synced_at: syncedAt,
    });
    return { status: "synced", htmlLink: result?.htmlLink || null };
  } catch (error) {
    const message = limitedError(error);
    await recordSync(activity.id, { sync_status: "error", sync_error: message, last_attempted_at: attemptedAt });
    return { status: "error", message };
  }
}

export async function deleteActivityFromGoogle(activityId: string): Promise<GoogleSyncResult> {
  const config = googleConfig();
  if (!config) return { status: "disabled", message: "Google Agenda ainda não configurado." };
  const admin = createAdminClient();
  if (!admin) return { status: "error", message: "Servidor sem acesso administrativo ao banco." };
  const { data } = await admin.from("activity_calendar_sync")
    .select("google_event_id")
    .eq("activity_id", activityId)
    .maybeSingle();
  const eventId = data?.google_event_id || googleEventIdForActivity(activityId);
  try {
    await calendarRequest(
      config,
      `/calendars/${encodeURIComponent(config.calendarId)}/events/${encodeURIComponent(eventId)}?sendUpdates=all`,
      { method: "DELETE" },
    );
    return { status: "synced" };
  } catch (error) {
    if ((error as Error & { status?: number }).status === 404) return { status: "synced" };
    const message = limitedError(error);
    await recordSync(activityId, { sync_status: "error", sync_error: message, last_attempted_at: new Date().toISOString() });
    return { status: "error", message };
  }
}
