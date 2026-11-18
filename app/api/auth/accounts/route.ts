import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest } from "@/lib/api-guard";
import { MAX_SAVED_ACCOUNTS, removeAccount, withoutActive } from "@/lib/account-vault";
import { activeUserId, readVault, revokeRefreshToken, toClientAccounts, writeVault } from "@/lib/account-switch";
import { logEvent } from "@/lib/app-log";
import { createClient } from "@/lib/supabase/server";

const NO_STORE = { "cache-control": "no-store" };

// Contas salvas neste navegador, sem a ativa e sem nenhuma credencial: o refresh
// token fica no cookie HttpOnly e só o servidor o lê.
export async function GET(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  const vault = await readVault();
  const activeId = supabase ? await activeUserId(supabase) : null;

  // A conta ativa não pode ficar no cofre (veja lib/account-vault.ts).
  const accounts = withoutActive(vault, activeId);
  if (accounts.length !== vault.length) await writeVault(accounts);

  return NextResponse.json({ accounts: toClientAccounts(accounts), max: MAX_SAVED_ACCOUNTS }, { headers: NO_STORE });
}

// "Esquecer" uma conta: sai do cofre e a sessão dela é encerrada no servidor.
export async function DELETE(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  let id = "";
  try {
    const body = await request.json();
    if (typeof body?.id === "string") id = body.id;
  } catch {
    // Corpo ausente ou inválido: cai na validação abaixo.
  }
  if (!id) return NextResponse.json({ error: "Informe a conta." }, { status: 400, headers: NO_STORE });

  const vault = await readVault();
  const entry = vault.find((item) => item.id === id);
  if (entry) {
    const remaining = removeAccount(vault, id);
    await writeVault(remaining);
    await revokeRefreshToken(entry.rt);
    logEvent({ category: "auth", action: "conta_esquecida", message: "Conta removida da lista de contas salvas", actorId: id, request });
    return NextResponse.json({ ok: true, accounts: toClientAccounts(remaining) }, { headers: NO_STORE });
  }

  return NextResponse.json({ ok: true, accounts: toClientAccounts(vault) }, { headers: NO_STORE });
}
