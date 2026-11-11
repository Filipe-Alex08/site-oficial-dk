const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports });
  return exports;
}

const calendar = load("lib/google-calendar-event.ts");
const plain = (value) => JSON.parse(JSON.stringify(value));
const base = {
  id: "123e4567-e89b-12d3-a456-426614174000",
  title: "Treino de domingo",
  starts_at: "2026-11-15T12:00:00.000Z",
  ends_at: "2026-11-15T15:00:00.000Z",
  location: "Parque Municipal",
  type: "Treino",
  status: "confirmado",
  description: "Atividade aberta ao público.",
};

test("Google event ids are deterministic, valid base32hex ids", () => {
  const id = calendar.googleEventIdForActivity(base.id);
  assert.equal(id, "dk123e4567e89b12d3a456426614174000");
  assert.match(id, /^[a-v0-9]{5,1024}$/);
  assert.equal(calendar.googleEventIdForActivity(base.id), id);
});

test("cancellation and public notice are explicit in the mirrored event", () => {
  const event = plain(calendar.buildGoogleCalendarEvent({
    ...base,
    status: "cancelado",
    notice_message: "Atividade cancelada devido à chuva.",
  }, "https://death-knights.com.br/"));
  assert.equal(event.summary, "CANCELADO — Treino de domingo");
  assert.match(event.description, /AVISO DO DK: Atividade cancelada/);
  assert.match(event.description, /Situação: Cancelado/);
  assert.match(event.description, /https:\/\/death-knights\.com\.br\/#calendario/);
  assert.equal(event.visibility, "public");
  assert.equal(event.extendedProperties.private.dkActivityId, base.id);
});

test("an activity without an end gets the documented two-hour duration", () => {
  const event = plain(calendar.buildGoogleCalendarEvent({ ...base, ends_at: null }));
  assert.equal(Date.parse(event.end.dateTime) - Date.parse(event.start.dateTime), 2 * 60 * 60 * 1000);
  assert.equal(event.start.timeZone, "America/Sao_Paulo");
  assert.equal(event.end.timeZone, "America/Sao_Paulo");
});

test("migration keeps Google state and validated presence private", () => {
  const sql = fs.readFileSync("supabase/migrations/20261111005828_calendar_google_notifications_presence.sql", "utf8");
  for (const table of ["activity_calendar_sync", "activity_presence_validations"]) {
    assert.match(sql, new RegExp(`alter table public\\.${table} enable row level security`, "i"));
    assert.match(sql, new RegExp(`revoke all on table public\\.${table} from anon, authenticated`, "i"));
    assert.match(sql, new RegExp(`grant all on table public\\.${table} to service_role`, "i"));
  }
  assert.match(sql, /revoke all on function public\.admin_save_activity_record[\s\S]+from public, anon, authenticated/i);
  assert.match(sql, /grant execute on function public\.admin_save_activity_record[\s\S]+to service_role/i);
  assert.match(sql, /revoke insert, update, delete on table public\.activities from authenticated/i);
  assert.match(sql, /activity_attendance[\s\S]+activity_presence_validations/i);
});

test("admin mutations require role authorization and same-origin protection", () => {
  const activitiesRoute = fs.readFileSync("app/api/admin/activities/route.ts", "utf8");
  const attendanceRoute = fs.readFileSync("app/api/admin/attendance/route.ts", "utf8");
  assert.match(activitiesRoute, /requireAdmin\(\["atividades"\]\)/);
  assert.equal((activitiesRoute.match(/isSameOriginRequest\(request\)/g) || []).length, 4);
  assert.match(attendanceRoute, /requireAdmin\(\["principal", "atividades"\]\)/);
  assert.match(attendanceRoute, /isSameOriginRequest\(request\)/);
});

test("the home page is rendered dynamically so urgent notices are not build-time snapshots", () => {
  const home = fs.readFileSync("app/page.tsx", "utf8");
  assert.match(home, /export const dynamic = "force-dynamic"/);
});

test("Google credentials are documented only as server variables", () => {
  const env = fs.readFileSync(".env.example", "utf8");
  for (const name of ["GOOGLE_CALENDAR_ID", "GOOGLE_CALENDAR_CLIENT_ID", "GOOGLE_CALENDAR_CLIENT_SECRET", "GOOGLE_CALENDAR_REFRESH_TOKEN"]) {
    assert.match(env, new RegExp(`^${name}=`, "m"));
    assert.doesNotMatch(env, new RegExp(`^NEXT_PUBLIC_${name}=`, "m"));
  }
});
