const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

// Quem gerencia avaliações não pode agir como gestor sobre a própria prova.

function load(file, mocks) {
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, {
    exports, Request, Response, console,
    require: (name) => (name in mocks ? mocks[name] : require(name)),
  });
  return exports;
}

const ME = "11111111-1111-4111-8111-111111111111";
const OTHER = "22222222-2222-4222-8222-222222222222";
const ID = "33333333-3333-4333-8333-333333333333";

// Banco falso: toda leitura devolve a mesma indicação; qualquer escrita é registrada.
function harness(memberId) {
  const writes = [];
  const row = { id: ID, member_id: memberId, status: "aguardando_correcao", assessment_id: ID, assignment_id: ID, item_id: ID, question_type: "aberta", open_answer: "resposta" };
  const admin = {
    from: (table) => {
      const query = {
        select: () => query, eq: () => query, in: () => query, not: () => query, is: () => query, order: () => query,
        maybeSingle: async () => ({ data: row }), single: async () => ({ data: row }),
        then: (resolve) => resolve({ data: [row], error: null }),
      };
      for (const method of ["insert", "update", "delete", "upsert"]) query[method] = () => { writes.push(`${table}.${method}`); return query; };
      return query;
    },
  };
  const actor = { user: { id: ME }, profile: { nickname: "Gestor", rank: "general_brigada" }, admin, canManage: true, canDelegate: true };
  const mocks = {
    "next/server": { NextResponse: { json: (body, init) => Response.json(body, init) } },
    "@/lib/assessment-server": { requireAssessmentManager: async () => actor },
    "@/lib/assessment-scoring": { submitAssessmentAttempt: async () => { writes.push("submit"); }, recalculateAssessmentResult: async () => ({}) },
    "@/lib/assessments": { uniqueStrings: (value) => value },
  };
  return { mocks, writes };
}

const request = (body) => new Request("https://dk.test/api", { method: "POST", body: JSON.stringify(body) });
const params = { params: Promise.resolve({ id: ID }) };

for (const action of ["cancel", "close", "reset"]) {
  test(`a manager cannot ${action} their own assignment`, async () => {
    const { mocks, writes } = harness(ME);
    const route = load("app/api/admin/assessments/assignments/[id]/route.ts", mocks);
    const response = await route.PATCH(request({ action, reason: "motivo com mais de dez letras" }), params);
    assert.equal(response.status, 403);
    assert.deepEqual(writes, []);
  });
}

test("a manager cannot grade their own answer, but grades someone else's", async () => {
  const body = { assignment_id: ID, item_id: ID, is_correct: true };
  const own = harness(ME);
  assert.equal((await load("app/api/admin/assessments/reviews/route.ts", own.mocks).POST(request(body))).status, 403);
  assert.deepEqual(own.writes, []);

  const other = harness(OTHER);
  assert.equal((await load("app/api/admin/assessments/reviews/route.ts", other.mocks).POST(request(body))).status, 200);
  assert.ok(other.writes.includes("assessment_answers.update"));
});

test("a manager cannot assign an assessment to themselves", async () => {
  const { mocks, writes } = harness(ME);
  const route = load("app/api/admin/assessments/assignments/route.ts", mocks);
  const response = await route.POST(request({ assessment_id: ID, member_ids: [OTHER, ME] }));
  assert.equal(response.status, 403);
  assert.deepEqual(writes, []);
});

test("the manager's own pending answers are not listed for grading", async () => {
  for (const [memberId, expected] of [[ME, 0], [OTHER, 1]]) {
    const { mocks } = harness(memberId);
    const response = await load("app/api/admin/assessments/route.ts", mocks).GET();
    assert.equal((await response.json()).reviews.length, expected);
  }
});
