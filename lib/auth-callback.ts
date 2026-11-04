export const LOGIN_PATH = "/area-do-membro/login";
export const MEMBER_HOME = "/membro";

// Uma conta sem perfil só é apagada se o próprio login com Google a acabou de criar.
export const NEW_ACCOUNT_WINDOW_MS = 5 * 60 * 1000;

export const loginErrorCodes = ["pendente", "nao-liberado", "sem-cadastro", "google"] as const;
export type LoginErrorCode = (typeof loginErrorCodes)[number];

const loginErrorMessages: Record<LoginErrorCode, string> = {
  pendente: "Seu cadastro ainda está aguardando aprovação.",
  "nao-liberado": "Seu acesso ainda não está liberado.",
  "sem-cadastro": "Não encontramos um cadastro de membro para esta conta Google. Use o e-mail do seu cadastro ou entre com e-mail e senha.",
  google: "Não foi possível entrar com o Google. Tente novamente ou entre com e-mail e senha.",
};

// Só devolve textos fixos: nada que venha da URL é exibido.
export function loginErrorMessage(code: string | string[] | undefined) {
  const value = Array.isArray(code) ? code[0] : code;
  const known = loginErrorCodes.find((item) => item === value);
  return known ? loginErrorMessages[known] : null;
}

// Sem `code`, o Google foi cancelado ou o GoTrue recusou o login. O GoTrue usa
// error_code=signup_disabled quando o cadastro público está desligado e o e-mail
// do Google não pertence a nenhum usuário.
export function callbackFailureCode(params: { get(name: string): string | null }): LoginErrorCode {
  return params.get("error_code") === "signup_disabled" ? "sem-cadastro" : "google";
}

// Aceita apenas caminhos internos. O destino é resolvido contra uma origem fictícia
// para que `/..//site.externo` e variações com `\` ou caracteres de controle não escapem.
export function safeNextPath(next: string | null | undefined, fallback = MEMBER_HOME) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return fallback;
  for (const char of next) {
    const code = char.charCodeAt(0);
    if (char === "\\" || code < 32 || code === 127) return fallback;
  }
  try {
    const origin = "http://dk.invalid";
    const url = new URL(next, origin);
    const path = url.pathname + url.search + url.hash;
    return url.origin === origin && !path.startsWith("//") ? path : fallback;
  } catch {
    return fallback;
  }
}

export type ProfileLookup = { found: false } | { found: true; status: string };

export type GoogleAccount = {
  provider?: string;
  identityProviders?: string[];
  createdAt?: string;
};

export type GoogleLoginDecision =
  | { action: "allow" }
  | { action: "deny"; error: Exclude<LoginErrorCode, "google">; deleteUser: boolean };

// Conta criada agora pelo Google: origem Google, nenhuma identidade de outro provedor
// (e-mail e senha incluso) e criação dentro da janela. Dados ausentes contam como "não".
export function isNewGoogleAccount(account: GoogleAccount, now = Date.now()) {
  const identities = account.identityProviders ?? [];
  if (account.provider !== "google" || !identities.length || identities.some((provider) => provider !== "google")) return false;
  const createdAt = Date.parse(account.createdAt ?? "");
  return Number.isFinite(createdAt) && Math.abs(now - createdAt) <= NEW_ACCOUNT_WINDOW_MS;
}

// `deleteUser` só pode ser verdadeiro quando NÃO existe perfil. A exclusão em
// auth.users apaga o perfil em cascata, então quem tem perfil nunca é apagado.
export function decideGoogleLogin(profile: ProfileLookup, account: GoogleAccount, now = Date.now()): GoogleLoginDecision {
  if (!profile.found) return { action: "deny", error: "sem-cadastro", deleteUser: isNewGoogleAccount(account, now) };
  if (profile.status === "aprovado") return { action: "allow" };
  return { action: "deny", error: profile.status === "pendente" ? "pendente" : "nao-liberado", deleteUser: false };
}
