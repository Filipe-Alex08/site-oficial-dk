const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, mocks = {}, env = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports, URL, URLSearchParams, Request, Response, console, setTimeout, clearTimeout, Promise, Date, JSON, Math, Number,
    process: { env },
    require: (name) => name in mocks ? mocks[name] : require(name),
  });
  return exports;
}

const sanitize = load("lib/log-sanitize.ts");
const clientIp = load("lib/client-ip.ts");

test("detalhes escondem chaves que parecem segredo, em qualquer profundidade", () => {
  const out = sanitize.sanitizeDetails({
    email: "a***@dk.test", password: "123", novaSenha: "x", nested: { access_token: "t", ok: 1 }, invite_code: "DK-1", lista: [{ cookie: "c" }],
  });
  assert.equal(out.email, "a***@dk.test");
  assert.equal(out.password, "[oculto]");
  assert.equal(out.novaSenha, "[oculto]");
  assert.equal(out.invite_code, "[oculto]");
  assert.equal(out.nested.access_token, "[oculto]");
  assert.equal(out.nested.ok, 1);
  assert.equal(out.lista[0].cookie, "[oculto]");
});

test("strings longas e objetos enormes sao cortados", () => {
  assert.ok(sanitize.sanitizeDetails({ texto: "x".repeat(5000) }).texto.length <= 2049);
  const huge = {};
  for (let i = 0; i < 40; i++) huge[`k${i}`] = "y".repeat(2000);
  const out = sanitize.sanitizeDetails(huge);
  assert.equal(out.truncado, true);
  assert.ok(JSON.stringify(out).length < 9000);
});

test("JWT e cabecalho Bearer sao removidos de textos livres", () => {
  const jwt = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.abcdefghijk";
  const text = sanitize.redactText(`falhou com ${jwt} e Bearer abc.def-123`);
  assert.ok(!text.includes("eyJhbGci"));
  assert.ok(!text.includes("abc.def-123"));
});

test("valores nao objeto viram objeto e nulos viram vazio", () => {
  assert.deepEqual({ ...sanitize.sanitizeDetails(undefined) }, {});
  assert.deepEqual({ ...sanitize.sanitizeDetails("oi") }, { valor: "oi" });
});

test("e-mail mascarado mantem so a inicial e o dominio", () => {
  assert.equal(sanitize.maskEmail("Maria@dk.test"), "M***@dk.test");
  assert.equal(sanitize.maskEmail("sem-arroba"), "***");
});

test("IP do cliente vem do Cloudflare ou do ultimo salto, nunca do primeiro", () => {
  const req = (headers) => new Request("https://dk.test/x", { headers });
  assert.equal(clientIp.getClientIp(req({ "cf-connecting-ip": "203.0.113.9" })), "203.0.113.9");
  assert.equal(clientIp.getClientIp(req({ "x-forwarded-for": "6.6.6.6, 198.51.100.4" })), "198.51.100.4");
  assert.equal(clientIp.getClientIp(req({ "cf-connecting-ip": "nao-e-ip" })), "unknown");
});

function loadAppLog({ failInsert = false } = {}) {
  const inserted = [];
  const admin = { from: (table) => ({ insert: async (rows) => { if (failInsert) throw new Error("db fora"); inserted.push({ table, rows }); return {}; } }) };
  const mod = load("lib/app-log.ts", {
    "@/lib/supabase/admin": { createAdminClient: () => admin },
    "@/lib/client-ip": clientIp,
    "@/lib/log-sanitize": sanitize,
  });
  return { mod, inserted };
}

test("logEventNow grava em app_logs com IP, caminho sem query e detalhes saneados", async () => {
  const { mod, inserted } = loadAppLog();
  await mod.logEventNow({
    level: "aviso", category: "auth", action: "login_falhou", message: "falhou Bearer segredo123",
    request: new Request("https://dk.test/api/auth/login?token=zzz", { headers: { "cf-connecting-ip": "203.0.113.9" } }),
    details: { password: "123", email: "a***@dk.test" },
  });
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].table, "app_logs");
  const row = inserted[0].rows[0];
  assert.equal(row.level, "aviso");
  assert.equal(row.source, "evento");
  assert.equal(row.ip, "203.0.113.9");
  assert.equal(row.path, "/api/auth/login");
  assert.ok(!row.message.includes("segredo123"));
  assert.equal(row.details.password, "[oculto]");
});

test("falha no banco nunca lanca nem derruba quem chamou", async () => {
  const { mod } = loadAppLog({ failInsert: true });
  assert.doesNotThrow(() => mod.logEvent({ category: "x", message: "m" }));
  await assert.doesNotReject(() => mod.logEventNow({ category: "x", message: "m" }));
});

// ---- rotas ---------------------------------------------------------------
function loadLogsRoute({ allowed = true, rows = [] } = {}) {
  const calls = [];
  const builder = {
    select() { return this; }, gte(...a) { calls.push(["gte", ...a]); return this; }, order() { return this; },
    range(...a) { calls.push(["range", ...a]); return this; }, eq(...a) { calls.push(["eq", ...a]); return this; },
    or(...a) { calls.push(["or", ...a]); return this; }, in(...a) { calls.push(["in", ...a]); return this; },
    then(resolve) { return resolve({ data: rows, error: null }); },
  };
  const admin = { from: () => builder };
  const route = load("app/api/admin/logs/route.ts", {
    "next/server": { NextResponse: { json: (body, init) => ({ body, status: init?.status ?? 200 }) } },
    "@/lib/log-access": { requireLogViewer: async () => (allowed ? { user: { id: "u" } } : null) },
    "@/lib/supabase/admin": { createAdminClient: () => admin },
  });
  return { route, calls };
}
const get = (route, qs = "") => route.GET(new Request(`https://dk.test/api/admin/logs${qs}`));

test("sem a permissao Ver logs a API responde 403 e nao consulta nada", async () => {
  const { route, calls } = loadLogsRoute({ allowed: false });
  const res = await get(route);
  assert.equal(res.status, 403);
  assert.equal(calls.length, 0);
});

test("a API limita ao periodo pedido (nunca alem de 7 dias) e valida os filtros", async () => {
  const { route, calls } = loadLogsRoute();
  assert.equal((await get(route, "?periodo=999d")).status, 200);
  const since = new Date(calls.find((c) => c[0] === "gte")[2]).getTime();
  const age = Date.now() - since;
  assert.ok(age <= 7 * 24 * 3600 * 1000 + 5000 && age > 6.9 * 24 * 3600 * 1000);
  assert.equal((await get(route, "?nivel=critico")).status, 400);
  assert.equal((await get(route, "?origem=outra")).status, 400);
});

test("busca remove caracteres que alterariam o filtro .or()", async () => {
  const { route, calls } = loadLogsRoute();
  await get(route, `?busca=${encodeURIComponent("x),id.neq.0,(y")}`);
  const filter = calls.find((c) => c[0] === "or")[1];
  assert.ok(!filter.includes("),id.neq"));
  assert.ok(!/[(),]x|y[(),]/.test(filter.split("ilike.%")[1] ?? ""));
});

test("pagina pede uma linha a mais e informa se ha proxima", async () => {
  const rows = Array.from({ length: 51 }, (_, i) => ({ uid: `app:${i}`, actor_id: null }));
  const { route } = loadLogsRoute({ rows });
  const res = await get(route);
  assert.equal(res.body.items.length, 50);
  assert.equal(res.body.hasMore, true);
});

test("a migration limita a visao e o cron a 7 dias e nao apaga as auditorias", () => {
  const sql = fs.readFileSync("supabase/migrations/020_app_logs.sql", "utf8");
  assert.equal((sql.match(/interval '7 days'/g) ?? []).length >= 4, true);
  assert.match(sql, /cron\.schedule\('purge-app-logs-7d'/);
  assert.ok(!/delete from public\.(admin_audit_log|assessment_audit_log)/.test(sql));
  assert.match(sql, /revoke all on public\.log_viewer_permissions from anon, authenticated/);
});

test("secao servidor nunca traz auditoria e secao auditoria so traz auditoria", async () => {
  const server = loadLogsRoute();
  assert.equal((await get(server.route)).status, 200);
  assert.deepEqual(JSON.parse(JSON.stringify(server.calls.find((c) => c[0] === "in"))), ["in", "source", ["evento", "servidor"]]);
  assert.ok(!server.calls.some((c) => c[0] === "eq" && c[2] === "auditoria"));

  const audit = loadLogsRoute();
  assert.equal((await get(audit.route, "?secao=auditoria")).status, 200);
  assert.ok(audit.calls.some((c) => c[0] === "eq" && c[1] === "source" && c[2] === "auditoria"));
  assert.ok(!audit.calls.some((c) => c[0] === "in"));
});

test("origem so aceita evento ou servidor; auditoria nao e uma origem da secao servidor", async () => {
  const { route, calls } = loadLogsRoute();
  assert.equal((await get(route, "?origem=auditoria")).status, 400);
  assert.equal((await get(route, "?secao=outra")).status, 400);
  assert.equal((await get(route, "?origem=evento")).status, 200);
  assert.ok(calls.some((c) => c[0] === "eq" && c[1] === "source" && c[2] === "evento"));
});

test("na secao auditoria a origem pedida e ignorada (nao vaza eventos do servidor)", async () => {
  const { route, calls } = loadLogsRoute();
  await get(route, "?secao=auditoria&origem=servidor");
  const sources = calls.filter((c) => c[0] === "eq" && c[1] === "source").map((c) => c[2]);
  assert.deepEqual(sources, ["auditoria"]);
});
