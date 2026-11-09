const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const moduleExports = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("lib/member-access.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: moduleExports });
const { getMemberTheme } = moduleExports;

test("uses the approved graduation even when the order is missing", () => {
  for (const graduation_order of [null, undefined, "", "Outra ordem", "Cavalaria", "Arquearia", "Ordem dos Cavaleiros", "Cavaleiro", "Cavaleira", "Arqueiro", "Arqueira", "Ordem dos Arqueiros", " ORDEM DOS CAVALEIROS "]) {
    for (const graduation_level of ["bronze", "prata", "ouro"]) {
      assert.equal(getMemberTheme({ status: "aprovado", graduation_order, graduation_level }), graduation_level, graduation_order);
    }
  }
});

test("keeps the default theme without an eligible approved graduation", () => {
  const profile = { status: "aprovado", graduation_order: "Ordem dos Cavaleiros", graduation_level: "ouro" };
  for (const candidate of [null, undefined,
    { ...profile, graduation_level: "sem_graduacao" },
    ...["pendente", "suspenso", "recusado", "desativado"].map(status => ({ ...profile, status })),
  ]) assert.equal(getMemberTheme(candidate), "padrao");
});

test("follows the highest graduation across Cavalaria and Arquearia", () => {
  const base = { status: "aprovado", graduation_level: "sem_graduacao" };
  const cases = [
    [{ graduation_cavalaria: "bronze", graduation_arquearia: "prata" }, "prata"],
    [{ graduation_cavalaria: "ouro", graduation_arquearia: "bronze" }, "ouro"],
    [{ graduation_cavalaria: "prata", graduation_arquearia: "prata" }, "prata"],
    [{ graduation_cavalaria: "sem_graduacao", graduation_arquearia: "bronze" }, "bronze"],
    [{ graduation_cavalaria: "ouro", graduation_arquearia: "sem_graduacao" }, "ouro"],
    [{ graduation_cavalaria: "sem_graduacao", graduation_arquearia: "sem_graduacao" }, "padrao"],
  ];
  for (const [tracks, expected] of cases) assert.equal(getMemberTheme({ ...base, ...tracks }), expected, JSON.stringify(tracks));
});

test("tracks win over the legacy level, which only applies when tracks are missing", () => {
  // Quem estava "a revisar" tem o nível antigo preenchido e as trilhas zeradas.
  assert.equal(getMemberTheme({ status: "aprovado", graduation_level: "ouro", graduation_cavalaria: "sem_graduacao", graduation_arquearia: "sem_graduacao" }), "padrao");
  assert.equal(getMemberTheme({ status: "aprovado", graduation_level: "ouro" }), "ouro");
});

test("never themes a member who is not approved, whatever the tracks say", () => {
  for (const status of ["pendente", "suspenso", "recusado", "desativado"]) {
    assert.equal(getMemberTheme({ status, graduation_cavalaria: "ouro", graduation_arquearia: "ouro" }), "padrao");
  }
});
