// Cabeçalho exigido das rotas de API próprias (veja lib/api-guard.ts). O
// navegador só o envia sem preflight na mesma origem, e é o que impede uma
// página de terceiro de chamar login ou o proxy do banco em nome do visitante.
export const CLIENT_HEADER = "x-dk-client";

// fetch para as rotas de API do próprio site, já com o cabeçalho e sem cache.
export function apiFetch(path: string, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set(CLIENT_HEADER, "1");
  return fetch(path, { ...init, headers, cache: "no-store" });
}

export function jsonApiFetch(path: string, body: unknown, init: RequestInit = {}) {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");
  return apiFetch(path, { ...init, method: init.method ?? "POST", headers, body: JSON.stringify(body) });
}
