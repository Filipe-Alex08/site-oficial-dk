import { cookies } from "next/headers";
import { createClient as createStatelessClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  VAULT_COOKIE,
  decodeVault,
  encodeVault,
  publicAccounts,
  removeAccount,
  upsertAccount,
  type PublicAccount,
  type VaultEntry,
} from "@/lib/account-vault";
import { SUPABASE_COOKIE_OPTIONS } from "@/lib/supabase/cookie-options";

// Parte de servidor da troca de contas. A regra de negócio do cofre está em
// lib/account-vault.ts; aqui ficam o cookie, a leitura da conta ativa e a rede.

export type ActiveSnapshot = {
  accessToken: string;
  refreshToken: string;
  entry: VaultEntry;
};

export type ClientAccount = Omit<PublicAccount, "avatarPath"> & { avatarUrl: string | null };

export async function readVault() {
  const store = await cookies();
  return decodeVault(store.get(VAULT_COOKIE)?.value);
}

// Mesmos atributos do cookie de sessão (HttpOnly, SameSite, Secure) pelo mesmo
// motivo: o cofre guarda refresh tokens.
export async function writeVault(list: VaultEntry[]) {
  const store = await cookies();
  if (list.length === 0) {
    store.delete(VAULT_COOKIE);
    return;
  }
  store.set(VAULT_COOKIE, encodeVault(list), SUPABASE_COOKIE_OPTIONS);
}

/** Cliente sem sessão própria: não mexe nos cookies da requisição. */
export function createStatelessSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createStatelessClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
}

/**
 * Encerra no servidor a sessão de um refresh token guardado. Melhor esforço: se
 * falhar, a sessão só vence sozinha mais tarde.
 *
 * Só chame com o token de uma sessão que NÃO é a ativa nem acabou de ser
 * trocada: um token já consumido, reapresentado, faz o servidor derrubar a
 * sessão inteira.
 */
export async function revokeRefreshToken(refreshToken: string) {
  try {
    const client = createStatelessSupabase();
    if (!client) return;
    const { error } = await client.auth.refreshSession({ refresh_token: refreshToken });
    if (error) return;
    await client.auth.signOut({ scope: "local" });
  } catch (error) {
    console.error("Falha ao encerrar uma sessão salva", error);
  }
}

/** URL pública do avatar (só monta a string, sem rede), igual à do cabeçalho. */
export function avatarUrlFor(path: string | null) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  if (!path || !base) return null;
  return `${base}/storage/v1/object/public/profile-avatars/${path.split("/").map(encodeURIComponent).join("/")}`;
}

export function toClientAccounts(list: VaultEntry[]): ClientAccount[] {
  return publicAccounts(list).map(({ avatarPath, ...account }) => ({ ...account, avatarUrl: avatarUrlFor(avatarPath) }));
}

/** Id da conta ativa, confirmado no servidor de autenticação. */
export async function activeUserId(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

/**
 * Fotografia da conta ativa: tokens (para guardá-la ou restaurá-la) e o que o
 * seletor de contas mostra. `null` quando ninguém está logado.
 *
 * getSession() renova o access token vencido e já grava os cookies novos, então
 * o refresh token devolvido é o vigente — o único que vale guardar.
 */
export async function snapshotCurrent(supabase: SupabaseClient): Promise<ActiveSnapshot | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.refresh_token) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname, full_name, avatar_path")
      .eq("id", user.id)
      .maybeSingle();

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      entry: {
        id: user.id,
        email: user.email ?? "",
        name: profile?.nickname || profile?.full_name || user.email || "Conta",
        avatarPath: profile?.avatar_path ?? null,
        rt: session.refresh_token,
        savedAt: Date.now(),
      },
    };
  } catch (error) {
    console.error("Falha ao ler a conta ativa", error);
    return null;
  }
}

/** Recoloca no cookie de sessão uma conta fotografada antes (tentativa que deu errado). */
export async function restoreSnapshot(supabase: SupabaseClient, snapshot: ActiveSnapshot | null) {
  if (!snapshot) return;
  const { error } = await supabase.auth.setSession({
    access_token: snapshot.accessToken,
    refresh_token: snapshot.refreshToken,
  });
  if (error) console.error("Falha ao restaurar a conta anterior", error);
}

/**
 * Depois de uma entrada bem-sucedida: a conta que estava ativa passa para o
 * cofre e a que acabou de entrar sai dele (quem está ativo nunca fica no cofre).
 * Se a nova conta já estava salva, aquela sessão antiga fica sobrando e é
 * encerrada, a não ser que `revokeReplaced` seja falso.
 */
export async function stashPrevious(previous: ActiveSnapshot | null, newUserId: string, options: { revokeReplaced?: boolean } = {}) {
  const vault = await readVault();
  const replaced = vault.find((entry) => entry.id === newUserId);

  let next = removeAccount(vault, newUserId);
  if (previous) next = upsertAccount(next, previous.entry, newUserId);
  await writeVault(next);

  if (replaced && options.revokeReplaced !== false && replaced.rt !== previous?.refreshToken) {
    await revokeRefreshToken(replaced.rt);
  }
}
