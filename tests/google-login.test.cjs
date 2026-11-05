const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, mocks = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, {
    exports, URL, console,
    require: (name) => name in mocks ? mocks[name] : require(name), ...globals,
  });
  return exports;
}

// Objetos criados dentro do vm têm outro Object.prototype; normaliza antes de comparar.
const plain = (value) => JSON.parse(JSON.stringify(value));

const logic = load("lib/auth-callback.ts");

const now = Date.parse("2026-11-04T18:00:00Z");
const justCreated = "2026-11-04T17:59:58.123456Z";
const newGoogleAccount = { provider: "google", identityProviders: ["google"], createdAt: justCreated };
const passwordMember = { provider: "email", identityProviders: ["email", "google"], createdAt: "2026-01-10T12:00:00Z" };

function decide(profile, account = passwordMember) {
  return plain(logic.decideGoogleLogin(profile, account, now));
}

test("an approved member is allowed in", () => {
  assert.deepEqual(decide({ found: true, status: "aprovado" }), { action: "allow" });
  assert.deepEqual(decide({ found: true, status: "aprovado" }, newGoogleAccount), { action: "allow" });
});

test("a pending member is sent back with the approval notice and is never deleted", () => {
  const expected = { action: "deny", error: "pendente", deleteUser: false };
  assert.deepEqual(decide({ found: true, status: "pendente" }), expected);
  assert.deepEqual(decide({ found: true, status: "pendente" }, newGoogleAccount), expected);
});

test("refused, suspended, deactivated and unknown statuses are blocked and never deleted", () => {
  for (const status of ["recusado", "suspenso", "desativado", "qualquer-outro", ""]) {
    for (const account of [passwordMember, newGoogleAccount]) {
      assert.deepEqual(decide({ found: true, status }, account), { action: "deny", error: "nao-liberado", deleteUser: false }, status);
    }
  }
});

test("an account without a profile is denied and deleted only when Google just created it", () => {
  assert.deepEqual(decide({ found: false }, newGoogleAccount), { action: "deny", error: "sem-cadastro", deleteUser: true });
  assert.deepEqual(decide({ found: false }), { action: "deny", error: "sem-cadastro", deleteUser: false });
});

test("accounts that Google did not just create are never deleted", () => {
  const cases = {
    "created with e-mail and password": { ...newGoogleAccount, provider: "email", identityProviders: ["email"] },
    "e-mail identity linked to Google": { ...newGoogleAccount, identityProviders: ["google", "email"] },
    "older than the window": { ...newGoogleAccount, createdAt: "2026-11-04T17:50:00Z" },
    "creation date from the future": { ...newGoogleAccount, createdAt: "2026-11-04T18:30:00Z" },
    "invalid creation date": { ...newGoogleAccount, createdAt: "ontem" },
    "missing creation date": { provider: "google", identityProviders: ["google"] },
    "missing identities": { provider: "google", createdAt: justCreated },
    "empty identities": { ...newGoogleAccount, identityProviders: [] },
    "missing provider": { identityProviders: ["google"], createdAt: justCreated },
    "other social provider": { ...newGoogleAccount, provider: "github", identityProviders: ["github"] },
  };
  for (const [name, account] of Object.entries(cases)) {
    assert.equal(decide({ found: false }, account).deleteUser, false, name);
  }
});

test("the new-account window tolerates a small clock difference between servers", () => {
  const at = (createdAt) => decide({ found: false }, { ...newGoogleAccount, createdAt }).deleteUser;
  assert.equal(at("2026-11-04T17:56:00Z"), true);
  assert.equal(at("2026-11-04T18:01:00Z"), true);
  assert.equal(at("2026-11-04T17:54:59Z"), false);
});

test("next keeps internal paths, queries and fragments", () => {
  for (const next of ["/membro", "/membro/atividades", "/membro?aba=1", "/membro#topo", "/admin/membros?id=1&x=2#y", "/"]) {
    assert.equal(logic.safeNextPath(next), next);
  }
});

test("next falls back to the member area for anything that is not an internal path", () => {
  const unsafe = [
    undefined, null, "", "membro", " /membro", "https://evil.example/", "http://evil.example", "javascript:alert(1)",
    "//evil.example", "///evil.example", "\\\\evil.example", "/\\evil.example", "/\\/evil.example",
    "/\t/evil.example", "/\n/evil.example", "/\r/evil.example", "/\u0000/evil.example", "/membro\u007f",
    "/..//evil.example", "/.//evil.example", "/%2e%2e//evil.example", "/a/../..//evil.example",
  ];
  for (const next of unsafe) assert.equal(logic.safeNextPath(next), "/membro", JSON.stringify(next));
  assert.equal(logic.safeNextPath("//evil.example", "/inicio"), "/inicio");
});

test("login error codes map to fixed messages and nothing else is ever shown", () => {
  for (const code of logic.loginErrorCodes) {
    assert.ok(logic.loginErrorMessage(code), code);
    assert.equal(logic.loginErrorMessage([code, "google"]), logic.loginErrorMessage(code));
  }
  assert.equal(logic.loginErrorMessage("pendente"), "Seu cadastro ainda está aguardando aprovação.");
  assert.equal(logic.loginErrorMessage("nao-liberado"), "Seu acesso ainda não está liberado.");
  for (const code of [undefined, "", [], "Sua conta foi hackeada", "<script>alert(1)</script>", "PENDENTE", "constructor", "__proto__", "toString", "hasOwnProperty"]) {
    assert.equal(logic.loginErrorMessage(code), null, JSON.stringify(code));
  }
});

test("a refused Google redirect becomes a fixed notice", () => {
  const failure = (query) => logic.callbackFailureCode(new URLSearchParams(query));
  assert.equal(failure(""), "google");
  assert.equal(failure("error=access_denied&error_description=User+cancelled"), "google");
  assert.equal(failure("error=access_denied&error_code=signup_disabled"), "sem-cadastro");
  assert.equal(failure("error_code=algo-inesperado"), "google");
});

const approvedByPassword = {
  id: "member-id", created_at: "2026-01-10T12:00:00Z",
  app_metadata: { provider: "email", providers: ["email", "google"] }, identities: [{ provider: "email" }, { provider: "google" }],
};
const googleOnly = (createdAt = new Date().toISOString()) => ({
  id: "google-id", created_at: createdAt,
  app_metadata: { provider: "google", providers: ["google"] }, identities: [{ provider: "google" }],
});

function callback({ user = approvedByPassword, profile = null, profileError = null, exchangeError = null, deleteError = null,
  profileThrows = false, supabase = true, admin = true } = {}) {
  const events = [];
  const errors = [];
  const client = {
    auth: {
      exchangeCodeForSession: async (code) => {
        events.push(`exchange:${code}`);
        return exchangeError ? { data: { user: null, session: null }, error: exchangeError } : { data: { user, session: {} }, error: null };
      },
      signOut: async () => { events.push("signOut"); return { error: null }; },
    },
  };
  const adminClient = {
    from: (table) => ({
      select() { return this; },
      eq(column, value) { events.push(`${table}.${column}:${value}`); return this; },
      maybeSingle: async () => {
        if (profileThrows) throw new Error("falha inesperada");
        return { data: profile, error: profileError };
      },
    }),
    auth: { admin: { deleteUser: async (id) => { events.push(`delete:${id}`); return { error: deleteError }; } } },
  };
  const route = load("app/auth/callback/route.ts", {
    "@/lib/auth-callback": logic,
    "@/lib/supabase/server": { createClient: async () => supabase ? client : null },
    "@/lib/supabase/admin": { createAdminClient: () => admin ? adminClient : null },
  }, { Response, console: { error: (...args) => errors.push(args) } });
  const raw = (query = "code=abc") => route.GET(new Request(`https://dk.example/auth/callback?${query}`));
  return {
    events, errors, raw,
    get: async (query) => {
      const response = await raw(query);
      return { status: response.status, location: response.headers.get("location") };
    },
  };
}

const toLogin = (code) => `/area-do-membro/login?erro=${code}`;

test("callback without a code goes back to login without touching Supabase", async () => {
  const f = callback();
  assert.deepEqual(await f.get(""), { status: 307, location: toLogin("google") });
  assert.deepEqual(f.events, []);
});

test("callback turns a cancelled or refused Google redirect into a fixed notice", async () => {
  const cancelled = callback();
  assert.equal((await cancelled.get("error=access_denied&error_description=User+cancelled")).location, toLogin("google"));
  const closedSignups = callback();
  assert.equal((await closedSignups.get("error=access_denied&error_code=signup_disabled")).location, toLogin("sem-cadastro"));
  assert.deepEqual([...cancelled.events, ...closedSignups.events], []);
});

test("callback is unavailable without the Supabase clients and does not start a session", async () => {
  for (const missing of [{ supabase: false }, { admin: false }]) {
    const f = callback(missing);
    assert.equal((await f.get()).location, toLogin("google"));
    assert.deepEqual(f.events, []);
    assert.equal(f.errors.length, 1);
  }
});

test("a failed code exchange does not query, sign out or delete anything", async () => {
  const f = callback({ exchangeError: new Error("PKCE code verifier not found") });
  assert.equal((await f.get()).location, toLogin("google"));
  assert.deepEqual(f.events, ["exchange:abc"]);
});

test("an approved member is redirected to the member area and keeps the session", async () => {
  const f = callback({ profile: { status: "aprovado" } });
  assert.deepEqual(await f.get(), { status: 307, location: "/membro" });
  assert.deepEqual(f.events, ["exchange:abc", "profiles.id:member-id"]);
});

test("an approved member follows a safe next path and an unsafe one falls back to the member area", async () => {
  const destination = async (next) => (await callback({ profile: { status: "aprovado" } }).get(`code=abc&next=${encodeURIComponent(next)}`)).location;
  assert.equal(await destination("/membro/atividades"), "/membro/atividades");
  assert.equal(await destination("/membro?aba=1#topo"), "/membro?aba=1#topo");
  for (const next of ["//evil.example", "https://evil.example/", "/\\evil.example", "/..//evil.example", "javascript:alert(1)"]) {
    assert.equal(await destination(next), "/membro", next);
  }
});

test("redirects are relative, so they never depend on the server's own host, and are not cacheable", async () => {
  const responses = [
    await callback({ profile: { status: "aprovado" } }).raw(),
    await callback({ profile: { status: "pendente" } }).raw(),
    await callback().raw(""),
  ];
  for (const response of responses) {
    assert.match(response.headers.get("location"), /^\/[^/]/);
    assert.equal(response.headers.get("cache-control"), "no-store");
  }
});

test("a pending member is signed out with the approval notice and never deleted, even with a brand-new Google account", async () => {
  const f = callback({ user: googleOnly(), profile: { status: "pendente" } });
  assert.deepEqual(await f.get(), { status: 307, location: toLogin("pendente") });
  assert.deepEqual(f.events, ["exchange:abc", "profiles.id:google-id", "signOut"]);
});

test("refused, suspended and deactivated members are signed out with the not-released notice and never deleted", async () => {
  for (const status of ["recusado", "suspenso", "desativado"]) {
    const f = callback({ user: googleOnly(), profile: { status } });
    assert.equal((await f.get()).location, toLogin("nao-liberado"), status);
    assert.deepEqual(f.events, ["exchange:abc", "profiles.id:google-id", "signOut"], status);
  }
});

test("a brand-new Google account without a profile is signed out and then deleted exactly once", async () => {
  const f = callback({ user: googleOnly(), profile: null });
  assert.deepEqual(await f.get(), { status: 307, location: toLogin("sem-cadastro") });
  assert.deepEqual(f.events, ["exchange:abc", "profiles.id:google-id", "signOut", "delete:google-id"]);
});

test("an existing account without a profile is signed out but never deleted", async () => {
  const cases = {
    "created with e-mail and password": approvedByPassword,
    "Google account older than the window": googleOnly("2026-01-10T12:00:00Z"),
    "Google account with an e-mail identity": { ...googleOnly(), identities: [{ provider: "google" }, { provider: "email" }] },
  };
  for (const [name, user] of Object.entries(cases)) {
    const f = callback({ user, profile: null });
    assert.equal((await f.get()).location, toLogin("sem-cadastro"), name);
    assert.ok(f.events.includes("signOut"), name);
    assert.ok(!f.events.some((event) => event.startsWith("delete:")), name);
  }
});

test("a profile lookup error or exception signs out with a generic notice and never deletes", async () => {
  for (const options of [{ profileError: { message: "permission denied" } }, { profileThrows: true }]) {
    const f = callback({ user: googleOnly(), ...options });
    assert.equal((await f.get()).location, toLogin("google"));
    assert.deepEqual(f.events, ["exchange:abc", "profiles.id:google-id", "signOut"]);
    assert.equal(f.errors.length, 1);
  }
});

test("a failed deletion still finishes the login with the not-registered notice", async () => {
  const f = callback({ user: googleOnly(), deleteError: { message: "indisponível" } });
  assert.equal((await f.get()).location, toLogin("sem-cadastro"));
  assert.deepEqual(f.events, ["exchange:abc", "profiles.id:google-id", "signOut", "delete:google-id"]);
  assert.equal(f.errors.length, 1);
});
