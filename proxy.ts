import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Host canônico do site, usado como destino do redirecionamento para HTTPS.
// Vem de NEXT_PUBLIC_SITE_URL em vez do cabeçalho Host para que um host interno
// (localhost:3000 atrás do proxy) nunca apareça no Location. Um valor inválido
// apenas desliga o redirecionamento: este módulo carrega em toda requisição, e
// uma exceção aqui derrubaria o site inteiro.
const canonicalHost = (() => {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
  if (!siteUrl.startsWith("https://")) return "";
  try {
    return new URL(siteUrl).host;
  } catch {
    return "";
  }
})();

// Força HTTPS quando o proxy à frente informa que a conexão do cliente foi em
// HTTP.
//
// A checagem depende de o proxy encaminhar X-Forwarded-Proto com o protocolo
// original: quando o cabeçalho não chega, o próprio Next o preenche com "http"
// (baseado na conexão até ele, que atrás de um proxy TLS é HTTP), e o
// redirecionamento entraria em laço — ou seja, o site sai do ar. Como a
// topologia do proxy não é visível daqui, o recurso só liga com FORCE_HTTPS=1,
// depois de confirmar o cabeçalho. No Cloudflare, o caminho preferido é a opção
// "Always Use HTTPS", no edge, que não depende disso.
const httpsRedirectEnabled = process.env.FORCE_HTTPS === "1";

// O Cloudflare informa o protocolo que o VISITANTE usou em CF-Visitor ({"scheme":"http"}).
// Isso é seguro ligar sempre: só redireciona quando o visitante realmente veio por HTTP, e
// depois do redirecionamento ele chega com "https", então não há laço possível.
function cloudflareVisitorScheme(request: NextRequest) {
  const raw = request.headers.get("cf-visitor");
  if (!raw) return null;
  try {
    const scheme = JSON.parse(raw)?.scheme;
    return typeof scheme === "string" ? scheme.toLowerCase() : null;
  } catch {
    return null;
  }
}

function httpsRedirect(request: NextRequest) {
  if (!canonicalHost) return null;

  const visitorScheme = cloudflareVisitorScheme(request);
  let plainHttp: boolean;
  if (visitorScheme) {
    plainHttp = visitorScheme === "http";
  } else {
    // Fora do Cloudflare: cai no X-Forwarded-Proto, que só vale com FORCE_HTTPS=1 (veja acima).
    const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
    plainHttp = httpsRedirectEnabled && forwardedProto === "http";
  }
  if (!plainHttp) return null;

  const target = new URL(request.nextUrl.pathname + request.nextUrl.search, `https://${canonicalHost}`);
  return NextResponse.redirect(target, 308);
}

export async function proxy(request: NextRequest) {
  // Antes de updateSession para não gravar cookie de sessão numa conexão HTTP.
  const redirect = httpsRedirect(request);
  if (redirect) return redirect;
  return updateSession(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|robots\\.txt|sitemap\\.xml|favicon.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
