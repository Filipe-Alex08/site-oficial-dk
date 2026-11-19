const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, mocks = {}, env = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports, URL, console, process: { env }, Promise, JSON, Array, Set,
    require: (name) => name in mocks ? mocks[name] : require(name),
  });
  return exports;
}

const recovery = load("lib/password-recovery.ts");

function setup({ sameOrigin = true, user = { id: "u1", email: "membro@dk.test" }, verifyError = null, updateError = null, origin = "https://dk.example",
  body = { current_password: "senhaatual1", new_email: "Novo@DK.test " } } = {}) {
  const calls = { verify: [], verifySignOut: [], update: [], logs: [] };
  const supabase = {
    auth: {
      getUser: async () => ({ data: { user } }),
      updateUser: async (attrs, options) => { calls.update.push({ attrs, options }); return { error: updateError }; },
    },
  };
  const verifier = {
    auth: {
      signInWithPassword: async (creds) => { calls.verify.push(creds); return { error: verifyError }; },
      signOut: async (opts) => { calls.verifySignOut.push(opts?.scope); return { error: null }; },
    },
  };
  const route = load("app/api/account/email/route.ts", {
    "next/server": { NextResponse: { json: (b, init) => ({ body: b, status: init?.status ?? 200 }) } },
    "@supabase/supabase-js": { createClient: () => verifier },
    "@/lib/api-guard": { forbidden: () => ({ status: 403 }), isSameOriginRequest: () => sameOrigin, notConfigured: () => ({ status: 503 }), requestOrigin: () => origin },
    "@/lib/app-log": { logEvent: (entry) => calls.logs.push(entry) },
    "@/lib/log-sanitize": load("lib/log-sanitize.ts"),
    "@/lib/password-recovery": recovery,
    "@/lib/supabase/server": { createClient: async () => supabase },
  }, { NEXT_PUBLIC_SUPABASE_URL: "https://x.test", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "pub" });
  const request = { json: async () => { if (body === "invalido") throw new Error("json"); return body; } };
  return { calls, post: () => route.POST(request) };
}

const plain = (value) => JSON.parse(JSON.stringify(value));

test("sucesso: confere a senha atual, pede a troca ao Auth e nao mexe no e-mail antes da confirmacao", async () => {
  const t = setup();
  const r = await t.post();
  assert.equal(r.status, 200);
  assert.deepEqual(plain(t.calls.verify), [{ email: "membro@dk.test", password: "senhaatual1" }]);
  assert.deepEqual(t.calls.verifySignOut, ["local"]);
  assert.deepEqual(plain(t.calls.update), [{ attrs: { email: "novo@dk.test" }, options: { emailRedirectTo: "https://dk.example/auth/callback" } }]);
  assert.ok(!JSON.stringify(t.calls.logs).includes("novo@dk.test"), "o log guarda so e-mails mascarados");
});

test("conta so com Google e orientada a criar uma senha antes, sem tentar conferir nada", async () => {
  const t = setup({ user: { id: "u1", email: "membro@dk.test", app_metadata: { providers: ["google"] } } });
  const r = await t.post();
  assert.equal(r.status, 400);
  assert.match(r.body.error, /Google/);
  assert.equal(t.calls.verify.length + t.calls.update.length, 0);
});

test("senha atual errada ou excesso de tentativas nao pedem a troca", async () => {
  const wrong = setup({ verifyError: { status: 400 } });
  const r = await wrong.post();
  assert.equal(r.status, 400);
  assert.equal(r.body.error, "Senha atual incorreta.");
  assert.equal(wrong.calls.update.length, 0);
  const limited = setup({ verifyError: { status: 429 } });
  assert.equal((await limited.post()).status, 429);
  assert.equal(limited.calls.update.length, 0);
});

test("pedido invalido e recusado antes de conferir a senha", async () => {
  for (const [options, status] of [
    [{ sameOrigin: false }, 403],
    [{ user: null }, 401],
    [{ body: "invalido" }, 400],
    [{ body: { new_email: "novo@dk.test" } }, 400],
    [{ body: { current_password: "senhaatual1", new_email: "nao-e-email" } }, 400],
    [{ body: { current_password: "senhaatual1", new_email: "MEMBRO@dk.test" } }, 400],
  ]) {
    const t = setup(options);
    assert.equal((await t.post()).status, status, JSON.stringify(options));
    assert.equal(t.calls.verify.length + t.calls.update.length, 0, JSON.stringify(options));
  }
});

test("e-mail ja usado, excesso de pedidos e falha do envio viram mensagens distintas", async () => {
  const taken = await setup({ updateError: { code: "email_exists", status: 422 } }).post();
  assert.equal(taken.status, 400);
  assert.doesNotMatch(taken.body.error, /cadastrad/i);
  assert.equal((await setup({ updateError: { status: 429, code: "over_email_send_rate_limit" } }).post()).status, 429);
  assert.equal((await setup({ updateError: { status: 500, code: "unexpected_failure" } }).post()).status, 502);
});

test("a migracao 027 copia o e-mail confirmado do Auth para o perfil", () => {
  const sql = fs.readFileSync("supabase/migrations/027_sync_profile_email.sql", "utf8");
  assert.match(sql, /after update of email on auth\.users/);
  assert.match(sql, /security definer/);
  assert.match(sql, /set search_path = public/);
});
