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
  rankOptions: [{ value: "recruta" }], graduationOptions: [{ value: "sem_graduacao" }, { value: "bronze" }, { value: "prata" }],
  memberKindOptions: [{ value: "membro" }],
};

function registration() {
  let inserted;
  const admin = {
    rpc: async (name) => ({ data: name === "check_registration_rate_limit" ? true : { invited_by: "inviter" } }),
    auth: { admin: { createUser: async () => ({ data: { user: { id: "new-user" } } }) } },
    from: (table) => table === "invites" ? {
      select() { return this; }, eq() { return this; },
      maybeSingle: async () => ({ data: { id: "invite", current_uses: 0, max_uses: 1 } }),
    } : { insert: async (profile) => { inserted = profile; return {}; } },
  };
  return {
    route: loadRoute("app/api/register/route.ts", {
      "next/server": nextServer, "@/lib/supabase/admin": { createAdminClient: () => admin },
    }),
    profile: () => inserted,
  };
}

const account = { invite_code: "DK-TEST", email: "member@example.com", password: "password123", full_name: "Test Member", nickname: "Tester" };
function request(body) {
  return new Request("https://example.com/api/register", { method: "POST", body: JSON.stringify(body) });
}

test("registration accepts only account details without a birth date", async () => {
  const { route, profile } = registration();
  assert.equal((await route.POST(request(account))).status, 201);
  assert.equal(profile().rank, "recruta");
  assert.equal(profile().graduation_level, "sem_graduacao");
  assert.equal(profile().status, "pendente");
  assert.equal(profile().birth_date, undefined);
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

test("registration still requires the basic account fields", async () => {
  const { route } = registration();
  assert.equal((await route.POST(request({ ...account, nickname: "" }))).status, 400);
});

function review({ authorized = true, changed = false, principal = false } = {}) {
  let changes;
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
      "@/lib/admin-auth": adminAuth, "@/lib/admin-audit": { logAdminAudit: async () => {} },
      "@/lib/supabase/server": { createClient: async () => supabase },
      "@/lib/supabase/admin": { createAdminClient: () => admin },
    }),
    changes: () => changes,
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
