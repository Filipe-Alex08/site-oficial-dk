const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

const exportsMap = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync("lib/insignias.ts", "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
}).outputText, { exports: exportsMap });
const { rankIcons, getBuildIcon, getGraduationIcon, getGraduationTrack } = exportsMap;

test("all mapped insignia files exist in the permanent public directory", () => {
  const paths = Object.values(rankIcons).filter(Boolean);
  for (const level of ["bronze", "prata", "ouro"]) {
    for (const track of ["cavalaria", "arquearia"]) paths.push(getGraduationIcon(level, track));
  }
  for (const build of ["Arqueiro", "Dual", "Escudeiro", "Lanceiro de Ofício"]) paths.push(getBuildIcon(build));
  for (const path of paths) assert.ok(fs.existsSync(`public${path}`), path);
});

test("recognizes track names without inventing an order for missing or ambiguous profiles", () => {
  assert.equal(getGraduationTrack("Ordem dos Cavaleiros"), "cavalaria");
  assert.equal(getGraduationTrack("ARQUEIRA"), "arquearia");
  assert.equal(getGraduationTrack("Arquearia"), "arquearia");
  assert.equal(getGraduationTrack(null), null);
  assert.equal(getGraduationTrack("Outra ordem"), null);
  assert.equal(getGraduationTrack("Cavalaria e Arquearia"), null);
  assert.equal(getGraduationIcon("sem_graduacao", "cavalaria"), null);
  assert.equal(getGraduationIcon("bronze", null), null);
});

test("all archery levels use the same intact master drawing", () => {
  assert.equal(getGraduationIcon("prata", "arquearia"), getGraduationIcon("bronze", "arquearia"));
  assert.equal(getGraduationIcon("ouro", "arquearia"), getGraduationIcon("bronze", "arquearia"));
});

test("build aliases match their supplied icons and unknown builds retain their text", () => {
  for (const [alias, canonical] of [["Arqueira", "Arqueiro"], ["Duais", "Dual"], ["Tank", "Escudeiro"], ["Pontuador", "Escudeiro"], ["Lanceiro de Ofício", "Lanceiro"]]) {
    assert.equal(getBuildIcon(alias), getBuildIcon(canonical));
  }
  assert.equal(getBuildIcon("Build personalizada"), null);
  assert.equal(getBuildIcon(null), null);
});
