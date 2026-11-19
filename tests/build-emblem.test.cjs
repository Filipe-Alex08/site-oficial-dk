const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports, Math });
  return exports;
}

const { getBuildKey, getBuildIcon, buildOptions, normalizeBuildName } = load("lib/insignias.ts");
const { wreathLeaves, leafTip, leafPath, wreathStemPath, defaultWreath } = load("lib/wreath.ts");

test("as quatro opções de build do cadastro viram a chave certa", () => {
  assert.deepEqual(Array.from(buildOptions, (option) => getBuildKey(option)), ["arqueiro", "dual", "escudeiro", "lanceiro"]);
});

test("a chave ignora acento, caixa e gênero, e texto livre sem build conhecida vira null", () => {
  for (const [text, key] of [["ARQUEIRA", "arqueiro"], ["  Dual Wield ", "dual"], ["Tanque", "escudeiro"], ["Pontuador", "escudeiro"], ["Lança", "lanceiro"], ["Lanceiro de Ofício", "lanceiro"]]) {
    assert.equal(getBuildKey(text), key, text);
  }
  for (const text of [null, undefined, "", "   ", "Mago", "Curandeiro"]) assert.equal(getBuildKey(text), null, String(text));
});

test("as opções de build não trazem parênteses nem o complemento 'de Ofício'", () => {
  assert.deepEqual(Array.from(buildOptions), ["Arqueiro", "Dual", "Escudeiro Tank ou Pontuador", "Lanceiro"]);
  for (const option of buildOptions) assert.equal(normalizeBuildName(option), option);
});

test("nomes antigos salvos nos perfis são normalizados na exibição e no formulário", () => {
  for (const [saved, shown] of [
    ["Dual (Espadas, Adagas)", "Dual"], ["dual (espadas)", "dual"], ["Dual  (Espadas, Adagas) ", "Dual"],
    ["Lanceiro de Ofício", "Lanceiro"], ["lanceiro de oficio", "Lanceiro"], ["LANCEIRA DE OFICIO", "Lanceiro"],
    ["Escudeiro Tank ou Pontuador", "Escudeiro Tank ou Pontuador"], ["Mago (arcano)", "Mago"], ["  Arqueiro ", "Arqueiro"],
  ]) assert.equal(normalizeBuildName(saved), shown, saved);
  for (const empty of [null, undefined, "", "   "]) assert.equal(normalizeBuildName(empty), "");
});

test("a normalização não muda qual ícone e qual emblema a build recebe", () => {
  for (const saved of ["Dual (Espadas, Adagas)", "Lanceiro de Ofício", "Escudeiro Tank ou Pontuador", "Arqueiro"]) {
    assert.equal(getBuildKey(normalizeBuildName(saved)), getBuildKey(saved), saved);
  }
});

test("o ícone da build continua saindo da mesma regra da chave", () => {
  for (const text of ["Arqueiro", "Dual", "Tank", "Lanceiro"]) {
    assert.equal(getBuildIcon(text), `/images/insignias/builds/${getBuildKey(text)}.webp`);
  }
  assert.equal(getBuildIcon("Mago"), null);
});

test("o laurel tem duas folhas (fora e dentro) por posição, tudo dentro do quadrado", () => {
  const leaves = wreathLeaves(defaultWreath);
  assert.equal(leaves.length, defaultWreath.steps * 2);
  assert.equal(leaves.filter((leaf) => leaf.side === "out").length, defaultWreath.steps);
  for (const leaf of leaves) {
    for (const point of [{ x: leaf.x, y: leaf.y }, leafTip(leaf)]) {
      assert.ok(point.x >= 0 && point.x <= defaultWreath.size, `x ${point.x}`);
      assert.ok(point.y >= 0 && point.y <= defaultWreath.size, `y ${point.y}`);
    }
  }
});

test("as folhas ficam presas à haste e encolhem em direção ao topo", () => {
  const leaves = wreathLeaves(defaultWreath);
  const center = defaultWreath.size / 2;
  for (const leaf of leaves) {
    assert.ok(Math.abs(Math.hypot(leaf.x - center, leaf.y - center) - defaultWreath.radius) < 1e-6);
  }
  assert.ok(leaves.at(-1).length < leaves[0].length);
  assert.ok(Math.abs(leaves.at(-1).length / leaves[0].length - defaultWreath.taper) < 1e-6);
});

test("o ramo esquerdo fica à esquerda do centro e sobe até perto do topo", () => {
  const leaves = wreathLeaves(defaultWreath);
  const center = defaultWreath.size / 2;
  const bases = leaves.filter((leaf) => leaf.side === "out");
  assert.ok(bases.slice(1).every((leaf) => leaf.x < center));
  assert.ok(bases.at(-1).y < center - defaultWreath.radius * 0.9);
  assert.ok(bases[0].y > center + defaultWreath.radius * 0.8);
});

test("o desenho da folha e da haste é SVG válido de uma passada", () => {
  assert.match(leafPath(40, 12), /^M0 0C[\d. -]+C[\d. -]+Z$/);
  assert.match(wreathStemPath(defaultWreath), /^M[\d. ]+A150 150 0 1 1 [\d. ]+$/);
});
