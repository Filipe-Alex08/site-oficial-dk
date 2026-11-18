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

test("o cookie de sessao e HttpOnly, SameSite=Lax e Secure sob HTTPS", () => {
  const options = load("lib/supabase/cookie-options.ts", {}, { NEXT_PUBLIC_SITE_URL: "https://dk.test" }).SUPABASE_COOKIE_OPTIONS;
  assert.equal(options.httpOnly, true);
  assert.equal(options.sameSite, "lax");
  assert.equal(options.secure, true);
});

test("nenhum codigo do navegador le o cookie de sessao", () => {
  const files = [];
  (function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(path);
      else if (/\.(ts|tsx)$/.test(entry.name)) files.push(path);
    }
  })("components");
  for (const file of files) {
    const source = fs.readFileSync(file, "utf8");
    assert.doesNotMatch(source, /document\.cookie|createBrowserClient/, file);
  }
});

for (const [name, file, call] of [
  ["POST /api/auth/logout", "app/api/auth/logout/route.ts", (route) => route.POST(new Request("https://dk.test/api/auth/logout", { method: "POST", headers: { "x-dk-client": "1" } }))],
  ["POST /auth/signout", "app/auth/signout/route.ts", (route) => route.POST()],
]) {
  test(`${name} encerra so a sessao deste aparelho`, async () => {
    const scopes = [];
    const supabase = { auth: { signOut: async (opts) => { scopes.push(opts?.scope); return { error: null }; } } };
    const route = load(file, {
      "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
      "@/lib/api-guard": { forbidden: () => Response.json({}, { status: 403 }), isSameOriginRequest: () => true },
      "@/lib/supabase/server": { createClient: async () => supabase },
    });
    await call(route);
    assert.deepEqual(scopes, ["local"]);
  });
}
