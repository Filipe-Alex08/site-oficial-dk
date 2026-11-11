import type { Activity } from "@/lib/types";

export const GOOGLE_CALENDAR_TIME_ZONE = "America/Sao_Paulo";

const statusLabels = {
  confirmado: "Confirmado",
  a_definir: "A definir",
  adiado: "Adiado",
  cancelado: "Cancelado",
  finalizado: "Finalizado",
} as const;

const titlePrefixes = {
  confirmado: "",
  a_definir: "A DEFINIR — ",
  adiado: "ADIADO — ",
  cancelado: "CANCELADO — ",
  finalizado: "",
} as const;

export function googleEventIdForActivity(activityId: string) {
  return `dk${activityId.replace(/-/g, "").toLowerCase()}`;
}

export function buildGoogleCalendarEvent(activity: Activity, siteUrl?: string) {
  const start = new Date(activity.starts_at);
  const explicitEnd = activity.ends_at ? new Date(activity.ends_at) : null;
  const end = explicitEnd && explicitEnd > start
    ? explicitEnd
    : new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const notice = activity.notice_message?.trim();
  const details = [
    notice ? `AVISO DO DK: ${notice}` : "",
    activity.description?.trim() || "",
    `Situação: ${statusLabels[activity.status]}`,
    siteUrl ? `Calendário oficial: ${siteUrl.replace(/\/$/, "")}/#calendario` : "",
  ].filter(Boolean);

  return {
    summary: `${titlePrefixes[activity.status]}${activity.title}`,
    description: details.join("\n\n"),
    location: activity.location,
    start: { dateTime: start.toISOString(), timeZone: GOOGLE_CALENDAR_TIME_ZONE },
    end: { dateTime: end.toISOString(), timeZone: GOOGLE_CALENDAR_TIME_ZONE },
    visibility: "public",
    extendedProperties: { private: { dkActivityId: activity.id } },
  };
}
