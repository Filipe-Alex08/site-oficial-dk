// O botão "Continuar com Google" só deve funcionar quando o servidor de
// autenticação (GoTrue) já tem o provedor Google ligado. O próprio Supabase diz
// isso em /auth/v1/settings (`external.google`), então não há flag manual para
// esquecer de virar depois do setup.

const CACHE_MS = 60_000;
const TIMEOUT_MS = 3_000;

let cached: { value: boolean; expiresAt: number } | null = null;

/** Lê `external.google` da resposta de /auth/v1/settings. Qualquer outra coisa é "desligado". */
export function googleEnabledFromSettings(settings: unknown): boolean {
  if (!settings || typeof settings !== "object") return false;
  const external = (settings as { external?: unknown }).external;
  if (!external || typeof external !== "object") return false;
  return (external as { google?: unknown }).google === true;
}

/**
 * true só se o servidor confirmou que o Google está ativo. Na dúvida (sem
 * configuração, erro de rede, resposta estranha) devolve false: o login por
 * e-mail e senha continua funcionando e o botão fica desabilitado.
 * O resultado é guardado por 1 minuto para não consultar a cada visita.
 */
export async function isGoogleLoginAvailable(): Promise<boolean> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) return cached.value;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  let value = false;

  if (url && key) {
    try {
      const response = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/settings`, {
        headers: { apikey: key },
        cache: "no-store",
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      value = response.ok && googleEnabledFromSettings(await response.json().catch(() => null));
    } catch {
      value = false;
    }
  }

  // Falha curta (15 s) para uma queda do Supabase não manter o botão apagado por 1 minuto.
  cached = { value, expiresAt: now + (value ? CACHE_MS : 15_000) };
  return value;
}
