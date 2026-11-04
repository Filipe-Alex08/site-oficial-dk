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
