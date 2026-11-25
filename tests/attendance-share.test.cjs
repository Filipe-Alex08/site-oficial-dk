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
    exports, encodeURIComponent,
    require: (name) => name in mocks ? mocks[name] : require(name),
  });
  return exports;
}

const { normalizeWhatsapp, maskPhone, phoneFieldValue } = load("lib/phone.ts");
const { attendanceTally, buildShareText, whatsappShareUrl } = load("lib/attendance-share.ts");

const activity = { id: "1", title: "Treino", starts_at: "2026-12-01T22:00:00Z", location: "Sede" };
const roster = [
  { user_id: "a", nickname: "Alfa", rank: "cabo", member_kind: "membro", whatsapp: "5511999998888" },
  { user_id: "b", nickname: "Beta", rank: "recruta", member_kind: "membro", whatsapp: null },
];

test("normaliza o numero para o formato com codigo do pais", () => {
  assert.equal(normalizeWhatsapp("(11) 99999-8888"), "5511999998888");
  assert.equal(normalizeWhatsapp("011 99999-8888"), "5511999998888");
  assert.equal(normalizeWhatsapp("+55 11 99999-8888"), "5511999998888");
  assert.equal(normalizeWhatsapp("5511999998888"), "5511999998888");
  assert.equal(normalizeWhatsapp("(55) 99999-8888"), "5555999998888");
  assert.equal(normalizeWhatsapp("+1 202 555 0123"), "12025550123");
  assert.equal(normalizeWhatsapp("123"), null);
  assert.equal(normalizeWhatsapp("99999-8888"), null);
  assert.equal(normalizeWhatsapp("1".repeat(16)), null);
  assert.equal(normalizeWhatsapp("abc"), null);
});

test("a lista sai so com apelidos, sem numeros de celular", () => {
  const entries = [{ user_id: "a", nickname: "Alfa", rank: "cabo", response: "vai", guest_count: 0 }];
  const lines = buildShareText(activity, entries, roster).split("\n");
  const invocation = lines.slice(lines.findIndex((line) => line.includes("INVOCAÇÃO DK")));
  assert.ok(!lines.some((line) => line.includes("5511999998888")), "o numero nao vai para o grupo");
  assert.ok(invocation.includes("Beta> "));
  assert.ok(invocation.includes("Alfa> "));
  assert.ok(lines.includes("1. Alfa"), "a lista de presenca continua com apelidos");
  assert.equal(lines[0], "🏴‍☠️Death Knights🏴‍☠️");
});

test("o link do WhatsApp nao passa pelo wa.me e preserva os emojis", () => {
  const text = buildShareText(activity, [], roster);
  const url = whatsappShareUrl(text);
  const prefix = "https://api.whatsapp.com/send?text=";
  assert.ok(url.startsWith(prefix));
  assert.equal(decodeURIComponent(url.slice(prefix.length)), text);
  assert.ok(!url.includes("%EF%BF%BD"));
});

test("a mascara formata enquanto digita, sem travar o Backspace", () => {
  const typed = (text) => [...text].reduce((value, key) => maskPhone(value + key), "");
  assert.equal(typed("11999998888"), "(11) 99999-8888");
  assert.equal(typed("1133334444"), "(11) 3333-4444");
  assert.equal(typed("011999998888"), "(11) 99999-8888");
  assert.equal(typed("+5511999998888"), "+55 (11) 99999-8888");
  assert.equal(typed("+12025550123"), "+12025550123");
  assert.equal(maskPhone("5511999998888"), "+55 (11) 99999-8888", "colado sem o +");
  assert.equal(typed("119999988887777"), "(11) 99999-8888");
  for (const full of ["(11) 99999-8888", "+55 (11) 99999-8888", "+12025550123"]) {
    let value = full;
    for (let step = 0; value && step < 30; step++) value = maskPhone(value.slice(0, -1));
    assert.equal(value, "", full);
  }
});

test("o numero salvo volta ao campo e normaliza para o mesmo valor", () => {
  for (const stored of ["5511999998888", "551133334444", "5555999998888", "12025550123"]) {
    assert.equal(normalizeWhatsapp(phoneFieldValue(stored)), stored);
  }
  assert.equal(phoneFieldValue("5511999998888"), "(11) 99999-8888");
});

test("a invocacao segue o padrao da lista manual", () => {
  const member = (nickname, rank) => ({ user_id: nickname, nickname, rank, member_kind: "membro" });
  // Fora de ordem de proposito: quem manda na ordem e o padrao.
  const text = buildShareText(activity, [], [
    member("Allana", "recruta"), member("Diogo", "soldado"), member("Eli", "tenente"), member("Geovana", "tenente"),
    member("Vesemir", "subtenente"), member("Brigada", "general_brigada"), member("Hasufel", "general_exercito"),
  ]);
  assert.deepEqual(text.slice(text.indexOf("💀👁️‍🗨️INVOCAÇÃO DK")).split(/\r?\n/), [
    "💀👁️‍🗨️INVOCAÇÃO DK👁️‍🗨️💀",
    "", "⚜️GENERAL:", "Hasufel> ", "Brigada> ",
    "", "⭐TENENTE", "Eli> ", "Geovana> ",
    "", "✴️*SUBTENENTE:*", "Vesemir> ",
    "", "SOLDADO", "Diogo> ",
    "", "Recruta:", "Allana> ",
  ]);
});

test("toda patente do site tem um grupo na invocacao", () => {
  const ranks = [...fs.readFileSync("lib/types.ts", "utf8").match(/export type DkRank =([^;]+);/)[1].matchAll(/"([a-z_]+)"/g)].map((match) => match[1]);
  assert.equal(ranks.length, 15);
  for (const rank of ranks) {
    const text = buildShareText(activity, [], [{ user_id: rank, nickname: "membro-" + rank, rank, member_kind: "membro" }]);
    assert.ok(text.includes("membro-" + rank + "> "), rank);
  }
});

test("o placar conta quem vai, quem nao vai e quem nao respondeu", () => {
  const member = (user_id) => ({ user_id, nickname: user_id, rank: "recruta", member_kind: "membro" });
  const entry = (user_id, response, guest_count = 0) => ({ user_id, nickname: user_id, rank: "recruta", response, guest_count });
  // "fora" respondeu mas nao esta mais no roster: conta na resposta, nunca como pendente.
  const tally = attendanceTally(
    [entry("a", "vai", 2), entry("b", "nao_vai"), entry("fora", "vai", 1)],
    ["a", "b", "d", "c"].map(member),
  );
  assert.equal(tally.going, 2);
  assert.equal(tally.guests, 3);
  assert.equal(tally.notGoing, 1);
  assert.deepEqual([...tally.pending.map((item) => item.user_id)], ["c", "d"]);
  assert.equal(attendanceTally([], []).pending.length, 0);
});
