const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs"), vm = require("node:vm"), ts = require("typescript");
function load(file, env = {}) {
 const exports = {};
 vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports, process: { env } });
 return exports;
}

test("a data do build vira dd/mm/aaaa e formatos estranhos sao ignorados", () => {
 const { formatBuildDate } = load("lib/version.ts");
 assert.equal(formatBuildDate("2026-11-17"), "17/11/2026");
 assert.equal(formatBuildDate(" 2026-01-05 "), "05/01/2026");
 assert.equal(formatBuildDate("17/11/2026"), null);
 assert.equal(formatBuildDate("<script>"), null);
 assert.equal(formatBuildDate(undefined), null);
});

test("em producao a versao vem do deploy e some sem ela", () => {
 const withVersion = load("lib/version.ts", { NODE_ENV: "production", NEXT_PUBLIC_APP_VERSION: " v1.2.0 ", NEXT_PUBLIC_APP_BUILD_DATE: "2026-11-17" });
 assert.deepEqual({ ...withVersion.getSiteVersion() }, { label: "v1.2.0", date: "17/11/2026" });
 const withoutDate = load("lib/version.ts", { NODE_ENV: "production", NEXT_PUBLIC_APP_VERSION: "3251b89" });
 assert.deepEqual({ ...withoutDate.getSiteVersion() }, { label: "3251b89", date: null });
 const bare = load("lib/version.ts", { NODE_ENV: "production" });
 assert.equal(bare.getSiteVersion(), null);
});

test("fora de producao, sem variavel, mostra 'desenvolvimento'", () => {
 const dev = load("lib/version.ts", { NODE_ENV: "development" });
 assert.deepEqual({ ...dev.getSiteVersion() }, { label: "desenvolvimento", date: null });
});

test("o rodape renderiza a versao a partir do modulo e nao de texto fixo", () => {
 const footer = fs.readFileSync("components/Footer.tsx", "utf8");
 assert.match(footer, /from "@\/lib\/version"/);
 assert.match(footer, /footer-version/);
});
