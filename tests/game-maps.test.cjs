const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file) {
  const exportsMap = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, { exports: exportsMap, process: { env: {} } });
  return exportsMap;
}

const { games } = load("lib/content.ts");
const { gameCatalogMetadata } = load("lib/game-catalog.ts");
const { gameFieldMaps } = load("lib/game-maps.ts");

const expectedMaps = new Map([
  ["Captura da Bandeira", "/images/games/maps/captura-da-bandeira.webp"],
  ["Trollball", "/images/games/maps/trollball.webp"],
  ["Batalha Campal", "/images/games/maps/batalha-campal.webp"],
  ["Archery Tag", "/images/games/maps/archery-tag.webp"],
  ["Guerra-pelas-Fitas", "/images/games/maps/guerra-pelas-fitas.webp"],
  ["Batalha de Campo com Conquista", "/images/games/maps/batalha-de-campo-com-conquista.webp"],
  ["Mate o Rei", "/images/games/maps/mate-o-rei.webp"],
  ["Rapto da Princesa", "/images/games/maps/rapto-da-princesa.webp"],
  ["Defesa da Vila", "/images/games/maps/defesa-da-vila.webp"],
  ["Duelo de Arqueiros", "/images/games/maps/duelo-de-arqueiros.webp"],
  ["Batalha de Cerco", "/images/games/maps/batalha-de-cerco.webp"],
  ["Rei da Mesa", "/images/games/maps/rei-da-mesa.webp"],
]);

test("every Swordplay game has the correct permanent field map", () => {
  assert.equal(games.length, expectedMaps.size);

  for (const game of games) {
    const fieldMap = gameFieldMaps[game.id];
    assert.equal(fieldMap?.src, expectedMaps.get(game.name), game.name);
    assert.ok(fieldMap.alt.length > 20, game.name);
    assert.ok(fieldMap.width > 0 && fieldMap.height > 0, game.name);
    assert.ok(fs.existsSync(`public${fieldMap.src}`), game.name);
  }

  assert.equal(new Set(Object.values(gameFieldMaps).map((fieldMap) => fieldMap.src)).size, games.length);
});

test("every game has a unique, URL-safe slug", () => {
  const slugs = games.map((game) => game.slug);
  assert.equal(new Set(slugs).size, games.length);
  for (const slug of slugs) assert.match(slug, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
});

test("every game belongs to a supported catalog category", () => {
  const supported = new Set(["objetivos", "batalhas", "arquearia", "duelos"]);
  const represented = new Set();

  for (const game of games) {
    const categories = gameCatalogMetadata[game.id]?.categories;
    assert.ok(Array.isArray(categories) && categories.length > 0, game.name);
    assert.equal(new Set(categories).size, categories.length, game.name);
    for (const category of categories) {
      assert.ok(supported.has(category), `${game.name}: ${category}`);
      represented.add(category);
    }
  }

  assert.equal(Object.keys(gameCatalogMetadata).length, games.length);
  assert.deepEqual([...represented].sort(), [...supported].sort());
});

test("game details follow the approved information hierarchy", () => {
  const component = fs.readFileSync("components/GameCard.tsx", "utf8");
  const sections = [
    "Objetivo",
    "Equipes e papéis",
    "Regras",
    "Condição de vitória",
    "Equipamentos permitidos",
    "Segurança",
  ];
  let previous = -1;

  for (const section of sections) {
    const position = component.indexOf(`<h3>${section}</h3>`);
    assert.ok(position > previous, section);
    previous = position;
  }

  assert.match(component, /className="game-details-grid"/);
  assert.match(component, /Abrir mapa do campo/);
  assert.doesNotMatch(component, /<h3>Como jogar<\/h3>/);
  assert.doesNotMatch(component, /<h3>Formação das equipes<\/h3>/);
});
