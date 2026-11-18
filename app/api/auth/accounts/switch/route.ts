import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest, notConfigured } from "@/lib/api-guard";
import { removeAccount, upsertAccount } from "@/lib/account-vault";
import { createStatelessSupabase, readVault, restoreSnapshot, snapshotCurrent, writeVault } from "@/lib/account-switch";
import { logEvent } from "@/lib/app-log";
import { createClient } from "@/lib/supabase/server";

const NO_STORE = { "cache-control": "no-store" };

// Troca a conta ativa por uma das salvas, sem pedir a senha.
//
// A sessão da conta escolhida é renovada primeiro num cliente SEM cookies: se o
// token estiver vencido ou a conta não estiver mais aprovada, nada muda para
// quem está logado. Só depois o cookie de sessão é trocado e a conta que estava
// ativa passa para o cofre.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  const verifier = createStatelessSupabase();
  if (!supabase || !verifier) return notConfigured();

  let id = "";
  try {
    const body = await request.json();
    if (typeof body?.id === "string") id = body.id;
  } catch {
    // Corpo ausente ou inválido: cai na validação abaixo.
  }
  if (!id) return NextResponse.json({ error: "Informe a conta." }, { status: 400, headers: NO_STORE });

  const vault = await readVault();
  const target = vault.find((entry) => entry.id === id);
  if (!target) return NextResponse.json({ error: "Conta não encontrada neste navegador." }, { status: 404, headers: NO_STORE });

  const previous = await snapshotCurrent(supabase);

  // Já é a conta ativa: só tira do cofre o que não devia estar lá.
  if (previous?.entry.id === target.id) {
    await writeVault(removeAccount(vault, target.id));
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  }

  const { data: refreshed, error: refreshError } = await verifier.auth.refreshSession({ refresh_token: target.rt });
  const session = refreshed.session;
  if (refreshError || !session || session.user.id !== target.id) {
    // Token vencido ou revogado: a entrada não serve mais.
    await writeVault(removeAccount(vault, target.id));
    return NextResponse.json({ error: "Sessão expirada. Entre novamente nessa conta." }, { status: 401, headers: NO_STORE });
  }

  // A partir daqui o refresh token guardado já foi consumido; a entrada precisa
  // acompanhar o token novo, senão o próximo uso derrubaria a sessão.
  const rotated = { ...target, rt: session.refresh_token, savedAt: Date.now() };

  const { data: profile } = await verifier.from("profiles").select("status").eq("id", target.id).maybeSingle();
  if (profile?.status !== "aprovado") {
    await verifier.auth.signOut({ scope: "local" }).catch(() => undefined);
    await writeVault(removeAccount(vault, target.id));
    logEvent({ level: "aviso", category: "auth", action: "troca_recusada", message: "Troca de conta recusada: cadastro não aprovado", actorId: target.id, request, details: { status: profile?.status ?? null } });
    return NextResponse.json({ error: "Essa conta não tem acesso liberado no momento." }, { status: 403, headers: NO_STORE });
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
  });
  if (sessionError) {
    console.error("Falha ao trocar de conta", sessionError);
    await restoreSnapshot(supabase, previous);
    await writeVault(upsertAccount(removeAccount(vault, target.id), rotated, previous?.entry.id));
    return NextResponse.json({ error: "Não foi possível trocar de conta agora. Tente novamente." }, { status: 500, headers: NO_STORE });
  }

  // A conta escolhida deixa o cofre (agora é a ativa) e a anterior entra nele.
  let next = removeAccount(vault, target.id);
  if (previous) next = upsertAccount(next, previous.entry, target.id);
  await writeVault(next);

  logEvent({ category: "auth", action: "troca_de_conta", message: "Troca de conta pelo seletor", actorId: target.id, request, details: { de: previous?.entry.id ?? null } });
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
