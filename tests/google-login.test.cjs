const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, mocks = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports, URL, console,
    require: (name) => name in mocks ? mocks[name] : require(name), ...globals,
  });
  return exports;
}

// Objetos criados dentro do vm têm outro Object.prototype; normaliza antes de comparar.
const plain = (value) => JSON.parse(JSON.stringify(value));

const logic = load("lib/auth-callback.ts");

const now = Date.parse("2026-11-04T18:00:00Z");
const justCreated = "2026-11-04T17:59:58.123456Z";
const newGoogleAccount = { provider: "google", identityProviders: ["google"], createdAt: justCreated };
const passwordMember = { provider: "email", identityProviders: ["email", "google"], createdAt: "2026-01-10T12:00:00Z" };

function decide(profile, account = passwordMember) {
  return plain(logic.decideGoogleLogin(profile, account, now));
}

test("an approved member is allowed in", () => {
  assert.deepEqual(decide({ found: true, status: "aprovado" }), { action: "allow" });
  assert.deepEqual(decide({ found: true, status: "aprovado" }, newGoogleAccount), { action: "allow" });
});

test("a pending member is sent back with the approval notice and is never deleted", () => {
  const expected = { action: "deny", error: "pendente", deleteUser: false };
  assert.deepEqual(decide({ found: true, status: "pendente" }), expected);
  assert.deepEqual(decide({ found: true, status: "pendente" }, newGoogleAccount), expected);
});

test("refused, suspended, deactivated and unknown statuses are blocked and never deleted", () => {
  for (const status of ["recusado", "suspenso", "desativado", "qualquer-outro", ""]) {
    for (const account of [passwordMember, newGoogleAccount]) {
      assert.deepEqual(decide({ found: true, status }, account), { action: "deny", error: "nao-liberado", deleteUser: false }, status);
    }
  }
});

test("an account without a profile is denied and deleted only when Google just created it", () => {
  assert.deepEqual(decide({ found: false }, newGoogleAccount), { action: "deny", error: "sem-cadastro", deleteUser: true });
  assert.deepEqual(decide({ found: false }), { action: "deny", error: "sem-cadastro", deleteUser: false });
});

test("accounts that Google did not just create are never deleted", () => {
  const cases = {
    "created with e-mail and password": { ...newGoogleAccount, provider: "email", identityProviders: ["email"] },
    "e-mail identity linked to Google": { ...newGoogleAccount, identityProviders: ["google", "email"] },
    "older than the window": { ...newGoogleAccount, createdAt: "2026-11-04T17:50:00Z" },
    "creation date from the future": { ...newGoogleAccount, createdAt: "2026-11-04T18:30:00Z" },
    "invalid creation date": { ...newGoogleAccount, createdAt: "ontem" },
    "missing creation date": { provider: "google", identityProviders: ["google"] },
    "missing identities": { provider: "google", createdAt: justCreated },
    "empty identities": { ...newGoogleAccount, identityProviders: [] },
    "missing provider": { identityProviders: ["google"], createdAt: justCreated },
    "other social provider": { ...newGoogleAccount, provider: "github", identityProviders: ["github"] },
  };
  for (const [name, account] of Object.entries(cases)) {
    assert.equal(decide({ found: false }, account).deleteUser, false, name);
  }
});

test("the new-account window tolerates a small clock difference between servers", () => {
  const at = (createdAt) => decide({ found: false }, { ...newGoogleAccount, createdAt }).deleteUser;
  assert.equal(at("2026-11-04T17:56:00Z"), true);
  assert.equal(at("2026-11-04T18:01:00Z"), true);
  assert.equal(at("2026-11-04T17:54:59Z"), false);
});

test("next keeps internal paths, queries and fragments", () => {
  for (const next of ["/membro", "/membro/atividades", "/membro?aba=1", "/membro#topo", "/admin/membros?id=1&x=2#y", "/"]) {
    assert.equal(logic.safeNextPath(next), next);
  }
});

test("next falls back to the member area for anything that is not an internal path", () => {
  const unsafe = [
    undefined, null, "", "membro", " /membro", "https://evil.example/", "http://evil.example", "javascript:alert(1)",
    "//evil.example", "///evil.example", "\\\\evil.example", "/\\evil.example", "/\\/evil.example",
    "/\t/evil.example", "/\n/evil.example", "/\r/evil.example", "/\u0000/evil.example", "/membro\u007f",
    "/..//evil.example", "/.//evil.example", "/%2e%2e//evil.example", "/a/../..//evil.example",
  ];
  for (const next of unsafe) assert.equal(logic.safeNextPath(next), "/membro", JSON.stringify(next));
  assert.equal(logic.safeNextPath("//evil.example", "/inicio"), "/inicio");
});

test("login error codes map to fixed messages and nothing else is ever shown", () => {
  for (const code of logic.loginErrorCodes) {
    assert.ok(logic.loginErrorMessage(code), code);
    assert.equal(logic.loginErrorMessage([code, "google"]), logic.loginErrorMessage(code));
  }
  assert.equal(logic.loginErrorMessage("pendente"), "Seu cadastro ainda está aguardando aprovação.");
  assert.equal(logic.loginErrorMessage("nao-liberado"), "Seu acesso ainda não está liberado.");
  for (const code of [undefined, "", [], "Sua conta foi hackeada", "<script>alert(1)</script>", "PENDENTE", "constructor", "__proto__", "toString", "hasOwnProperty"]) {
    assert.equal(logic.loginErrorMessage(code), null, JSON.stringify(code));
  }
});

test("a refused Google redirect becomes a fixed notice", () => {
  const failure = (query) => logic.callbackFailureCode(new URLSearchParams(query));
  assert.equal(failure(""), "google");
  assert.equal(failure("error=access_denied&error_description=User+cancelled"), "google");
  assert.equal(failure("error=access_denied&error_code=signup_disabled"), "sem-cadastro");
  assert.equal(failure("error_code=algo-inesperado"), "google");
});
