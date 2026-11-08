import { NextResponse } from "next/server";
import { CLIENT_HEADER, forbidden, isSameOriginRequest, notConfigured } from "@/lib/api-guard";
import { createClient } from "@/lib/supabase/server";

// Backend for frontend: o navegador chama o Supabase por aqui, e o token vai
// anexado no servidor a partir do cookie de sessão. É o que permite o cookie
// ser HttpOnly — sem isso o cliente de navegador precisaria ler o cookie para
// montar o cabeçalho Authorization.
//
// A lista de caminhos é fechada de propósito: um proxy aberto viraria SSRF e
// daria acesso a qualquer endpoint da instância.

const PROXY_PREFIX = "/api/supabase/";
const ALLOWED_PREFIXES = ["rest/v1/", "storage/v1/"];

// Nunca repassados: identidade da conexão, credenciais do navegador (o servidor
// injeta as dele) e o cabeçalho de CSRF, que é do cliente Next.
const STRIPPED_REQUEST_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "cookie",
  "authorization",
  "apikey",
  CLIENT_HEADER,
]);

// Nunca devolvidos ao navegador: cabeçalhos de conexão, o que o fetch já
// descompactou, e Set-Cookie do Supabase, que não deve chegar ao cliente.
const STRIPPED_RESPONSE_HEADERS = new Set([
  "connection",
  "keep-alive",
  "transfer-encoding",
  "upgrade",
  "content-encoding",
  "content-length",
  "set-cookie",
]);

function upstreamTarget(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/+$/, "");
  if (!supabaseUrl) return null;

  const incoming = new URL(request.url);
  if (!incoming.pathname.startsWith(PROXY_PREFIX)) return null;

  const relative = incoming.pathname.slice(PROXY_PREFIX.length);
  // ".." não muda o host, mas evita alcançar outro endpoint da instância.
  if (relative.includes("..")) return null;
  if (!ALLOWED_PREFIXES.some((prefix) => relative.startsWith(prefix))) return null;

  try {
    const target = new URL(`${supabaseUrl}/${relative}${incoming.search}`);
    return target.origin === new URL(supabaseUrl).origin ? target : null;
  } catch {
    return null;
  }
}

async function handle(request: Request) {
  if (!isSameOriginRequest(request)) return forbidden();

  const target = upstreamTarget(request);
  if (!target) return NextResponse.json({ error: "Caminho não permitido." }, { status: 404 });

  const supabase = await createClient();
  if (!supabase) return notConfigured();

  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!anonKey) return notConfigured();

  // getSession() renova o token expirado e grava os cookies atualizados antes
  // de a resposta começar a ser enviada.
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token ?? anonKey;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!STRIPPED_REQUEST_HEADERS.has(key.toLowerCase())) headers.set(key, value);
  });
  headers.set("apikey", anonKey);
  headers.set("authorization", `Bearer ${accessToken}`);

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      // O Node exige duplex ao enviar corpo em streaming.
      duplex: "half",
      cache: "no-store",
      redirect: "manual",
    } as RequestInit & { duplex: "half" });
  } catch (error) {
    console.error("Falha ao encaminhar requisição ao Supabase", error);
    return NextResponse.json({ error: "Não foi possível falar com o banco de dados." }, { status: 502 });
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!STRIPPED_RESPONSE_HEADERS.has(key.toLowerCase())) responseHeaders.set(key, value);
  });
  responseHeaders.set("cache-control", "no-store");

  const hasBody = upstream.status !== 204 && upstream.status !== 304 && upstream.body !== null;
  return new Response(hasBody ? upstream.body : null, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
