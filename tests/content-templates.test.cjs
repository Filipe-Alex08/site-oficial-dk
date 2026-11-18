const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");

function load(file) {
  const source = ts.transpileModule(fs.readFileSync(path.join(__dirname, "..", file), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  vm.runInNewContext(source, { exports, Date, Number, Math, String, Boolean, Array, Object, RegExp }, { filename: file });
  return exports;
}

const lib = load("lib/content-templates.ts");

test("template de publicacao nunca publica e gera o slug do titulo", () => {
  const form = lib.templateToPostForm({ title: "Treino de Sábado", excerpt: "r", content: "c", category: "Eventos", cover_url: "", youtube_url: "", tiktok_url: "" });
  assert.equal(form.published, false);
  assert.equal(form.slug, "treino-de-sabado");
  assert.equal(form.category, "Eventos");
});

test("template de publicacao guarda so os campos do conteudo", () => {
  const data = lib.postFormToTemplate({ ...lib.emptyPost, title: "A", slug: "a", published: true });
  assert.equal("slug" in data, false);
  assert.equal("published" in data, false);
});

test("dados incompletos do jsonb assumem os padroes", () => {
  assert.deepEqual({ ...lib.normalizePostTemplateData({}) }, { title: "", excerpt: "", content: "", category: "Treinos", cover_url: "", youtube_url: "", tiktok_url: "" });
  const activity = lib.normalizeActivityTemplateData({ status: "inexistente", start_time: "25:99", duration_minutes: -5, attendance_open: "sim" });
  assert.equal(activity.status, "confirmado");
  assert.equal(activity.start_time, "");
  assert.equal(activity.duration_minutes, null);
  assert.equal(activity.attendance_open, true);
  assert.equal(activity.type, "Treino");
  assert.equal(lib.normalizePostTemplateData(null).title, "");
});

test("atividade: guarda horario e duracao, sem a data", () => {
  const data = lib.activityFormToTemplate({ ...lib.emptyActivity, title: "Treino", location: "Praça", starts_at: "2026-11-21T19:00", ends_at: "2026-11-21T20:30" });
  assert.equal(data.start_time, "19:00");
  assert.equal(data.duration_minutes, 90);
  assert.equal(JSON.stringify(data).includes("2026"), false);
});

test("atividade: termino antes do inicio ou ausente nao gera duracao", () => {
  assert.equal(lib.activityFormToTemplate({ ...lib.emptyActivity, starts_at: "2026-11-21T19:00", ends_at: "" }).duration_minutes, null);
  assert.equal(lib.activityFormToTemplate({ ...lib.emptyActivity, starts_at: "2026-11-21T19:00", ends_at: "2026-11-21T18:00" }).duration_minutes, null);
  assert.equal(lib.activityFormToTemplate({ ...lib.emptyActivity }).start_time, "");
});

test("atividade: aplicar mantem a data do formulario e calcula o termino", () => {
  const data = lib.normalizeActivityTemplateData({ title: "Treino", location: "Praça", start_time: "19:00", duration_minutes: 90 });
  const form = lib.templateToActivityForm(data, { starts_at: "2026-12-05T08:00" });
  assert.equal(form.starts_at, "2026-12-05T19:00");
  assert.equal(form.ends_at, "2026-12-05T20:30");
  assert.equal(form.title, "Treino");
});

test("atividade: duracao que vira o dia muda a data do termino", () => {
  const data = lib.normalizeActivityTemplateData({ start_time: "23:00", duration_minutes: 120 });
  const form = lib.templateToActivityForm(data, { starts_at: "2026-12-05T08:00" });
  assert.equal(form.starts_at, "2026-12-05T23:00");
  assert.equal(form.ends_at, "2026-12-06T01:00");
});

test("atividade: sem duracao deixa o termino vazio; sem data usa hoje", () => {
  const data = lib.normalizeActivityTemplateData({ start_time: "18:30" });
  const form = lib.templateToActivityForm(data, { starts_at: "" }, new Date(2026, 10, 18, 9, 0));
  assert.equal(form.starts_at, "2026-11-18T18:30");
  assert.equal(form.ends_at, "");
});

test("atividade: template sem horario preserva o horario ja preenchido", () => {
  const data = lib.normalizeActivityTemplateData({ title: "Reunião", duration_minutes: 60 });
  const form = lib.templateToActivityForm(data, { starts_at: "2026-12-05T10:15" });
  assert.equal(form.starts_at, "2026-12-05T10:15");
  assert.equal(form.ends_at, "2026-12-05T11:15");
  const bare = lib.templateToActivityForm(data, { starts_at: "" });
  assert.equal(bare.starts_at, "");
  assert.equal(bare.ends_at, "");
});

test("ida e volta de atividade preserva os campos", () => {
  const original = { ...lib.emptyActivity, title: "Treino", type: "Treino", status: "a_definir", location: "Praça", description: "Trazer água", attendance_open: false, starts_at: "2026-11-21T07:00", ends_at: "2026-11-21T09:00" };
  const again = lib.templateToActivityForm(lib.activityFormToTemplate(original), original);
  assert.deepEqual({ ...again }, original);
});

test("nome do template e limpo e limitado", () => {
  assert.equal(lib.cleanTemplateName("  Treino   de   sábado  "), "Treino de sábado");
  assert.equal(lib.cleanTemplateName("x".repeat(200)).length, lib.templateNameMaxLength);
});

test("migration 021 libera cada tipo so para o papel certo", () => {
  const sql = fs.readFileSync(path.join(__dirname, "..", "supabase/migrations/021_content_templates.sql"), "utf8");
  assert.match(sql, /enable row level security/);
  assert.equal((sql.match(/kind = 'post' and public\.has_admin_role\('midias'\)/g) || []).length, 5);
  assert.equal((sql.match(/kind = 'activity' and public\.has_admin_role\('atividades'\)/g) || []).length, 5);
  assert.doesNotMatch(sql, /\bto anon\b/);
});
