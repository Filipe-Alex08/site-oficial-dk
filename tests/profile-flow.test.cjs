const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function loadRoute(file, mocks) {
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports, Request, Response, TextDecoder, Uint8Array, console,
    process: { env: { SUPABASE_SECRET_KEY: "test-only" } },
    require: (name) => name in mocks ? mocks[name] : require(name),
  });
  return exports;
}

const nextServer = { NextResponse: { json: (body, init) => Response.json(body, init) } };
const accessOptions = {
  rankOptions: [{ value: "recruta" }, { value: "cabo" }, { value: "major" }], graduationOptions: [{ value: "sem_graduacao" }, { value: "bronze" }, { value: "prata" }],
  memberKindOptions: [{ value: "membro" }],
};

// Mesma regra do lib/api-guard.ts: só vale o pedido com o cabeçalho do cliente do site.
const apiGuard = {
  isSameOriginRequest: (req) => req.headers.get("x-dk-client") === "1",
  forbidden: () => Response.json({ error: "Requisição não autorizada." }, { status: 403 }),
};

function registration({ consumeThrows = false } = {}) {
  let inserted;
  let consumedWith;
  let deletedUser;
  // invites.used_by referencia profiles(id): consumir antes de existir o perfil falha.
  const admin = {
    rpc: async (name, args) => {
      if (name === "check_registration_rate_limit") return { data: true };
      if (!inserted) return { data: null, error: { message: 'violates foreign key constraint "invites_used_by_fkey"' } };
      if (consumeThrows) throw new Error("rede");
      consumedWith = args;
      return { data: [{ invite_id: "invite", invited_by: "inviter" }] };
    },
    auth: { admin: {
      createUser: async () => ({ data: { user: { id: "new-user" } } }),
      deleteUser: async (id) => { deletedUser = id; inserted = undefined; return {}; },
    } },
    from: (table) => table === "invites" ? {
      select() { return this; }, eq() { return this; },
      maybeSingle: async () => ({ data: { id: "invite", created_by: "inviter", current_uses: 0, max_uses: 1 } }),
    } : { insert: async (profile) => { inserted = profile; return {}; } },
  };
  return {
    route: loadRoute("app/api/register/route.ts", {
      "next/server": nextServer, "@/lib/supabase/admin": { createAdminClient: () => admin },
      "@/lib/api-guard": apiGuard,
      "@/lib/client-ip": loadRoute("lib/client-ip.ts", {}),
      "@/lib/log-sanitize": loadRoute("lib/log-sanitize.ts", {}),
      "@/lib/app-log": { logEvent: () => {} },
    }),
    profile: () => inserted,
    consumedWith: () => consumedWith,
    deletedUser: () => deletedUser,
  };
}

const account = { invite_code: "DK-TEST", email: "member@example.com", password: "password123", full_name: "Test Member", nickname: "Tester" };
function request(body) {
  return new Request("https://example.com/api/register", { method: "POST", headers: { "x-dk-client": "1" }, body: JSON.stringify(body) });
}

test("registration accepts only account details without a birth date", async () => {
  const { route, profile } = registration();
  assert.equal((await route.POST(request(account))).status, 201);
  assert.equal(profile().rank, "recruta");
  assert.equal(profile().graduation_level, "sem_graduacao");
  assert.equal(profile().status, "pendente");
  assert.equal(profile().birth_date, undefined);
});

test("registration creates the profile before consuming the invite", async () => {
  const { route, profile, consumedWith, deletedUser } = registration();
  assert.equal((await route.POST(request(account))).status, 201);
  assert.equal(profile().invited_by, "inviter");
  assert.deepEqual({ ...consumedWith() }, { requested_invite_id: "invite", new_user_id: "new-user" });
  assert.equal(deletedUser(), undefined);
});

test("registration removes the new account when something throws midway", async () => {
  const { route, deletedUser } = registration({ consumeThrows: true });
  assert.equal((await route.POST(request(account))).status, 400);
  assert.equal(deletedUser(), "new-user");
});

test("registration ignores forged profile and access values", async () => {
  const { route, profile } = registration();
  const extras = { rank: "general_exercito", graduation_level: "ouro", graduation_order: "Order", house: "House", shirt_number: 7, primary_build: "Build", secondary_build: "Other", birth_date: "2000-01-01", zodiac_sign: "Sign", access_request_id: "forged", status: "aprovado" };
  assert.equal((await route.POST(request({ ...account, ...extras }))).status, 201);
  assert.equal(profile().rank, "recruta");
  assert.equal(profile().graduation_level, "sem_graduacao");
  assert.equal(profile().status, "pendente");
  for (const field of Object.keys(extras).filter((field) => !["rank", "graduation_level", "status"].includes(field))) {
    assert.equal(profile()[field], undefined, field);
  }
});

test("registration refuses requests that do not come from the site itself", async () => {
  const { route, profile } = registration();
  const foreign = new Request("https://example.com/api/register", { method: "POST", body: JSON.stringify(account) });
  assert.equal((await route.POST(foreign)).status, 403);
  assert.equal(profile(), undefined);
});

test("registration still requires the basic account fields", async () => {
  const { route } = registration();
  assert.equal((await route.POST(request({ ...account, nickname: "" }))).status, 400);
});

function review({ authorized = true, changed = false, principal = false } = {}) {
  let changes;
  let audit;
  const supabase = {
    auth: { getUser: async () => ({ data: { user: authorized ? { id: "admin" } : null } }) },
    from: () => ({ select() { return this; }, eq() { return this; }, in: async () => ({ data: [{ role: "membros" }] }) }),
  };
  const adminAuth = { requireAdmin: async () => (authorized ? { user: { id: "admin" }, roles: ["membros"], isPrincipal: principal } : null) };
  const admin = {
    from: () => ({
      select() { return this; }, eq() { return this; },
      maybeSingle: async () => ({ data: { requested_rank: "cabo", graduation_cavalaria: "sem_graduacao", graduation_arquearia: "prata", requested_graduation_cavalaria: "bronze", requested_graduation_arquearia: null } }),
      update(value) {
        changes = value;
        return { eq() { return this; }, select: async () => ({ data: changed ? [] : [{ id: "member" }] }) };
      },
    }),
  };
  return {
    route: loadRoute("app/api/admin/members/[id]/route.ts", {
      "next/server": nextServer, "@/lib/member-access": accessOptions,
      "@/lib/admin-auth": adminAuth, "@/lib/admin-audit": { logAdminAudit: async (...args) => { audit = args; } },
      "@/lib/supabase/server": { createClient: async () => supabase },
      "@/lib/supabase/admin": { createAdminClient: () => admin },
    }),
    changes: () => changes,
    audit: () => audit,
  };
}

const params = { params: Promise.resolve({ id: "member" }) };
test("approving uses the stored request and clears its pending values", async () => {
  const { route, changes } = review();
  const response = await route.PATCH(request({ access_request_action: "approve", access_request_id: "request", rank: "general_exercito" }), params);
  assert.equal(response.status, 200);
  assert.equal(changes().rank, "cabo");
  assert.equal(changes().graduation_cavalaria, "bronze");
  // A trilha que o pedido não trouxe continua como estava.
  assert.equal(changes().graduation_arquearia, "prata");
  assert.equal(changes().access_request_id, null);
  assert.equal(changes().requested_graduation_cavalaria, null);
  assert.equal(changes().requested_graduation_arquearia, null);
});

test("rejecting clears the request without changing effective permissions", async () => {
  const { route, changes } = review();
  assert.equal((await route.PATCH(request({ access_request_action: "reject", access_request_id: "request" }), params)).status, 200);
  assert.equal(changes().rank, undefined);
  assert.equal(changes().graduation_cavalaria, undefined);
  assert.equal(changes().graduation_arquearia, undefined);
  assert.equal(changes().access_request_id, null);
});

test("reviewing a replaced request returns a conflict", async () => {
  const { route } = review({ changed: true });
  assert.equal((await route.PATCH(request({ access_request_action: "approve", access_request_id: "request" }), params)).status, 409);
});

function approve(adjustments, options) {
  const harness = review(options);
  const body = { access_request_action: "approve", access_request_id: "request", ...(adjustments === undefined ? {} : { adjustments }) };
  return { ...harness, send: () => harness.route.PATCH(request(body), params) };
}

test("approving can adjust what the member requested, and the rest keeps the request", async () => {
  // Quem não é ADM Principal (aqui, ADM de Membros) também pode ajustar.
  const { send, changes, audit } = approve({ rank: "major", graduation_arquearia: "sem_graduacao" });
  assert.equal((await send()).status, 200);
  assert.equal(changes().rank, "major");
  assert.equal(changes().graduation_arquearia, "sem_graduacao");
  // A trilha que não foi ajustada mantém o que o membro pediu.
  assert.equal(changes().graduation_cavalaria, "bronze");
  assert.equal(changes().access_request_id, null);
  assert.equal(changes().requested_rank, null);
  const details = audit()[4];
  assert.equal(details.adjusted, true);
  assert.equal(details.requested.rank, "cabo");
  assert.equal(details.applied.rank, "major");
});

test("an adjustment identical to the request is not recorded as adjusted", async () => {
  const same = approve({ rank: "cabo", graduation_cavalaria: "bronze" });
  assert.equal((await same.send()).status, 200);
  assert.equal(same.changes().rank, "cabo");
  assert.equal(same.audit()[4].adjusted, false);

  const empty = approve({});
  assert.equal((await empty.send()).status, 200);
  assert.equal(empty.changes().rank, "cabo");
  assert.equal(empty.audit()[4].adjusted, false);
});

test("invalid adjustments are refused without changing anything", async () => {
  for (const adjustments of [
    { rank: "general_exercito" },
    { graduation_cavalaria: "diamante" },
    { rank: "cabo", status: "aprovado" },
    "major",
    ["major"],
    null,
  ]) {
    const { send, changes } = approve(adjustments);
    assert.equal((await send()).status, 400, JSON.stringify(adjustments));
    assert.equal(changes(), undefined, JSON.stringify(adjustments));
  }
});

test("rejecting a request cannot carry adjustments", async () => {
  const { route, changes } = review();
  const body = { access_request_action: "reject", access_request_id: "request", adjustments: { rank: "major" } };
  assert.equal((await route.PATCH(request(body), params)).status, 400);
  assert.equal(changes(), undefined);
});

test("adjusting still needs authorization and a current request", async () => {
  assert.equal((await approve({ rank: "major" }, { authorized: false }).send()).status, 403);
  assert.equal((await approve({ rank: "major" }, { changed: true }).send()).status, 409);
});

test("review requires administrator authorization", async () => {
  const { route, changes } = review({ authorized: false });
  assert.equal((await route.PATCH(request({ access_request_action: "approve", access_request_id: "request" }), params)).status, 403);
  assert.equal(changes(), undefined);
});

test("only the principal admin sets each graduation track, and the level must be valid", async () => {
  const denied = review({ principal: false });
  assert.equal((await denied.route.PATCH(request({ graduation_arquearia: "prata" }), params)).status, 403);
  assert.equal(denied.changes(), undefined);

  const allowed = review({ principal: true });
  assert.equal((await allowed.route.PATCH(request({ graduation_cavalaria: "bronze", graduation_arquearia: "prata" }), params)).status, 200);
  assert.equal(allowed.changes().graduation_cavalaria, "bronze");
  assert.equal(allowed.changes().graduation_arquearia, "prata");
  assert.equal(allowed.changes().graduation_level, undefined);

  const invalid = review({ principal: true });
  assert.equal((await invalid.route.PATCH(request({ graduation_cavalaria: "diamante" }), params)).status, 400);
  assert.equal(invalid.changes(), undefined);
});
