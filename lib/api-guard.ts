import { NextResponse } from "next/server";
import { CLIENT_HEADER } from "@/lib/api-client";

// Defesa de CSRF para rotas de API que dependem do cookie de sessão.
//
// O SameSite=Lax do cookie já impede o navegador de enviá-lo num POST entre
// sites, mas rotas que criam sessão (login) são alvo mesmo sem cookie: sem
// defesa, uma página de terceiro pode logar a vítima na conta do atacante.
// Por isso o cliente precisa de um cabeçalho próprio, que o navegador só envia
// sem preflight em requisições da mesma origem — e o preflight, entre sites,
// não é concedido por nenhuma destas rotas.
export { CLIENT_HEADER };

function configuredOrigin() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) return null;
  try {
    return new URL(siteUrl).origin;
  } catch {
    return null;
  }
}

export function isSameOriginRequest(request: Request) {
  if (request.headers.get(CLIENT_HEADER) !== "1") return false;

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") return false;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  const expected = configuredOrigin();
  if (expected) return origin === expected;

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https";
  return Boolean(host) && origin === `${proto}://${host}`;
}

// Origem para onde o navegador deve voltar (callback do OAuth). Prefere a URL
// pública configurada: o host da requisição vem de cabeçalho e só é usado
// quando não há configuração.
export function requestOrigin(request: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (siteUrl) {
    const origin = configuredOrigin();
    if (origin) return origin;
  }

  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (!host) return null;
  const proto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim() || "http";
  return `${proto}://${host}`;
}

export function forbidden() {
  return NextResponse.json({ error: "Requisição não autorizada." }, { status: 403 });
}

export function notConfigured() {
  return NextResponse.json({ error: "Servidor não configurado." }, { status: 503 });
}
