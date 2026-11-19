const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, mocks = {}, env = {}) {
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports, Request, Response, console, process: { env },
    require: (name) => (name in mocks ? mocks[name] : require(name)),
  });
  return exports;
}

const style = load("lib/member-style.ts");
const { parseMemberStyle, isMemberStyle, effectiveMemberTheme, MEMBER_STYLE_COOKIE, MEMBER_STYLE_COOKIE_OPTIONS } = style;

test("sem cookie ou com valor estranho, segue a graduação", () => {
  for (const value of [undefined, null, "", "graduacao", "PADRAO", "ouro", "padrao ", "1"]) {
    assert.equal(parseMemberStyle(value), "graduacao", String(value));
  }
  assert.equal(parseMemberStyle("padrao"), "padrao");
});

test("ao gravar, só os dois valores exatos são aceitos", () => {
  assert.equal(isMemberStyle("graduacao"), true);
  assert.equal(isMemberStyle("padrao"), true);
  for (const value of [undefined, null, "", "Padrao", "ouro", 1, {}, ["padrao"]]) assert.equal(isMemberStyle(value), false, String(value));
});

test("o padrão escolhido vence qualquer graduação; seguir a graduação devolve o tema dela", () => {
  for (const theme of ["padrao", "bronze", "prata", "ouro"]) {
    assert.equal(effectiveMemberTheme("padrao", theme), "padrao");
    assert.equal(effectiveMemberTheme("graduacao", theme), theme);
  }
});

test("o cookie dura um ano, vale no site todo e o navegador não o lê", () => {
  assert.equal(MEMBER_STYLE_COOKIE_OPTIONS.maxAge, 31_536_000);
  assert.equal(MEMBER_STYLE_COOKIE_OPTIONS.path, "/");
  assert.equal(MEMBER_STYLE_COOKIE_OPTIONS.httpOnly, true);
  assert.equal(MEMBER_STYLE_COOKIE_OPTIONS.sameSite, "lax");
});

function route(sameOrigin = true) {
  return load("app/api/member/style/route.ts", {
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "@/lib/api-guard": { forbidden: () => Response.json({}, { status: 403 }), isSameOriginRequest: () => sameOrigin },
    "@/lib/member-style": style,
    "@/lib/supabase/cookie-options": { SUPABASE_COOKIE_OPTIONS: { secure: true } },
  });
}

// O mock de NextResponse devolve uma Response comum, sem .cookies: acrescenta um espião.
function withCookieSpy(mod) {
  const sets = [];
  const original = Response.json;
  Response.json = (body, init) => {
    const response = original.call(Response, body, init);
    response.cookies = { set: (name, value, options) => sets.push({ name, value, options }) };
    return response;
  };
  return { sets, restore: () => { Response.json = original; }, post: (body) => mod.POST(new Request("https://dk.test/api/member/style", { method: "POST", body: typeof body === "string" ? body : JSON.stringify(body) })) };
}

test("a rota grava o cookie com os atributos certos", async () => {
  const spy = withCookieSpy(route());
  try {
    const response = await spy.post({ style: "padrao" });
    assert.equal(response.status, 200);
    assert.equal(spy.sets.length, 1);
    assert.equal(spy.sets[0].name, MEMBER_STYLE_COOKIE);
    assert.equal(spy.sets[0].value, "padrao");
    assert.deepEqual({ ...spy.sets[0].options }, { path: "/", httpOnly: true, sameSite: "lax", maxAge: 31_536_000, secure: true });
  } finally { spy.restore(); }
});

test("a rota recusa valor inválido, corpo quebrado e requisição de outra origem", async () => {
  for (const [body, same, status] of [[{ style: "ouro" }, true, 400], ["{nao-json", true, 400], [{}, true, 400], [{ style: "padrao" }, false, 403]]) {
    const spy = withCookieSpy(route(same));
    try {
      const response = await spy.post(body);
      assert.equal(response.status, status, JSON.stringify(body));
      assert.equal(spy.sets.length, 0);
    } finally { spy.restore(); }
  }
});
