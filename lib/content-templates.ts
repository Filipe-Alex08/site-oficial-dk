import type { ActivityStatus, ActivityTemplateData, ContentTemplateDataMap, ContentTemplateKind, PostTemplateData } from "./types";

export type PostFormState = PostTemplateData & { slug: string; published: boolean };

export type ActivityFormState = {
  title: string;
  starts_at: string;
  ends_at: string;
  location: string;
  type: string;
  status: ActivityStatus;
  description: string;
  attendance_open: boolean;
};

export const emptyPost: PostFormState = { title: "", slug: "", excerpt: "", content: "", category: "Treinos", cover_url: "", youtube_url: "", tiktok_url: "", published: false };
export const emptyActivity: ActivityFormState = { title: "", starts_at: "", ends_at: "", location: "", type: "Treino", status: "confirmado", description: "", attendance_open: true };

export const activityStatuses: ActivityStatus[] = ["confirmado", "a_definir", "adiado", "cancelado", "finalizado"];

export function slugify(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/** ISO (UTC) -> valor de <input type="datetime-local"> no fuso do navegador. */
export function toDateTimeInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

/** Date -> "YYYY-MM-DDTHH:mm" no fuso local. */
function formatLocalInput(date: Date) {
  return toDateTimeInput(date.toISOString());
}

const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATETIME_LOCAL = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/;

function text(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

// ---------- Publicações ----------

export function normalizePostTemplateData(raw: unknown): PostTemplateData {
  const source = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  return {
    title: text(source.title),
    excerpt: text(source.excerpt),
    content: text(source.content),
    category: text(source.category, emptyPost.category) || emptyPost.category,
    cover_url: text(source.cover_url),
    youtube_url: text(source.youtube_url),
    tiktok_url: text(source.tiktok_url),
  };
}

export function postFormToTemplate(form: PostFormState): PostTemplateData {
  return normalizePostTemplateData(form);
}

/** Usar um template nunca publica nada: "Publicar agora" volta desligado. */
export function templateToPostForm(data: PostTemplateData): PostFormState {
  const normalized = normalizePostTemplateData(data);
  return { ...normalized, slug: slugify(normalized.title), published: false };
}

export function postFormHasContent(form: PostFormState) {
  return Boolean(form.title.trim() || form.excerpt.trim() || form.content.trim() || form.cover_url.trim() || form.youtube_url.trim() || form.tiktok_url.trim());
}

// ---------- Atividades ----------

export function normalizeActivityTemplateData(raw: unknown): ActivityTemplateData {
  const source = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const status = activityStatuses.includes(source.status as ActivityStatus) ? (source.status as ActivityStatus) : emptyActivity.status;
  const duration = typeof source.duration_minutes === "number" && Number.isFinite(source.duration_minutes) && source.duration_minutes > 0
    ? Math.round(source.duration_minutes)
    : null;
  const startTime = text(source.start_time);
  return {
    title: text(source.title),
    type: text(source.type, emptyActivity.type) || emptyActivity.type,
    status,
    location: text(source.location),
    description: text(source.description),
    attendance_open: typeof source.attendance_open === "boolean" ? source.attendance_open : emptyActivity.attendance_open,
    start_time: TIME.test(startTime) ? startTime : "",
    duration_minutes: duration,
  };
}

/** Guarda só o horário (HH:MM) do início e a duração entre início e término. A data é descartada. */
export function activityFormToTemplate(form: ActivityFormState): ActivityTemplateData {
  const hasStart = DATETIME_LOCAL.test(form.starts_at);
  let duration: number | null = null;
  if (hasStart && DATETIME_LOCAL.test(form.ends_at)) {
    const minutes = Math.round((new Date(form.ends_at).getTime() - new Date(form.starts_at).getTime()) / 60_000);
    if (minutes > 0) duration = minutes;
  }
  return normalizeActivityTemplateData({
    title: form.title,
    type: form.type,
    status: form.status,
    location: form.location,
    description: form.description,
    attendance_open: form.attendance_open,
    start_time: hasStart ? form.starts_at.slice(11, 16) : "",
    duration_minutes: duration,
  });
}

/**
 * Aplica o template sem mexer na data escolhida: usa a data de `current.starts_at`
 * (ou hoje, se vazia) e põe o horário/duração do template. Sem horário no template,
 * mantém o horário que já estava no formulário.
 */
export function templateToActivityForm(data: ActivityTemplateData, current: Pick<ActivityFormState, "starts_at">, now: Date = new Date()): ActivityFormState {
  const normalized = normalizeActivityTemplateData(data);
  const currentDate = DATETIME_LOCAL.test(current.starts_at) ? current.starts_at.slice(0, 10) : "";
  const currentTime = DATETIME_LOCAL.test(current.starts_at) ? current.starts_at.slice(11, 16) : "";
  const time = normalized.start_time || currentTime;
  const date = currentDate || (time ? formatLocalInput(now).slice(0, 10) : "");
  const startsAt = date && time ? `${date}T${time}` : "";
  const endsAt = startsAt && normalized.duration_minutes
    ? formatLocalInput(new Date(new Date(startsAt).getTime() + normalized.duration_minutes * 60_000))
    : "";
  return {
    title: normalized.title,
    type: normalized.type,
    status: normalized.status,
    location: normalized.location,
    description: normalized.description,
    attendance_open: normalized.attendance_open,
    starts_at: startsAt,
    ends_at: endsAt,
  };
}

export function activityFormHasContent(form: ActivityFormState) {
  return Boolean(form.title.trim() || form.location.trim() || form.description.trim() || form.starts_at || form.ends_at);
}

// ---------- Genérico ----------

export function normalizeTemplateData<K extends ContentTemplateKind>(kind: K, raw: unknown): ContentTemplateDataMap[K] {
  return (kind === "post" ? normalizePostTemplateData(raw) : normalizeActivityTemplateData(raw)) as ContentTemplateDataMap[K];
}

export const templateNameMaxLength = 80;

export function cleanTemplateName(value: string) {
  return value.replace(/\s+/g, " ").trim().slice(0, templateNameMaxLength);
}
