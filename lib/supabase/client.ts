import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { CLIENT_HEADER } from "@/lib/api-client";

export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}

// Cliente do navegador por trás do proxy em app/api/supabase.
//
// Antes este arquivo usava o createBrowserClient do @supabase/ssr, que guardava
// a sessão (access token E refresh token) num cookie legível por JavaScript. O
// cookie agora é do servidor e pode ser HttpOnly: o navegador não tem mais
// como montar o cabeçalho Authorization sozinho, então as chamadas de dados
// passam pelo proxy, que anexa o token lido do cookie.
//
// O que NÃO passa pelo proxy:
//   - login, login com Google, leitura da conta e logout, que ficam em
//     app/api/auth/* (o token nunca chega ao JavaScript);
//   - as URLs públicas de arquivo (storage.getPublicUrl), que são só strings
//     montadas aqui e carregadas direto pelo <img>.

const PROXY_PATH = "/api/supabase";

// Prefixos que o proxy atende, iguais aos de app/api/supabase/[...path]/route.ts.
// /auth/v1 fica de fora de propósito.
const PROXIED_PREFIXES = ["/rest/v1/", "/storage/v1/"];

function proxiedPath(url: URL) {
  if (!PROXIED_PREFIXES.some((prefix) => url.pathname.startsWith(prefix))) return null;
  return `${PROXY_PATH}${url.pathname}${url.search}`;
}

// O cliente do navegador não tem sessão (persistSession: false), então o que ele
// enviaria de credencial é só a chave pública. O proxy descarta esses
// cabeçalhos e injeta o token do cookie de sessão.
function stripCredentials(headers: Headers) {
  headers.delete("authorization");
  headers.delete("apikey");
  headers.set(CLIENT_HEADER, "1");
}

function proxyFetch(input: RequestInfo | URL, init?: RequestInit) {
  // Os dois clientes (PostgREST e Storage) chamam fetch com uma URL absoluta em
  // string; o caso Request existe só por segurança, para não reescrever nada
  // errado se alguma versão futura mudar isso.
  if (input instanceof Request) {
    const url = new URL(input.url);
    const path = proxiedPath(url);
    if (!path) return fetch(input);

    const rewritten = new Request(path, input);
    stripCredentials(rewritten.headers);
    return fetch(rewritten, { credentials: "same-origin" });
  }

  const url = new URL(String(input));
  const path = proxiedPath(url);
  if (!path) return fetch(input, init);

  const headers = new Headers(init?.headers);
  stripCredentials(headers);
  return fetch(path, { ...init, headers, credentials: "same-origin" });
}

export function createClient() {
  if (!isSupabaseConfigured()) return null;
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        // A sessão pertence ao servidor: nada é gravado no navegador, nada é
        // renovado aqui e não há callback de OAuth para ler na URL.
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: { fetch: proxyFetch },
    }
  );
}
