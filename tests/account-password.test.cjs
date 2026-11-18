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
    exports, URL, console, process: { env }, Promise,
    require: (name) => name in mocks ? mocks[name] : require(name),
  });
  return exports;
}

const { validatePasswordChange } = load("lib/account-password.ts");

test("a regra de senha e a mesma do cadastro (8 a 128) e exige senha atual diferente", () => {
  assert.equal(validatePasswordChange("antiga123", "novasenha1"), null);
  assert.match(validatePasswordChange("", "novasenha1"), /senha atual/);
  assert.match(validatePasswordChange(undefined, "novasenha1"), /senha atual/);
  assert.match(validatePasswordChange("antiga123", "curta"), /entre 8 e 128/);
  assert.match(validatePasswordChange("antiga123", "x".repeat(129)), /entre 8 e 128/);
  assert.equal(validatePasswordChange("antiga123", "x".repeat(128)), null);
  assert.match(validatePasswordChange("igual1234", "igual1234"), /diferente/);
  assert.match(validatePasswordChange("antiga123", 12345678), /entre 8 e 128/);
});

// ---- rota ---------------------------------------------------------------
function setup({ sameOrigin = true, user = { id: "u1", email: "membro@dk.test" }, verifyError = null, updateError = null, body = { current_password: "antiga123", new_password: "novasenha1" } } = {}) {
  const calls = { verifySignIn: [], verifySignOut: 0, verifySignOutScopes: [], update: [], signOut: [] };
  const supabase = {
    auth: {
      getUser: async () => ({ data: { user } }),
      updateUser: async (attrs) => { calls.update.push(attrs); return { error: updateError }; },
      signOut: async (opts) => { calls.signOut.push(opts); return { error: null }; },
    },
  };
  const verifier = {
    auth: {
      signInWithPassword: async (creds) => { calls.verifySignIn.push(creds); return { error: verifyError }; },
      signOut: async (opts) => { calls.verifySignOut += 1; calls.verifySignOutScopes.push(opts?.scope); return { error: null }; },
    },
  };
  const mocks = {
    "next/server": { NextResponse: { json: (b, init) => ({ body: b, status: init?.status ?? 200, headers: init?.headers }) } },
    "@supabase/supabase-js": { createClient: () => verifier },
    "@/lib/api-guard": { forbidden: () => ({ status: 403, body: { error: "Requisição não autorizada." } }), isSameOriginRequest: () => sameOrigin, notConfigured: () => ({ status: 503 }) },
    "@/lib/account-password": { validatePasswordChange },
    "@/lib/supabase/server": { createClient: async () => supabase },
  };
  const route = load("app/api/account/password/route.ts", mocks, { NEXT_PUBLIC_SUPABASE_URL: "https://x.test", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "pub" });
  const request = { json: async () => { if (body === "invalido") throw new Error("json"); return body; } };
  return { calls, post: () => route.POST(request) };
}

test("pedido de outra origem e recusado sem tocar no banco", async () => {
  const t = setup({ sameOrigin: false });
  assert.equal((await t.post()).status, 403);
  assert.equal(t.calls.verifySignIn.length + t.calls.update.length, 0);
});

test("sem sessao: 401", async () => {
  const t = setup({ user: null });
  assert.equal((await t.post()).status, 401);
  assert.equal(t.calls.update.length, 0);
});

test("senha nova invalida e recusada antes de conferir a atual", async () => {
  const t = setup({ body: { current_password: "antiga123", new_password: "curta" } });
  const r = await t.post();
  assert.equal(r.status, 400);
  assert.equal(t.calls.verifySignIn.length, 0);
});

test("corpo ilegivel vira 400", async () => {
  const t = setup({ body: "invalido" });
  assert.equal((await t.post()).status, 400);
});

test("senha atual errada: 400 e a senha NAO e trocada", async () => {
  const t = setup({ verifyError: { status: 400, message: "Invalid login credentials" } });
  const r = await t.post();
  assert.equal(r.status, 400);
  assert.equal(r.body.error, "Senha atual incorreta.");
  assert.equal(t.calls.update.length, 0);
  assert.equal(t.calls.signOut.length, 0);
});

test("muitas tentativas no Supabase: 429", async () => {
  const t = setup({ verifyError: { status: 429 } });
  assert.equal((await t.post()).status, 429);
  assert.equal(t.calls.update.length, 0);
});

test("sucesso: confere com o e-mail da sessao, troca a senha e desconecta os outros dispositivos", async () => {
  const t = setup();
  const r = await t.post();
  assert.equal(r.status, 200);
  assert.deepEqual(JSON.parse(JSON.stringify(t.calls.verifySignIn)), [{ email: "membro@dk.test", password: "antiga123" }]);
  assert.equal(t.calls.verifySignOut, 1);
  // Sem "local" o padrão é global e derruba a sessão que vai trocar a senha.
  assert.deepEqual(t.calls.verifySignOutScopes, ["local"]);
  assert.deepEqual(JSON.parse(JSON.stringify(t.calls.update)), [{ password: "novasenha1" }]);
  assert.deepEqual(JSON.parse(JSON.stringify(t.calls.signOut)), [{ scope: "others" }]);
});

test("o e-mail usado na conferencia vem da sessao, nunca do corpo do pedido", async () => {
  const t = setup({ body: { current_password: "antiga123", new_password: "novasenha1", email: "outro@alvo.test" } });
  await t.post();
  assert.equal(t.calls.verifySignIn[0].email, "membro@dk.test");
});

test("senha igual a atual rejeitada pelo Supabase vira mensagem clara", async () => {
  const t = setup({ updateError: { code: "same_password" } });
  const r = await t.post();
  assert.equal(r.status, 400);
  assert.match(r.body.error, /diferente/);
});
