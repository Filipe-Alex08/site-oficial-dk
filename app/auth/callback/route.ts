import { LOGIN_PATH, callbackFailureCode, decideGoogleLogin, safeNextPath, type LoginErrorCode } from "@/lib/auth-callback";
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

    if (decision.action === "allow") return relativeRedirect(safeNextPath(searchParams.get("next")));

    await supabase.auth.signOut();
    if (decision.deleteUser) {
      const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
      if (deleteError) console.error("Falha ao apagar a conta criada pelo login com Google", deleteError);
    }
    return backToLogin(decision.error);
  } catch (error) {
    console.error("Falha ao concluir o login com Google", error);
    await supabase.auth.signOut().catch(() => undefined);
    return backToLogin("google");
  }
}
