import { NextResponse } from "next/server";
import { forbidden, isSameOriginRequest, notConfigured, requestOrigin } from "@/lib/api-guard";
import { createClient } from "@/lib/supabase/server";

// Devolve a URL do Google para o navegador seguir. O login com Google usa PKCE:
// o comprovante que valida a volta fica num cookie gravado aqui, no servidor,
// e a troca pelo token acontece em app/auth/callback — o navegador nunca vê o
// código de autorização nem o token.
export async function POST(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const supabase = await createClient();
  if (!supabase) return notConfigured();

  const origin = requestOrigin(request);
  if (!origin) {
    console.error("Login com Google indisponível: não foi possível determinar a origem pública do site.");
    return NextResponse.json({ error: "Não foi possível iniciar o login com o Google." }, { status: 500 });
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback`, skipBrowserRedirect: true },
  });

  if (error || !data.url) {
    console.error("Falha ao iniciar o login com o Google", error);
    return NextResponse.json({ error: "Não foi possível iniciar o login com o Google." }, { status: 502 });
  }

  return NextResponse.json({ url: data.url }, { headers: { "cache-control": "no-store" } });
}
