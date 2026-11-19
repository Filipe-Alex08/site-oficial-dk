// Uma sessão aberta pelo link de "esqueci minha senha" se distingue das demais
// pelo método de autenticação registrado no token (claim `amr`): o GoTrue marca
// "recovery" (ou "otp", conforme a versão). Só essa sessão, e só por pouco
// tempo, pode definir uma senha nova SEM informar a atual; para quem já está
// logado normalmente, /api/account/password continua exigindo a senha atual.
export const RECOVERY_WINDOW_SECONDS = 15 * 60;

const RECOVERY_METHODS = new Set(["recovery", "otp"]);

type AmrEntry = string | { method?: unknown; timestamp?: unknown };

/** true se o `amr` traz um acesso por link de recuperação feito há no máximo a janela acima. */
export function hasFreshRecovery(amr: unknown, nowMs = Date.now()): boolean {
  if (!Array.isArray(amr)) return false;
  const nowSeconds = Math.floor(nowMs / 1000);
  return (amr as AmrEntry[]).some((entry) => {
    // Formato em texto puro não traz horário: não dá para provar que é recente.
    if (!entry || typeof entry !== "object") return false;
    if (typeof entry.method !== "string" || !RECOVERY_METHODS.has(entry.method)) return false;
    if (typeof entry.timestamp !== "number") return false;
    const age = nowSeconds - entry.timestamp;
    return age >= -60 && age <= RECOVERY_WINDOW_SECONDS;
  });
}

/** Lê o `amr` do payload de um JWT recém-emitido pelo servidor de autenticação (sem verificar assinatura). */
export function amrFromAccessToken(accessToken: unknown): unknown {
  if (typeof accessToken !== "string") return undefined;
  const payload = accessToken.split(".")[1];
  if (!payload) return undefined;
  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = new TextDecoder().decode(Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)));
    return JSON.parse(json)?.amr;
  } catch {
    return undefined;
  }
}

// O método do token ("otp") não basta para saber que a sessão veio de um pedido de
// "esqueci minha senha": outros links de e-mail também o usam. Por isso o pedido
// grava este cookie HttpOnly no navegador de quem pediu, e a tela de senha nova só
// vale quando cookie e token recente aparecem juntos (o PKCE já exige o mesmo navegador).
export const RECOVERY_COOKIE = "dk-recuperacao";
export const RECOVERY_COOKIE_MAX_AGE = 60 * 60;

/** true se o cabeçalho Cookie traz a marca de pedido de recuperação. */
export function hasRecoveryCookie(cookieHeader: string | null | undefined): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => part.trim() === `${RECOVERY_COOKIE}=1`);
}

/** Conta que entra com senha: o provedor "email" consta nos dados do usuário. Dados ausentes contam como sim. */
export function usesPasswordLogin(user: { app_metadata?: { providers?: unknown } } | null | undefined): boolean {
  const providers = user?.app_metadata?.providers;
  return Array.isArray(providers) ? providers.includes("email") : true;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Devolve o e-mail aparado se tiver cara de e-mail; senão null. */
export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim();
  return email.length <= 254 && EMAIL_PATTERN.test(email) ? email : null;
}
