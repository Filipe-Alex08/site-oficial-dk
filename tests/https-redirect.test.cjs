const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function loadProxy(env) {
  const exports = {};
  const mocks = {
    "next/server": { NextResponse: { redirect: (url, status) => ({ redirectTo: String(url), status }) } },
    "@/lib/supabase/proxy": { updateSession: async () => ({ passedThrough: true }) },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync("proxy.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, URL, process: { env }, Promise, require: (n) => mocks[n] ?? require(n) });
  return exports.proxy;
}
const req = (headers, path = "/sobre", search = "?a=1") => ({
  headers: { get: (n) => headers[n.toLowerCase()] ?? null },
  nextUrl: { pathname: path, search },
});
const SITE = { NEXT_PUBLIC_SITE_URL: "https://death-knights.com.br" };

test("visitante em HTTP no Cloudflare e mandado para HTTPS, mantendo caminho e query", async () => {
  const r = await loadProxy(SITE)(req({ "cf-visitor": '{"scheme":"http"}' }, "/membro", "?x=1"));
  assert.equal(r.status, 308);
  assert.equal(r.redirectTo, "https://death-knights.com.br/membro?x=1");
});

test("visitante em HTTPS segue normalmente (sem laco)", async () => {
  const r = await loadProxy(SITE)(req({ "cf-visitor": '{"scheme":"https"}' }));
  assert.deepEqual(JSON.parse(JSON.stringify(r)), { passedThrough: true });
});

test("sem cabecalhos (health check local do deploy) nao redireciona", async () => {
  const r = await loadProxy(SITE)(req({}));
  assert.equal(r.passedThrough, true);
});

test("CF-Visitor malformado nao derruba nem redireciona", async () => {
  for (const bad of ["{", "null", '{"scheme":5}', "[]", ""]) {
    const r = await loadProxy(SITE)(req({ "cf-visitor": bad }));
    assert.equal(r.passedThrough, true, `valor ${bad}`);
  }
});

test("X-Forwarded-Proto sozinho so redireciona com FORCE_HTTPS=1", async () => {
  const headers = { "x-forwarded-proto": "http" };
  assert.equal((await loadProxy(SITE)(req(headers))).passedThrough, true);
  assert.equal((await loadProxy({ ...SITE, FORCE_HTTPS: "1" })(req(headers))).status, 308);
});

test("CF-Visitor https vence um X-Forwarded-Proto http isolado (sem laco)", async () => {
  const r = await loadProxy({ ...SITE, FORCE_HTTPS: "1" })(req({ "cf-visitor": '{"scheme":"https"}', "x-forwarded-proto": "http" }));
  assert.equal(r.passedThrough, true);
});

test("sem NEXT_PUBLIC_SITE_URL https, nunca redireciona", async () => {
  assert.equal((await loadProxy({})(req({ "cf-visitor": '{"scheme":"http"}' }))).passedThrough, true);
  assert.equal((await loadProxy({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" })(req({ "cf-visitor": '{"scheme":"http"}' }))).passedThrough, true);
});
