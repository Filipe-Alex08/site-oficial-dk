const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, mocks = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports, console, process: { env: {} }, Promise, JSON, RegExp,
    require: (name) => name in mocks ? mocks[name] : require(name),
  });
  return exports;
}

const phrase = load("lib/security-phrase.ts");
const plain = (value) => JSON.parse(JSON.stringify(value));

test("a frase e limpa, limitada e sem nada que o e-mail HTML interprete", () => {
  assert.deepEqual(plain(phrase.validateSecurityPhrase("  Lobo   cinza 42 ")), { ok: true, phrase: "Lobo cinza 42" });
  assert.deepEqual(plain(phrase.validateSecurityPhrase("Cavaleiro, de Ônix!")), { ok: true, phrase: "Cavaleiro, de Ônix!" });
  for (const empty of ["", "   ", null, undefined]) assert.deepEqual(plain(phrase.validateSecurityPhrase(empty)), { ok: true, phrase: null });
  for (const bad of ["ab", "x".repeat(41), "<b>oi</b>", "olá & tchau", "aspas \"duplas\"", "{{ .Token }}", "linha\u0000nula", 42, {}]) {
    assert.equal(phrase.validateSecurityPhrase(bad).ok, false, JSON.stringify(bad));
  }
});

test("ler a frase de user_metadata ignora o que foge do padrao (campo editavel pelo usuario)", () => {
  assert.equal(phrase.readSecurityPhrase({ frase_seguranca: "Lobo cinza 42" }), "Lobo cinza 42");
  for (const junk of [null, undefined, {}, { frase_seguranca: "<script>alert(1)</script>" }, { frase_seguranca: 7 }, "texto"]) {
    assert.equal(phrase.readSecurityPhrase(junk), "", JSON.stringify(junk));
  }
});

function route({ sameOrigin = true, user = { id: "u1" }, updateError = null, body = { phrase: "Lobo cinza 42" } } = {}) {
  const calls = { update: [], logs: [] };
  const supabase = {
    auth: {
      getUser: async () => ({ data: { user } }),
      updateUser: async (attrs) => { calls.update.push(attrs); return { error: updateError }; },
    },
  };
  const handler = load("app/api/account/security-phrase/route.ts", {
    "next/server": { NextResponse: { json: (b, init) => ({ body: b, status: init?.status ?? 200 }) } },
    "@/lib/api-guard": { forbidden: () => ({ status: 403 }), isSameOriginRequest: () => sameOrigin, notConfigured: () => ({ status: 503 }) },
    "@/lib/app-log": { logEvent: (entry) => calls.logs.push(entry) },
    "@/lib/security-phrase": phrase,
    "@/lib/supabase/server": { createClient: async () => supabase },
  });
  return { calls, post: () => handler.POST({ json: async () => { if (body === "invalido") throw new Error("json"); return body; } }) };
}

test("a rota grava a frase limpa em user_metadata e nao a escreve no log", async () => {
  const t = route({ body: { phrase: "  Lobo   cinza 42 " } });
  const r = await t.post();
  assert.equal(r.status, 200);
  assert.equal(r.body.phrase, "Lobo cinza 42");
  assert.deepEqual(plain(t.calls.update), [{ data: { frase_seguranca: "Lobo cinza 42" } }]);
  assert.ok(!JSON.stringify(t.calls.logs).includes("Lobo"));
});

test("texto vazio apaga a frase (null remove a chave no GoTrue)", async () => {
  const t = route({ body: { phrase: "" } });
  assert.equal((await t.post()).status, 200);
  assert.deepEqual(plain(t.calls.update), [{ data: { frase_seguranca: null } }]);
  assert.equal(t.calls.logs[0].action, "frase_seguranca_removida");
});

test("frase invalida, corpo ruim, outra origem e falta de login nao gravam nada", async () => {
  for (const [options, status] of [
    [{ body: { phrase: "<b>oi</b>" } }, 400],
    [{ body: "invalido" }, 400],
    [{ sameOrigin: false }, 403],
    [{ user: null }, 401],
  ]) {
    const t = route(options);
    assert.equal((await t.post()).status, status, JSON.stringify(options));
    assert.deepEqual(t.calls.update, []);
  }
  assert.equal((await route({ updateError: { message: "x" } }).post()).status, 500);
});
