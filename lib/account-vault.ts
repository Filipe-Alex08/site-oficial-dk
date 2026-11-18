// Cofre das contas SALVAS neste navegador, para alternar entre elas sem digitar
// a senha de novo. Este módulo é puro (sem cookies nem rede): só decide o que
// entra, o que sai e o que pode ser mostrado ao navegador.
//
// O cofre vive num cookie HttpOnly (veja lib/account-switch.ts). Cada entrada
// guarda o refresh token da conta, que é uma credencial durável: por isso ele
// nunca sai do servidor — `publicAccounts` é a única visão que a página recebe.
//
// REGRA CENTRAL: o cofre guarda só contas INATIVAS. O GoTrue troca o refresh
// token a cada renovação; se um token antigo da conta ativa ficasse aqui e fosse
// usado depois, o servidor entenderia como reuso e revogaria a sessão inteira.
// Por isso toda função que grava recebe o id da conta ativa e o descarta.

export const VAULT_COOKIE = "dk-contas";

/** Contas inativas guardadas (a ativa não conta), então o total é no máximo 6. */
export const MAX_SAVED_ACCOUNTS = 5;

export type VaultEntry = {
  id: string;
  email: string;
  name: string;
  avatarPath: string | null;
  /** Refresh token. Nunca é enviado ao navegador. */
  rt: string;
  savedAt: number;
};

/** O que a página pode ver de uma conta salva: tudo, menos a credencial. */
export type PublicAccount = Omit<VaultEntry, "rt">;

function isEntry(value: unknown): value is VaultEntry {
  if (!value || typeof value !== "object") return false;
  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === "string" && entry.id.length > 0 &&
    typeof entry.email === "string" &&
    typeof entry.name === "string" &&
    (entry.avatarPath === null || typeof entry.avatarPath === "string") &&
    typeof entry.rt === "string" && entry.rt.length > 0 &&
    typeof entry.savedAt === "number" && Number.isFinite(entry.savedAt)
  );
}

function dedupe(list: VaultEntry[]) {
  const seen = new Set<string>();
  return list.filter((entry) => (seen.has(entry.id) ? false : (seen.add(entry.id), true)));
}

/** Tolerante: qualquer coisa que não seja um cofre válido vira uma lista vazia. */
export function parseVault(raw: unknown): VaultEntry[] {
  if (typeof raw !== "string" || !raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return dedupe(parsed.filter(isEntry)).slice(0, MAX_SAVED_ACCOUNTS);
  } catch {
    return [];
  }
}

export function serializeVault(list: VaultEntry[]) {
  return JSON.stringify(list.slice(0, MAX_SAVED_ACCOUNTS));
}

// Valor do cookie: JSON em base64url, para não depender de escapes de `;` `,` e aspas.
export function encodeVault(list: VaultEntry[]) {
  return Buffer.from(serializeVault(list), "utf8").toString("base64url");
}

export function decodeVault(value: string | undefined | null) {
  if (!value) return [];
  try {
    return parseVault(Buffer.from(value, "base64url").toString("utf8"));
  } catch {
    return [];
  }
}

/** Tira do cofre a conta ativa, caso ela tenha ido parar lá. */
export function withoutActive(list: VaultEntry[], activeId: string | null | undefined) {
  return activeId ? list.filter((entry) => entry.id !== activeId) : list;
}

export function removeAccount(list: VaultEntry[], id: string) {
  return list.filter((entry) => entry.id !== id);
}

/**
 * Coloca `entry` no topo (a mais recente primeiro), sem duplicar, sem a conta
 * ativa e dentro do limite. Se `entry` for a própria conta ativa, não entra.
 */
export function upsertAccount(list: VaultEntry[], entry: VaultEntry, activeId: string | null | undefined) {
  const rest = withoutActive(removeAccount(list, entry.id), activeId);
  const next = entry.id === activeId ? rest : [entry, ...rest];
  return next.slice(0, MAX_SAVED_ACCOUNTS);
}

export function publicAccounts(list: VaultEntry[]): PublicAccount[] {
  return list.map((entry) => ({
    id: entry.id,
    email: entry.email,
    name: entry.name,
    avatarPath: entry.avatarPath,
    savedAt: entry.savedAt,
  }));
}
