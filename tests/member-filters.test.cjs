const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, requireMap = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(source, { exports, require: (name) => requireMap[name] }, { filename: file });
  return exports;
}

const access = load("lib/member-access.ts");
const filters = load("lib/member-filters.ts", { "@/lib/member-access": access });
const { matchesRank, matchesGraduation, matchesSearch, rankFilterOptions, graduationFilterOptions, trackFilterOptions } = filters;

const member = (overrides = {}) => ({
  nickname: "Fulano", full_name: "Fulano de Tal", email: "fulano@dk.com", rank: "soldado",
  graduation_cavalaria: "sem_graduacao", graduation_arquearia: "sem_graduacao",
  commander_cavalaria: false, commander_arquearia: false,
  ...overrides,
});

test("patente: exata e por grupo", () => {
  assert.equal(matchesRank(member({ rank: "cabo" }), "todas"), true);
  assert.equal(matchesRank(member({ rank: "cabo" }), "cabo"), true);
  assert.equal(matchesRank(member({ rank: "cabo" }), "soldado"), false);
  assert.equal(matchesRank(member({ rank: "cabo" }), "grupo:Praças"), true);
  assert.equal(matchesRank(member({ rank: "tenente" }), "grupo:Praças"), false);
  assert.equal(matchesRank(member({ rank: "general_exercito" }), "grupo:Oficiais Generais"), true);
});

test("opcoes de patente: grupo 'Todos' so onde ha mais de uma patente", () => {
  const values = rankFilterOptions.map((option) => option.value);
  assert.equal(values[0], "todas");
  assert.ok(values.includes("grupo:Praças"));
  assert.ok(!values.includes("grupo:Condição inicial"));
  assert.ok(values.includes("recruta"));
  // Arrays criados dentro do vm tem outro prototype: Array.from normaliza para o deepEqual estrito.
  assert.deepEqual(Array.from(graduationFilterOptions, (option) => option.value), ["todas", "sem_graduacao", "bronze", "prata", "ouro"]);
  assert.deepEqual(Array.from(trackFilterOptions, (option) => option.value), ["qualquer", "cavalaria", "arquearia"]);
});

test("graduacao: por nivel em qualquer trilha ou numa trilha especifica", () => {
  const m = member({ graduation_cavalaria: "prata" });
  assert.equal(matchesGraduation(m, "todas", "qualquer"), true);
  assert.equal(matchesGraduation(m, "prata", "qualquer"), true);
  assert.equal(matchesGraduation(m, "prata", "cavalaria"), true);
  assert.equal(matchesGraduation(m, "prata", "arquearia"), false);
  assert.equal(matchesGraduation(m, "ouro", "qualquer"), false);
});

test("sem graduacao: qualquer trilha exige nenhuma graduada; trilha especifica olha so ela", () => {
  const m = member({ graduation_cavalaria: "bronze" });
  assert.equal(matchesGraduation(m, "sem_graduacao", "qualquer"), false);
  assert.equal(matchesGraduation(m, "sem_graduacao", "arquearia"), true);
  assert.equal(matchesGraduation(m, "sem_graduacao", "cavalaria"), false);
  assert.equal(matchesGraduation(member(), "sem_graduacao", "qualquer"), true);
});

test("comandante: so conta com graduacao na trilha", () => {
  const cmd = member({ graduation_arquearia: "ouro", commander_arquearia: true });
  assert.equal(matchesGraduation(cmd, "todas", "qualquer", true), true);
  assert.equal(matchesGraduation(cmd, "todas", "arquearia", true), true);
  assert.equal(matchesGraduation(cmd, "todas", "cavalaria", true), false);
  assert.equal(matchesGraduation(member({ commander_cavalaria: true }), "todas", "qualquer", true), false);
  assert.equal(matchesGraduation(member({ graduation_cavalaria: "ouro" }), "todas", "qualquer", true), false);
});

test("nivel + comandante combinam na mesma trilha", () => {
  const cmd = member({ graduation_arquearia: "ouro", commander_arquearia: true });
  assert.equal(matchesGraduation(cmd, "ouro", "qualquer", true), true);
  assert.equal(matchesGraduation(cmd, "prata", "qualquer", true), false);
  assert.equal(matchesGraduation(cmd, "ouro", "cavalaria", true), false);
  // Ouro numa trilha e comando na outra nao e "ouro comandante".
  const split = member({ graduation_cavalaria: "ouro", graduation_arquearia: "bronze", commander_arquearia: true });
  assert.equal(matchesGraduation(split, "ouro", "qualquer", true), false);
  assert.equal(matchesGraduation(split, "bronze", "qualquer", true), true);
  assert.equal(matchesGraduation(split, "ouro", "qualquer", false), true);
  // Sem graduacao nunca e comandante.
  assert.equal(matchesGraduation(member(), "sem_graduacao", "qualquer", true), false);
});

test("perfil antigo sem trilhas usa a graduacao unica", () => {
  const legacy = { nickname: "Velho", full_name: "Velho", rank: "cabo", graduation_level: "ouro" };
  assert.equal(matchesGraduation(legacy, "ouro", "qualquer"), true);
  assert.equal(matchesGraduation(legacy, "sem_graduacao", "qualquer"), false);
  assert.equal(matchesGraduation({ ...legacy, graduation_level: "sem_graduacao" }, "sem_graduacao", "qualquer"), true);
});

test("busca: apelido, nome, e-mail e nome da patente", () => {
  const m = member({ rank: "terceiro_sargento" });
  assert.equal(matchesSearch(m, ""), true);
  assert.equal(matchesSearch(m, "  FULANO "), true);
  assert.equal(matchesSearch(m, "dk.com"), true);
  assert.equal(matchesSearch(m, "sargento"), true);
  assert.equal(matchesSearch(m, "capitão"), false);
  assert.equal(matchesSearch({ ...m, email: null }, "tal"), true);
});
