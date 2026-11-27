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
  rankOptions: [{ value: "recruta" }, { value: "cabo" }, { value: "major" }, { value: "general_brigada" }, { value: "general_divisao" }], graduationOptions: [{ value: "sem_graduacao" }, { value: "bronze" }, { value: "prata" }],
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

function review({ authorized = true, changed = false, principal = false, target = {}, targetRoles = [] } = {}) {
  let changes;
  let audit;
  const supabase = {
    auth: { getUser: async () => ({ data: { user: authorized ? { id: "admin" } : null } }) },
    from: () => ({ select() { return this; }, eq() { return this; }, in: async () => ({ data: [{ role: "membros" }] }) }),
  };
  const adminAuth = { requireAdmin: async () => (authorized ? { user: { id: "admin" }, roles: ["membros"], isPrincipal: principal } : null) };
  const admin = {
    from: (table) => table === "user_admin_roles" ? {
      select() { return this; }, eq: async () => ({ data: targetRoles.map((role) => ({ role })) }),
    } : ({
      select() { return this; }, eq() { return this; },
      maybeSingle: async () => ({ data: { requested_rank: "cabo", graduation_cavalaria: "sem_graduacao", graduation_arquearia: "prata", requested_graduation_cavalaria: "bronze", requested_graduation_arquearia: null, ...target } }),
      update(value) {
        changes = value;
        return { eq() { return this; }, select: async () => ({ data: changed ? [] : [{ id: "member" }] }) };
      },
    }),
  };
  return {
    route: loadRoute("app/api/admin/members/[id]/route.ts", {
      "next/server": nextServer, "@/lib/member-access": accessOptions,
      "@/lib/rank-grants": loadRoute("lib/rank-grants.ts", { "@/lib/assessments": loadRoute("lib/assessments.ts", {}) }),
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

test("a membros admin sets rank and graduation of someone else, and values must be valid", async () => {
  const allowed = review();
  assert.equal((await allowed.route.PATCH(request({ rank: "major", graduation_cavalaria: "bronze", graduation_arquearia: "prata" }), params)).status, 200);
  assert.equal(allowed.changes().rank, "major");
  assert.equal(allowed.changes().graduation_cavalaria, "bronze");
  assert.equal(allowed.changes().graduation_arquearia, "prata");
  assert.equal(allowed.changes().graduation_level, undefined);

  const invalid = review();
  assert.equal((await invalid.route.PATCH(request({ graduation_cavalaria: "diamante" }), params)).status, 400);
  assert.equal(invalid.changes(), undefined);
});

const self = { params: Promise.resolve({ id: "admin" }) };
test("a membros admin cannot change or approve their own access", async () => {
  for (const body of [
    { rank: "major" },
    { graduation_arquearia: "prata" },
    { commander_arquearia: true },
    { access_request_action: "approve", access_request_id: "request" },
  ]) {
    const { route, changes } = review({ targetRoles: ["membros"] });
    assert.equal((await route.PATCH(request(body), self)).status, 403, JSON.stringify(body));
    assert.equal(changes(), undefined);
  }
});

test("a membros admin edits and approves another administrator's rank", async () => {
  for (const targetRoles of [["membros"], ["principal"]]) {
    // O painel manda o nível interno junto; sem mudança, não conta.
    const direct = review({ targetRoles, target: { member_kind: "membro" } });
    assert.equal((await direct.route.PATCH(request({ member_kind: "membro", rank: "major" }), params)).status, 200);
    assert.equal(direct.changes().rank, "major");

    const { send, changes } = approve(undefined, { targetRoles });
    assert.equal((await send()).status, 200);
    assert.equal(changes().rank, "cabo");
  }
});

test("status and membership level of another administrator stay with the principal", async () => {
  for (const body of [{ status: "suspenso" }, { member_kind: "membro", rank: "major" }]) {
    const { route, changes } = review({ targetRoles: ["atividades"], target: { member_kind: "recrutando" } });
    assert.equal((await route.PATCH(request(body), params)).status, 403, JSON.stringify(body));
    assert.equal(changes(), undefined);
  }
});

test("only the principal admin grants a general rank, directly or by approval", async () => {
  const denied = review();
  assert.equal((await denied.route.PATCH(request({ rank: "general_brigada" }), params)).status, 403);
  assert.equal(denied.changes(), undefined);

  const requested = approve(undefined, { target: { rank: "major", requested_rank: "general_brigada" } });
  assert.equal((await requested.send()).status, 403);
  assert.equal(requested.changes(), undefined);

  const forced = approve({ rank: "general_brigada" });
  assert.equal((await forced.send()).status, 403);
  assert.equal(forced.changes(), undefined);

  // Ajustar para baixo ou recusar o pedido continua com o ADM de Membros.
  const lowered = approve({ rank: "major" }, { target: { rank: "cabo", requested_rank: "general_brigada" } });
  assert.equal((await lowered.send()).status, 200);
  assert.equal(lowered.changes().rank, "major");
  const rejected = review({ target: { rank: "major", requested_rank: "general_brigada" } });
  assert.equal((await rejected.route.PATCH(request({ access_request_action: "reject", access_request_id: "request" }), params)).status, 200);

  const principal = review({ principal: true });
  assert.equal((await principal.route.PATCH(request({ rank: "general_brigada" }), params)).status, 200);
  assert.equal(principal.changes().rank, "general_brigada");
});

test("keeping or lowering a general rank is not granting it", async () => {
  const kept = review({ target: { rank: "general_divisao" } });
  assert.equal((await kept.route.PATCH(request({ rank: "general_divisao" }), params)).status, 200);
  const lowered = review({ target: { rank: "general_divisao" } });
  assert.equal((await lowered.route.PATCH(request({ rank: "major" }), params)).status, 200);
  const other = review({ target: { rank: "general_divisao" } });
  assert.equal((await other.route.PATCH(request({ rank: "general_brigada" }), params)).status, 403);
});

// --- Comandante por trilha ---------------------------------------------------

test("approving a commander request applies it to that track only", async () => {
  const { send, changes, audit } = approve(undefined, { target: { requested_commander_cavalaria: true } });
  assert.equal((await send()).status, 200);
  assert.equal(changes().graduation_cavalaria, "bronze");
  assert.equal(changes().commander_cavalaria, true);
  // A trilha que o pedido nao trouxe continua sem comando.
  assert.equal(changes().commander_arquearia, false);
  assert.equal(changes().requested_commander_cavalaria, null);
  assert.equal(changes().requested_commander_arquearia, null);
  assert.equal(audit()[4].applied.commander_cavalaria, true);
  assert.equal(audit()[4].adjusted, false);
});

test("the reviewer can refuse the commander mark and keep the rest of the request", async () => {
  const { send, changes, audit } = approve({ commander_cavalaria: false }, { target: { requested_commander_cavalaria: true } });
  assert.equal((await send()).status, 200);
  assert.equal(changes().graduation_cavalaria, "bronze");
  assert.equal(changes().commander_cavalaria, false);
  assert.equal(audit()[4].adjusted, true);
  assert.equal(audit()[4].requested.commander_cavalaria, true);
});

test("a request that drops the graduation also drops the commander mark", async () => {
  // O membro era comandante de arquearia; o pedido zera a graduacao dessa trilha.
  const { send, changes } = approve(undefined, { target: { commander_arquearia: true, requested_graduation_arquearia: "sem_graduacao" } });
  assert.equal((await send()).status, 200);
  assert.equal(changes().graduation_arquearia, "sem_graduacao");
  assert.equal(changes().commander_arquearia, false);
});

test("lowering a graduation to none while approving clears that track's commander mark", async () => {
  const { send, changes } = approve({ graduation_cavalaria: "sem_graduacao" }, { target: { requested_commander_cavalaria: true } });
  assert.equal((await send()).status, 200);
  assert.equal(changes().commander_cavalaria, false);
});

test("commander without a graduation on the track is refused", async () => {
  // Cavalaria pedida como bronze; o revisor tenta forcar comandante em arquearia sem graduacao.
  const { send, changes } = approve({ graduation_arquearia: "sem_graduacao", commander_arquearia: true });
  assert.equal((await send()).status, 400);
  assert.equal(changes(), undefined);
});

test("commander adjustments must be booleans", async () => {
  for (const value of ["sim", 1, null, "true"]) {
    const { send, changes } = approve({ commander_cavalaria: value });
    assert.equal((await send()).status, 400, JSON.stringify(value));
    assert.equal(changes(), undefined);
  }
});

test("setting the commander mark directly needs a graduation", async () => {
  const allowed = review();
  assert.equal((await allowed.route.PATCH(request({ commander_arquearia: true }), params)).status, 200);
  assert.equal(allowed.changes().commander_arquearia, true);

  // A graduacao que ficara em vigor e a que vale: aqui a cavalaria atual e "sem_graduacao".
  const noLevel = review({ principal: true });
  assert.equal((await noLevel.route.PATCH(request({ commander_cavalaria: true }), params)).status, 400);
  assert.equal(noLevel.changes(), undefined);

  // Pedindo as duas coisas juntas, vale o nivel novo.
  const together = review({ principal: true });
  assert.equal((await together.route.PATCH(request({ graduation_cavalaria: "prata", commander_cavalaria: true }), params)).status, 200);
  assert.equal(together.changes().commander_cavalaria, true);

  const invalid = review({ principal: true });
  assert.equal((await invalid.route.PATCH(request({ commander_arquearia: "sim" }), params)).status, 400);
  assert.equal(invalid.changes(), undefined);
});

test("removing a graduation directly also removes the commander mark", async () => {
  const { route, changes } = review({ principal: true, target: { commander_arquearia: true } });
  assert.equal((await route.PATCH(request({ graduation_arquearia: "sem_graduacao" }), params)).status, 200);
  assert.equal(changes().graduation_arquearia, "sem_graduacao");
  assert.equal(changes().commander_arquearia, false);
});
