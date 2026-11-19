const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, mocks = {}, env = {}, extra = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports, URL, console, process: { env }, Promise, Response, atob, TextDecoder, Uint8Array, JSON, Array, Date, Math, Set,
    ...extra,
    require: (name) => name in mocks ? mocks[name] : require(name),
  });
  return exports;
}

const recovery = load("lib/password-recovery.ts");
const { validateNewPassword, validatePasswordChange } = load("lib/account-password.ts");
const now = Date.UTC(2026, 10, 19, 12, 0, 0);
const sec = Math.floor(now / 1000);

test("so um acesso por link de recuperacao recente conta como recuperacao", () => {
  assert.equal(recovery.hasFreshRecovery([{ method: "recovery", timestamp: sec - 30 }], now), true);
  assert.equal(recovery.hasFreshRecovery([{ method: "password", timestamp: sec - 30 }, { method: "otp", timestamp: sec - 60 }], now), true);
  assert.equal(recovery.hasFreshRecovery([{ method: "password", timestamp: sec - 30 }], now), false);
  assert.equal(recovery.hasFreshRecovery([{ method: "recovery", timestamp: sec - 16 * 60 }], now), false);
  assert.equal(recovery.hasFreshRecovery([{ method: "recovery", timestamp: sec + 600 }], now), false);
  assert.equal(recovery.hasFreshRecovery([{ method: "recovery" }], now), false);
  assert.equal(recovery.hasFreshRecovery(["recovery"], now), false);
  for (const junk of [undefined, null, "recovery", {}, 5, [null], [{ method: 3, timestamp: sec }]]) {
    assert.equal(recovery.hasFreshRecovery(junk, now), false, JSON.stringify(junk));
  }
});

test("o amr e lido do payload do token e token ruim nao quebra", () => {
  const payload = Buffer.from(JSON.stringify({ amr: [{ method: "recovery", timestamp: sec }] })).toString("base64url");
  assert.deepEqual(JSON.parse(JSON.stringify(recovery.amrFromAccessToken(`h.${payload}.s`))), [{ method: "recovery", timestamp: sec }]);
  for (const junk of [undefined, "", "abc", "a.!!!.c", `a.${Buffer.from("nao json").toString("base64url")}.c`, 12]) {
    assert.equal(recovery.amrFromAccessToken(junk), undefined, String(junk));
  }
});

test("e-mail do pedido de redefinicao e validado", () => {
  assert.equal(recovery.normalizeEmail("  membro@dk.test "), "membro@dk.test");
  for (const junk of ["", "sem-arroba", "a@b", "a b@c.de", 5, null, undefined, `${"a".repeat(250)}@dk.test`]) {
    assert.equal(recovery.normalizeEmail(junk), null, String(junk));
  }
});

test("a regra da senha nova e a mesma da troca comum", () => {
  assert.equal(validateNewPassword("novasenha1"), null);
  assert.match(validateNewPassword("curta"), /entre 8 e 128/);
  assert.match(validateNewPassword(undefined), /entre 8 e 128/);
  assert.equal(validatePasswordChange("antiga123", "novasenha1"), null);
});

// ---- rota que pede o e-mail ---------------------------------------------
function requestRoute({ sameOrigin = true, user = { email: "membro@dk.test" }, resetError = null, origin = "https://dk.example", body = { email: "membro@dk.test" } } = {}) {
  const calls = { reset: [], logs: [], getUser: 0, cookies: [] };
  const supabase = {
    auth: {
      getUser: async () => { calls.getUser += 1; return { data: { user } }; },
      resetPasswordForEmail: async (email, options) => { calls.reset.push({ email, options }); return { error: resetError }; },
    },
  };
  const route = load("app/api/auth/password-reset/route.ts", {
    "next/server": { NextResponse: { json: (b, init) => ({ body: b, status: init?.status ?? 200 }) } },
    "next/headers": { cookies: async () => ({ set: (name, value, options) => calls.cookies.push({ name, value, options }) }) },
    "@/lib/api-guard": { forbidden: () => ({ status: 403 }), isSameOriginRequest: () => sameOrigin, notConfigured: () => ({ status: 503 }), requestOrigin: () => origin },
    "@/lib/app-log": { logEvent: (entry) => calls.logs.push(entry) },
    "@/lib/log-sanitize": load("lib/log-sanitize.ts"),
    "@/lib/password-recovery": recovery,
    "@/lib/supabase/server": { createClient: async () => supabase },
  });
  const request = { json: async () => { if (body === "invalido") throw new Error("json"); return body; } };
  return { calls, post: () => route.POST(request) };
}

test("pedido de redefinicao manda o link para o callback e responde igual", async () => {
  const f = requestRoute();
  const response = await f.post();
  assert.equal(response.status, 200);
  assert.deepEqual(JSON.parse(JSON.stringify(f.calls.reset)), [{ email: "membro@dk.test", options: { redirectTo: "https://dk.example/auth/callback" } }]);
  assert.equal(f.calls.getUser, 0);
  const [mark] = JSON.parse(JSON.stringify(f.calls.cookies));
  assert.equal(mark.name, "dk-recuperacao");
  assert.deepEqual(mark.options, { httpOnly: true, sameSite: "lax", secure: true, path: "/", maxAge: 3600 });
  assert.ok(!JSON.stringify(f.calls.logs).includes("membro@dk.test"), "o log guarda so o e-mail mascarado");
});

test("sem e-mail no corpo vale o e-mail de quem esta logado; sem sessao e recusado", async () => {
  const logged = requestRoute({ body: {} });
  assert.equal((await logged.post()).status, 200);
  assert.equal(logged.calls.reset[0].email, "membro@dk.test");
  const anonymous = requestRoute({ body: {}, user: null });
  assert.equal((await anonymous.post()).status, 400);
  assert.deepEqual(anonymous.calls.reset, []);
});

test("e-mail invalido, outra origem e corpo ruim nao chegam ao Supabase", async () => {
  for (const options of [{ body: { email: "nao-e-email" } }, { body: "invalido", user: null }, { sameOrigin: false }]) {
    const f = requestRoute(options);
    const response = await f.post();
    assert.ok([400, 403].includes(response.status), JSON.stringify(options));
    assert.deepEqual(f.calls.reset, []);
    assert.deepEqual(f.calls.cookies, []);
  }
});

test("excesso de pedidos vira aviso e falha do servidor de e-mail vira erro", async () => {
  assert.equal((await requestRoute({ resetError: { status: 429, code: "over_email_send_rate_limit" } }).post()).status, 429);
  assert.equal((await requestRoute({ resetError: { status: 500, code: "unexpected_failure" } }).post()).status, 502);
});

// ---- rota que grava a senha nova ----------------------------------------
function resetRoute({ cookie = "outro=1; dk-recuperacao=1", amr = [{ method: "recovery", timestamp: Math.floor(Date.now() / 1000) }], claims, updateError = null, body = { new_password: "novasenha1" }, sameOrigin = true } = {}) {
  const calls = { update: [], signOut: [], logs: [], deleted: [] };
  const supabase = {
    auth: {
      getClaims: async () => ({ data: claims === null ? null : { claims: claims ?? { sub: "u1", amr } } }),
      updateUser: async (attrs) => { calls.update.push(attrs); return { error: updateError }; },
      signOut: async (opts) => { calls.signOut.push(opts); return { error: null }; },
    },
  };
  const route = load("app/api/account/password/reset/route.ts", {
    "next/server": { NextResponse: { json: (b, init) => ({ body: b, status: init?.status ?? 200 }) } },
    "next/headers": { cookies: async () => ({ delete: (name) => calls.deleted.push(name) }) },
    "@/lib/api-guard": { forbidden: () => ({ status: 403 }), isSameOriginRequest: () => sameOrigin, notConfigured: () => ({ status: 503 }) },
    "@/lib/app-log": { logEvent: (entry) => calls.logs.push(entry) },
    "@/lib/account-password": { validateNewPassword },
    "@/lib/password-recovery": recovery,
    "@/lib/supabase/server": { createClient: async () => supabase },
  });
  return { calls, post: () => route.POST({ json: async () => body, headers: { get: (name) => (name === "cookie" ? cookie : null) } }) };
}

test("sessao recem-aberta pelo link define a senha sem a atual e encerra as outras", async () => {
  const f = resetRoute();
  assert.equal((await f.post()).status, 200);
  assert.deepEqual(JSON.parse(JSON.stringify(f.calls.update)), [{ password: "novasenha1" }]);
  assert.deepEqual(JSON.parse(JSON.stringify(f.calls.signOut)), [{ scope: "others" }]);
  assert.equal(f.calls.logs[0].action, "senha_redefinida");
  assert.deepEqual(JSON.parse(JSON.stringify(f.calls.deleted)), ["dk-recuperacao"]);
});

test("sessao comum, vencida ou sem login nao redefine a senha", async () => {
  const stale = [{ method: "recovery", timestamp: Math.floor(Date.now() / 1000) - 3600 }];
  for (const [options, status] of [
    [{ amr: [{ method: "password", timestamp: Math.floor(Date.now() / 1000) }] }, 403],
    [{ amr: stale }, 403],
    [{ cookie: "" }, 403],
    [{ cookie: "dk-recuperacao=0" }, 403],
    [{ claims: null }, 401],
    [{ claims: {} }, 401],
    [{ sameOrigin: false }, 403],
  ]) {
    const f = resetRoute(options);
    assert.equal((await f.post()).status, status, JSON.stringify(options));
    assert.deepEqual(f.calls.update, []);
  }
});

test("senha nova invalida, igual ou fraca e recusada com mensagem", async () => {
  assert.equal((await resetRoute({ body: { new_password: "curta" } }).post()).status, 400);
  assert.equal((await resetRoute({ updateError: { code: "same_password" } }).post()).status, 400);
  assert.equal((await resetRoute({ updateError: { code: "weak_password" } }).post()).status, 400);
  assert.equal((await resetRoute({ updateError: { code: "x" } }).post()).status, 500);
});

// ---- callback: o link de recuperacao cai na tela de senha nova -----------
test("o callback leva a sessao de recuperacao para a tela de senha nova", async () => {
  const payload = (amr) => `h.${Buffer.from(JSON.stringify({ amr })).toString("base64url")}.s`;
  const logic = load("lib/auth-callback.ts");
  async function run(accessToken, cookie = "dk-recuperacao=1") {
    const client = { auth: { exchangeCodeForSession: async () => ({ data: { user: { id: "u1", app_metadata: {}, identities: [] }, session: { access_token: accessToken } }, error: null }), signOut: async () => ({}) } };
    const admin = { from: () => ({ select() { return this; }, eq() { return this; }, maybeSingle: async () => ({ data: { status: "aprovado" }, error: null }) }) };
    const route = load("app/auth/callback/route.ts", {
      "@/lib/auth-callback": logic,
      "@/lib/password-recovery": recovery,
      "@/lib/account-switch": { snapshotCurrent: async () => null, stashPrevious: async () => undefined, restoreSnapshot: async () => undefined },
      "@/lib/supabase/server": { createClient: async () => client },
      "@/lib/supabase/admin": { createAdminClient: () => admin },
    });
    return (await route.GET(new Request("https://dk.example/auth/callback?code=abc", { headers: cookie ? { cookie } : {} }))).headers.get("location");
  }
  assert.equal(await run(payload([{ method: "recovery", timestamp: Math.floor(Date.now() / 1000) }])), "/area-do-membro/redefinir-senha");
  assert.equal(await run(payload([{ method: "oauth", timestamp: Math.floor(Date.now() / 1000) }])), "/membro");
  assert.equal(await run(undefined), "/membro");
  // Sem a marca do pedido (ex.: confirmacao de troca de e-mail, que tambem usa "otp"), cai na area do membro.
  assert.equal(await run(payload([{ method: "otp", timestamp: Math.floor(Date.now() / 1000) }]), ""), "/membro");
});

test("link vencido volta ao login com aviso proprio", () => {
  const logic = load("lib/auth-callback.ts");
  assert.equal(logic.callbackFailureCode(new URLSearchParams("error=access_denied&error_code=otp_expired")), "link");
  assert.match(logic.loginErrorMessage("link"), /venceu/);
});

test("a marca de recuperacao so vale com o valor exato e a conta so Google e detectada", () => {
  assert.equal(recovery.hasRecoveryCookie("a=1; dk-recuperacao=1; b=2"), true);
  for (const junk of [null, undefined, "", "dk-recuperacao=0", "xdk-recuperacao=1", "dk-recuperacao=11"]) {
    assert.equal(recovery.hasRecoveryCookie(junk), false, String(junk));
  }
  assert.equal(recovery.usesPasswordLogin({ app_metadata: { providers: ["email", "google"] } }), true);
  assert.equal(recovery.usesPasswordLogin({ app_metadata: { providers: ["google"] } }), false);
  assert.equal(recovery.usesPasswordLogin({ app_metadata: {} }), true);
  assert.equal(recovery.usesPasswordLogin(null), true);
});
