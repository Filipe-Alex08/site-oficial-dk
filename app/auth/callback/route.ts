import { LOGIN_PATH, RESET_PASSWORD_PATH, callbackFailureCode, decideGoogleLogin, safeNextPath, type LoginErrorCode } from "@/lib/auth-callback";
import { amrFromAccessToken, hasFreshRecovery, hasRecoveryCookie } from "@/lib/password-recovery";
import { restoreSnapshot, snapshotCurrent, stashPrevious, type ActiveSnapshot } from "@/lib/account-switch";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

// Location relativo: o navegador o resolve contra o endereço público que ele mesmo usou.
// O request.url do Next traz o host e a porta locais do servidor, o que mandaria o
// usuário para localhost quando o site roda atrás de um proxy reverso.
function relativeRedirect(path: string) {
  return new Response(null, { status: 307, headers: { Location: path, "Cache-Control": "no-store" } });
}

function backToLogin(error: LoginErrorCode) {
  return relativeRedirect(`${LOGIN_PATH}?erro=${error}`);
}

// Login recusado: o signOut acima limpou o cookie, então a conta que já estava
// ativa volta para ele. Se a conta recusada era a própria conta ativa, o signOut
// global já encerrou a sessão dela e não há o que devolver.
async function giveBack(supabase: NonNullable<Awaited<ReturnType<typeof createClient>>>, previous: ActiveSnapshot | null, deniedUserId?: string) {
  if (!previous || previous.entry.id === deniedUserId) return;
  await restoreSnapshot(supabase, previous);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  if (!code) return backToLogin(callbackFailureCode(searchParams));

  const supabase = await createClient();
  const admin = createAdminClient();
  if (!supabase || !admin) {
    console.error("Login com Google indisponível: Supabase ou chave administrativa não configurados.");
    return backToLogin("google");
  }

  // Quem já estava logado (ao "adicionar outra conta"): a troca do código abaixo
  // sobrescreve o cookie de sessão, então a conta anterior é guardada antes.
  const previous = await snapshotCurrent(supabase);

  try {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) return backToLogin("google");
    const user = data.user;

    // Leitura com a chave de serviço: a decisão não depende de a sessão recém-criada já
    // estar visível ao cliente, e um erro de leitura nunca vira "sem perfil".
    const { data: profile, error: profileError } = await admin.from("profiles").select("status").eq("id", user.id).maybeSingle();
    if (profileError) throw profileError;

    const decision = decideGoogleLogin(
      profile ? { found: true, status: profile.status } : { found: false },
      {
        provider: user.app_metadata?.provider,
        identityProviders: user.identities?.map((identity) => identity.provider),
        createdAt: user.created_at,
      },
    );

    if (decision.action === "allow") {
      await stashPrevious(previous, user.id);
      // Link de "esqueci minha senha": token recente de link de e-mail E a marca que o
      // pedido deixou neste navegador. O membro vai direto definir a senha nova, em
      // vez de cair na área do membro.
      if (hasRecoveryCookie(request.headers.get("cookie")) && hasFreshRecovery(amrFromAccessToken(data.session?.access_token))) {
        return relativeRedirect(RESET_PASSWORD_PATH);
      }
      return relativeRedirect(safeNextPath(searchParams.get("next")));
    }

    await supabase.auth.signOut();
    await giveBack(supabase, previous, user.id);
    if (decision.deleteUser) {
      const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
      if (deleteError) console.error("Falha ao apagar a conta criada pelo login com Google", deleteError);
    }
    return backToLogin(decision.error);
  } catch (error) {
    console.error("Falha ao concluir o login com Google", error);
    await supabase.auth.signOut().catch(() => undefined);
    await giveBack(supabase, previous).catch(() => undefined);
    return backToLogin("google");
  }
}
