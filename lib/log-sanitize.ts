// Funcoes puras de saneamento dos logs. Ficam separadas de lib/app-log.ts para
// poderem ser testadas sem banco nem Next.

const SECRET_KEY = /pass(word)?|senha|token|secret|api[_-]?key|authorization|cookie|jwt|credential|invite|codigo|otp/i;
const MAX_STRING = 2048;
const MAX_JSON = 8192;
const MAX_DEPTH = 5;
const MAX_KEYS = 40;
const MAX_ITEMS = 40;

export function truncate(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

// Tira de um texto livre o que parece credencial (JWT e cabecalho Bearer).
export function redactText(value: string) {
  return value
    .replace(/eyJ[\w-]{10,}\.[\w-]{10,}\.[\w-]{5,}/g, "[jwt]")
    .replace(/Bearer\s+[\w.~+/=-]+/gi, "Bearer [oculto]");
}

export function maskEmail(email: string) {
  const trimmed = email.trim();
  const at = trimmed.lastIndexOf("@");
  if (at < 1) return "***";
  return `${trimmed[0]}***${trimmed.slice(at)}`;
}

function clean(value: unknown, depth: number): unknown {
  if (value === null || value === undefined) return value ?? null;
  if (typeof value === "string") return truncate(redactText(value), MAX_STRING);
  if (typeof value === "number" || typeof value === "boolean") return value;
  if (typeof value === "bigint") return value.toString();
  if (value instanceof Error) {
    return { name: value.name, message: truncate(redactText(value.message), MAX_STRING) };
  }
  if (depth >= MAX_DEPTH) return "[profundo demais]";
  if (Array.isArray(value)) return value.slice(0, MAX_ITEMS).map((item) => clean(item, depth + 1));
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>).slice(0, MAX_KEYS)) {
      out[key] = SECRET_KEY.test(key) ? "[oculto]" : clean(item, depth + 1);
    }
    return out;
  }
  return undefined;
}

// Devolve um objeto JSON seguro e pequeno para a coluna `details`.
export function sanitizeDetails(details: unknown): Record<string, unknown> {
  const cleaned = clean(details, 0);
  const object = cleaned && typeof cleaned === "object" && !Array.isArray(cleaned)
    ? (cleaned as Record<string, unknown>)
    : cleaned === null || cleaned === undefined ? {} : { valor: cleaned };

  const json = JSON.stringify(object);
  if (json.length <= MAX_JSON) return object;
  return { truncado: true, previa: json.slice(0, 2000) };
}
