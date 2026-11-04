const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"), vm = require("node:vm"), ts = require("typescript");
function load(file, env = {}, mocks = {}) {
 const exports = {};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports, URL, process: { env }, require: name => mocks[name] ?? require(name) });
 return exports;
}
const seo = load("lib/seo.ts");
test("canonical and sharing metadata use the supplied public origin", () => {
 const meta = seo.pageMetadata("Jogos", "Descrição", "/atividades/jogos");
 assert.equal(seo.siteUrl, "https://death-knights.com.br");
 assert.equal(meta.alternates.canonical, "/atividades/jogos");
 assert.equal(meta.openGraph.url, meta.alternates.canonical);
 assert.ok(fs.existsSync("public" + meta.openGraph.images[0].url));
});
test("JSON-LD cannot terminate its script element with stored content", () => {
 const payload = { title: "</script><script>alert(1)</script>" };
 const json = seo.jsonLd(payload);
 assert.equal(json.includes("<"), false);
 assert.deepEqual(JSON.parse(json), payload);
});
test("robots allows production but keeps development and preview out", () => {
 const prod = load("app/robots.ts", { NODE_ENV: "production" }, { "@/lib/seo": seo }).default();
 assert.equal(prod.sitemap, seo.siteUrl + "/sitemap.xml");
 for (const env of [{ NODE_ENV: "development" }, { NODE_ENV: "production", VERCEL_ENV: "preview" }]) {
  assert.equal(load("app/robots.ts", env, { "@/lib/seo": seo }).default().rules.disallow, "/");
 }
});
test("sitemap excludes private pages, redirects and demo publications", async () => {
 const entries = await load("app/sitemap.ts", {}, { "@/lib/seo": seo, "@supabase/supabase-js": {} }).default();
 assert.equal(entries.length, 8);
 assert.equal(new Set(entries.map(entry => entry.url)).size, 8);
 assert.ok(entries.every(entry => entry.url.startsWith(seo.siteUrl) && !/membro|admin|login/.test(entry.url)));
});
