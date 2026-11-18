import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest, notConfigured, requestOrigin } from "@/lib/api-guard";
import { isGoogleLoginAvailable } from "@/lib/google-login";
import { createClient } from "@/lib/supabase/server";

// Devolve a URL do Google para o navegador seguir. O login com Google usa PKCE:
// o comprovante que valida a volta fica num cookie gravado aqui, no servidor,
// e a troca pelo token acontece em app/auth/callback — o navegador nunca vê o
// código de autorização nem o token.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  if (!supabase) return notConfigured();

  // A página já desabilita o botão; aqui barra quem chamar a rota direto.
  if (!(await isGoogleLoginAvailable())) {
    return NextResponse.json({ error: "O login com o Google ainda não está disponível." }, { status: 503 });
  }

  const origin = requestOrigin(request);
  if (!origin) {
    console.error("Login com Google indisponível: não foi possível determinar a origem pública do site.");
    return NextResponse.json({ error: "Não foi possível iniciar o login com o Google." }, { status: 500 });
  }

  // "Adicionar outra conta": sem prompt=select_account o Google entra direto na conta que
  // já está aberta no navegador em vez de mostrar a escolha de contas.
  const body = await request.json().catch(() => null);
  const selectAccount = body?.selectAccount === true;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/auth/callback`,
      skipBrowserRedirect: true,
      ...(selectAccount ? { queryParams: { prompt: "select_account" } } : {}),
    },
  });

  if (error || !data.url) {
    console.error("Falha ao iniciar o login com o Google", error);
    return NextResponse.json({ error: "Não foi possível iniciar o login com o Google." }, { status: 502 });
  }

  return NextResponse.json({ url: data.url }, { headers: { "cache-control": "no-store" } });
}
