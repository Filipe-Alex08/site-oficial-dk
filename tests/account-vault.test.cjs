const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file) {
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, Buffer, console, require });
  return exports;
}

const raw = load("lib/account-vault.ts");

// Os arrays nascem dentro do vm (outro realm); passa por JSON para o deepEqual comparar valores.
const plain = (value) => JSON.parse(JSON.stringify(value));
const vault = Object.fromEntries(
  Object.entries(raw).map(([name, value]) => [name, typeof value === "function" ? (...args) => plain(value(...args)) : value]),
);

const entry = (id, extra = {}) => ({ id, email: `${id}@dk.test`, name: id.toUpperCase(), avatarPath: null, rt: `rt-${id}`, savedAt: 1, ...extra });
const ids = (list) => Array.from(list, (item) => item.id);

test("parseVault ignora valores invalidos", () => {
  for (const raw of [undefined, null, "", "nao e json", "{}", "42", "[1,2]", 7]) {
    assert.deepEqual(vault.parseVault(raw), []);
  }
});

test("parseVault descarta entradas incompletas e duplicadas", () => {
  const raw = JSON.stringify([entry("a"), { id: "b" }, entry("a", { name: "outra" }), { ...entry("c"), rt: "" }, entry("d")]);
  assert.deepEqual(ids(vault.parseVault(raw)), ["a", "d"]);
});

test("parseVault respeita o limite de contas", () => {
  const many = Array.from({ length: 9 }, (_, i) => entry(`u${i}`));
  assert.equal(vault.parseVault(JSON.stringify(many)).length, vault.MAX_SAVED_ACCOUNTS);
});

test("encodeVault e decodeVault fazem ida e volta, e lixo vira lista vazia", () => {
  const list = [entry("a"), entry("b", { name: "Ação — ünï" })];
  assert.deepEqual(vault.decodeVault(vault.encodeVault(list)), list);
  assert.deepEqual(vault.decodeVault("%%%"), []);
  assert.deepEqual(vault.decodeVault(undefined), []);
});

test("upsertAccount poe a conta no topo sem duplicar", () => {
  const list = vault.upsertAccount([entry("a"), entry("b")], entry("b", { rt: "novo" }), "z");
  assert.deepEqual(ids(list), ["b", "a"]);
  assert.equal(list[0].rt, "novo");
});

test("upsertAccount nunca guarda a conta ativa", () => {
  assert.deepEqual(ids(vault.upsertAccount([entry("a"), entry("b")], entry("c"), "a")), ["c", "b"]);
  assert.deepEqual(ids(vault.upsertAccount([entry("a")], entry("b"), "b")), ["a"]);
});

test("upsertAccount corta no limite, descartando a mais antiga", () => {
  let list = [];
  for (let i = 0; i < 8; i += 1) list = vault.upsertAccount(list, entry(`u${i}`), "ativa");
  assert.equal(list.length, vault.MAX_SAVED_ACCOUNTS);
  assert.equal(list[0].id, "u7");
  assert.ok(!ids(list).includes("u0"));
});

test("withoutActive e removeAccount", () => {
  const list = [entry("a"), entry("b")];
  assert.deepEqual(ids(vault.withoutActive(list, "a")), ["b"]);
  assert.deepEqual(ids(vault.withoutActive(list, null)), ["a", "b"]);
  assert.deepEqual(ids(vault.removeAccount(list, "b")), ["a"]);
});

test("publicAccounts nunca expoe o refresh token", () => {
  const view = vault.publicAccounts([entry("a")]);
  assert.equal(view.length, 1);
  assert.ok(!("rt" in view[0]));
  assert.doesNotMatch(JSON.stringify(view), /rt-a/);
});
