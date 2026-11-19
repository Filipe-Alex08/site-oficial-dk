const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText, { exports, URL, console, process, Intl, Date });
  return exports;
}

const { buildInstagramTitle, isLegacyInstagramTitle, normalizeInstagramPost } = load("lib/instagram-apify.ts");
const DATE = "2026-10-10T15:00:00.000Z";
const photo = [{ type: "image", url: "https://x/a.jpg", caption: null }];
const title = (caption, media = photo) => buildInstagramTitle(caption, DATE, media);

test("hook curto ganha a linha seguinte como complemento, sem emoji nem hashtag", () => {
  const result = title("terapia em dia ⚔️💜\n\nTem coisa que só quem é do DK entende! Um pouco de treino, resenha e espadada pra colocar a cabeça no lugar.\n\n#dkbh #swordplay #terapia");
  assert.equal(result.title, "Terapia em dia — Tem coisa que só quem é do DK entende!");
});

test("primeira frase completa vira o título e o resumo continua dali", () => {
  const result = title("Treino de hoje no parque!\nMuita gente nova chegando e aprendendo.\n#dkbh");
  assert.equal(result.title, "Treino de hoje no parque!");
  assert.equal(result.rest, "Muita gente nova chegando e aprendendo.");
});

test("título longo é cortado em palavra inteira e o resumo usa a legenda toda", () => {
  const result = title("Mais um domingo de treino com cavalaria, arquearia e muita resenha no Parque Ecológico da Pampulha, venha conhecer");
  assert.ok(result.title.endsWith("…"));
  assert.ok(result.title.length <= 73);
  assert.equal(result.title, "Mais um domingo de treino com cavalaria, arquearia e muita resenha no…");
  assert.equal(result.rest, null);
});

test("legenda sem texto aproveitável descreve a mídia e a data", () => {
  assert.equal(title("").title, "Foto de 10 de outubro de 2026");
  assert.equal(title("#dkbh #swordplay ⚔️").title, "Foto de 10 de outubro de 2026");
  assert.equal(title("https://youtu.be/abc", [{ type: "video", url: "https://x/a.mp4", caption: null }]).title, "Vídeo de 10 de outubro de 2026");
  assert.equal(title("", [...photo, { type: "video", url: "https://x/a.mp4", caption: null }]).title, "Fotos e vídeos de 10 de outubro de 2026");
});

test("a data do título usa o fuso de Belo Horizonte", () => {
  // 01h UTC ainda é o dia anterior no Brasil.
  assert.equal(buildInstagramTitle("", "2026-10-11T01:00:00.000Z", photo).title, "Foto de 10 de outubro de 2026");
});

test("só o título antigo do importador é reconhecido como substituível", () => {
  assert.equal(isLegacyInstagramTitle("Instagram — 10/10/2026"), true);
  assert.equal(isLegacyInstagramTitle("Instagram — 10/10/26"), true);
  assert.equal(isLegacyInstagramTitle("Treino de cavalaria"), false);
  assert.equal(isLegacyInstagramTitle("Instagram — encontro mensal"), false);
});

test("a publicação importada sai com título da legenda e resumo sem repeti-lo", () => {
  const post = normalizeInstagramPost({
    shortCode: "ABC123", caption: "Aulão de fundamentos!\nVenha aprender a segurar a espada do jeito certo. #dkbh",
    displayUrl: "https://cdn.example/a.jpg", takenAtIso: DATE, ownerUsername: "dk",
  }, "dk");
  assert.equal(post.title, "Aulão de fundamentos!");
  assert.equal(post.excerpt, "Venha aprender a segurar a espada do jeito certo. #dkbh");
  assert.equal(post.content.startsWith("Aulão de fundamentos!"), true);
});
