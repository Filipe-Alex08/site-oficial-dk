import { createAdminClient } from "@/lib/supabase/admin";
import { getClientIp } from "@/lib/client-ip";
import { redactText, sanitizeDetails, truncate } from "@/lib/log-sanitize";

export type LogLevel = "info" | "aviso" | "erro";
export type LogSource = "evento" | "servidor";

export type LogEntry = {
  level?: LogLevel;
  source?: LogSource;
  category: string;
  action?: string;
  message: string;
  actorId?: string | null;
  request?: Request;
  path?: string;
  details?: unknown;
};

type LogRow = {
  level: LogLevel;
  source: LogSource;
  category: string;
  action: string | null;
  message: string;
  actor_id: string | null;
  ip: string | null;
  path: string | null;
  details: Record<string, unknown>;
};

const BATCH_SIZE = 25;
const FLUSH_DELAY_MS = 2000;
const MAX_QUEUE = 500;

const queue: LogRow[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;
let flushing: Promise<void> | null = null;

function toRow(entry: LogEntry): LogRow {
  let path = entry.path ?? null;
  let ip: string | null = null;
  if (entry.request) {
    const clientIp = getClientIp(entry.request);
    ip = clientIp === "unknown" ? null : clientIp;
    if (!path) {
      try {
        path = new URL(entry.request.url).pathname;
      } catch {
        path = null;
      }
    }
  }
  // Query string pode carregar tokens: guarda so o caminho.
  if (path) path = truncate(path.split("?")[0], 500);

  return {
    level: entry.level ?? "info",
    source: entry.source ?? "evento",
    category: truncate(entry.category, 60),
    action: entry.action ? truncate(entry.action, 120) : null,
    message: truncate(redactText(entry.message), 4000),
    actor_id: entry.actorId ?? null,
    ip,
    path,
    details: sanitizeDetails(entry.details),
  };
}

// Nunca lanca e nunca usa console.error: a captura do console grava aqui, e um
// erro de gravacao que fosse para o console criaria um laco.
async function drain() {
  try {
    while (queue.length) {
      const admin = createAdminClient();
      if (!admin) {
        queue.length = 0;
        return;
      }
      const batch = queue.splice(0, 100);
      await admin.from("app_logs").insert(batch);
    }
  } catch {
    // Log e best-effort.
  }
}

export function flushLogs(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  if (!flushing) {
    flushing = drain().finally(() => {
      flushing = null;
    });
  }
  return flushing;
}

function enqueue(row: LogRow) {
  if (queue.length >= MAX_QUEUE) queue.shift();
  queue.push(row);
  if (queue.length >= BATCH_SIZE) {
    void flushLogs();
  } else if (!timer) {
    timer = setTimeout(() => {
      timer = null;
      void flushLogs();
    }, FLUSH_DELAY_MS);
    timer.unref?.();
  }
}

/** Registra um evento do site. Em fila, em segundo plano; nunca bloqueia nem falha. */
export function logEvent(entry: LogEntry): void {
  try {
    enqueue(toRow(entry));
  } catch {
    // Log e best-effort.
  }
}

/** Como logEvent, mas espera a gravacao (usar onde o processo pode encerrar). */
export async function logEventNow(entry: LogEntry): Promise<void> {
  logEvent(entry);
  await flushLogs();
}
