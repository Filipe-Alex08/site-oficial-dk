const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");

function load(file, requireMap = {}) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(source, { exports, require: (name) => requireMap[name] }, { filename: file });
  // Resultados criados dentro do vm tem outro Object/Array: normaliza para o deepEqual estrito comparar.
  return Object.fromEntries(Object.entries(exports).map(([key, value]) => [key, typeof value === "function" ? (...args) => { const out = value(...args); return out !== null && typeof out === "object" ? JSON.parse(JSON.stringify(out)) : out; } : value]));
}

const access = load("lib/member-access.ts");
const notes = load("lib/member-notes.ts", { "@/lib/member-access": access });
const { canWriteNotes, canWriteNoteTo, recipientRestriction, parseNotesSettings, noteSealsFor, sealsOfNote, rankAtLeast, cleanNoteBody, NOTE_MAX } = notes;

const settings = (overrides = {}) => ({ enabled: true, writers: "both", commanderScope: "any", minRank: "subtenente", ...overrides });

const member = (overrides = {}) => ({
  status: "aprovado", rank: "soldado",
  graduation_cavalaria: "sem_graduacao", graduation_arquearia: "sem_graduacao",
  commander_cavalaria: false, commander_arquearia: false,
  ...overrides,
});

test("patente minima: igual ou superior passa, inferior nao", () => {
  assert.equal(rankAtLeast("subtenente", "subtenente"), true);
  assert.equal(rankAtLeast("general_exercito", "subtenente"), true);
  assert.equal(rankAtLeast("primeiro_sargento", "subtenente"), false);
  assert.equal(rankAtLeast("recruta", "subtenente"), false);
});

test("pode escrever: patente minima ou comandante de trilha, sempre aprovado", () => {
  const cfg = settings();
  assert.equal(canWriteNotes(member(), cfg), false);
  assert.equal(canWriteNotes(member({ rank: "subtenente" }), cfg), true);
  assert.equal(canWriteNotes(member({ rank: "subtenente" }), settings({ minRank: "tenente" })), false);
  const tenente = settings({ minRank: "tenente" });
  assert.equal(canWriteNotes(member({ graduation_cavalaria: "bronze", commander_cavalaria: true }), tenente), true);
  assert.equal(canWriteNotes(member({ graduation_arquearia: "prata", commander_arquearia: true }), tenente), true);
  // Marca de comandante sem graduacao na trilha nao vale.
  assert.equal(canWriteNotes(member({ commander_cavalaria: true }), tenente), false);
  assert.equal(canWriteNotes(member({ rank: "general_exercito", status: "suspenso" }), cfg), false);
  assert.equal(canWriteNotes(null, cfg), false);
});

test("modo de escrita: so comandantes, so patentes ou os dois", () => {
  const commander = member({ graduation_cavalaria: "bronze", commander_cavalaria: true });
  const officer = member({ rank: "major" });
  const both = member({ rank: "major", graduation_cavalaria: "bronze", commander_cavalaria: true });
  const onlyCommanders = settings({ writers: "commanders" });
  assert.deepEqual([commander, officer, both].map((p) => canWriteNotes(p, onlyCommanders)), [true, false, true]);
  const onlyRanks = settings({ writers: "ranks" });
  assert.deepEqual([commander, officer, both].map((p) => canWriteNotes(p, onlyRanks)), [false, true, true]);
  assert.deepEqual([commander, officer, both].map((p) => canWriteNotes(p, settings())), [true, true, true]);
});

test("sistema desligado: ninguem escreve", () => {
  assert.equal(canWriteNotes(member({ rank: "general_exercito" }), settings({ enabled: false })), false);
  assert.equal(canWriteNoteTo(member({ rank: "general_exercito" }), member(), settings({ enabled: false })), false);
});

test("alcance do comandante: qualquer membro, mesma trilha ou mesma trilha e graduacao", () => {
  const commander = member({ graduation_cavalaria: "bronze", commander_cavalaria: true });
  const sameLevel = member({ graduation_cavalaria: "bronze" });
  const otherLevel = member({ graduation_cavalaria: "ouro" });
  const otherTrack = member({ graduation_arquearia: "bronze" });
  const nobody = member();
  const reach = (scope) => [sameLevel, otherLevel, otherTrack, nobody].map((r) => canWriteNoteTo(commander, r, settings({ commanderScope: scope })));
  assert.deepEqual(reach("any"), [true, true, true, true]);
  assert.deepEqual(reach("track"), [true, true, false, false]);
  assert.deepEqual(reach("track_level"), [true, false, false, false]);
});

test("alcance: comandante de duas trilhas vale se uma delas casar", () => {
  const both = member({ graduation_cavalaria: "ouro", commander_cavalaria: true, graduation_arquearia: "bronze", commander_arquearia: true });
  const cfg = settings({ commanderScope: "track_level" });
  assert.equal(canWriteNoteTo(both, member({ graduation_arquearia: "bronze" }), cfg), true);
  assert.equal(canWriteNoteTo(both, member({ graduation_arquearia: "prata" }), cfg), false);
  // Comandar so conta nas trilhas em que a marca de comandante esta ligada.
  const one = member({ graduation_cavalaria: "ouro", commander_cavalaria: true, graduation_arquearia: "bronze" });
  assert.equal(canWriteNoteTo(one, member({ graduation_arquearia: "bronze" }), cfg), false);
});

test("alcance: quem tem a patente minima escreve para qualquer membro, mesmo sendo comandante", () => {
  const cfg = settings({ commanderScope: "track_level", minRank: "subtenente" });
  const majorCommander = member({ rank: "major", graduation_cavalaria: "bronze", commander_cavalaria: true });
  assert.equal(canWriteNoteTo(majorCommander, member(), cfg), true);
  // No modo so comandantes a patente nao conta: a restricao volta a valer.
  assert.equal(canWriteNoteTo(majorCommander, member(), { ...cfg, writers: "commanders" }), false);
  // O modo so patentes ignora o comando.
  const lowRankCommander = member({ graduation_cavalaria: "bronze", commander_cavalaria: true });
  assert.equal(canWriteNoteTo(lowRankCommander, member({ graduation_cavalaria: "bronze" }), { ...cfg, writers: "ranks" }), false);
});

test("frase de restricao so aparece para quem escreve como comandante", () => {
  const commander = member({ graduation_cavalaria: "bronze", commander_cavalaria: true });
  assert.equal(recipientRestriction(commander, settings()), null);
  assert.match(recipientRestriction(commander, settings({ commanderScope: "track" })), /graduação em Cavalaria/);
  assert.match(recipientRestriction(commander, settings({ commanderScope: "track_level" })), /mesma graduação/);
  assert.equal(recipientRestriction(member({ rank: "major" }), settings({ commanderScope: "track" })), null);
});

test("configuracoes: ausente ou invalido volta ao padrao do banco", () => {
  assert.deepEqual(parseNotesSettings([]), settings());
  assert.deepEqual(parseNotesSettings(null), settings());
  const rows = [
    { key: "notes_enabled", value: false },
    { key: "notes_writers", value: "commanders" },
    { key: "notes_commander_scope", value: "track_level" },
    { key: "notes_min_rank", value: "tenente" },
  ];
  assert.deepEqual(parseNotesSettings(rows), settings({ enabled: false, writers: "commanders", commanderScope: "track_level", minRank: "tenente" }));
  const bad = [{ key: "notes_writers", value: "todos" }, { key: "notes_commander_scope", value: 3 }, { key: "notes_min_rank", value: "rei" }, { key: "notes_enabled", value: "nao" }];
  assert.deepEqual(parseNotesSettings(bad), settings());
});

test("selo: comandante da trilha + destinatario com graduacao na mesma trilha (qualquer nivel)", () => {
  const commander = member({ graduation_cavalaria: "bronze", commander_cavalaria: true });
  assert.deepEqual(noteSealsFor(commander, member({ graduation_cavalaria: "bronze" })), [{ track: "cavalaria", level: "bronze" }]);
  // Nivel diferente do destinatario: ainda leva o selo, na cor do comandante.
  assert.deepEqual(noteSealsFor(commander, member({ graduation_cavalaria: "ouro" })), [{ track: "cavalaria", level: "bronze" }]);
});

test("selo: nao ha selo para outra trilha, sem graduacao ou sem ser comandante", () => {
  const commander = member({ graduation_cavalaria: "bronze", commander_cavalaria: true });
  assert.deepEqual(noteSealsFor(commander, member({ graduation_arquearia: "bronze" })), []);
  assert.deepEqual(noteSealsFor(commander, member()), []);
  const notCommander = member({ graduation_cavalaria: "ouro" });
  assert.deepEqual(noteSealsFor(notCommander, member({ graduation_cavalaria: "ouro" })), []);
  // Patente alta sem comando de trilha tambem nao tem selo.
  assert.deepEqual(noteSealsFor(member({ rank: "coronel" }), member({ graduation_cavalaria: "ouro" })), []);
});

test("selo: a cor segue o nivel do comandante e duas trilhas geram dois selos", () => {
  const silver = member({ graduation_cavalaria: "prata", commander_cavalaria: true });
  assert.deepEqual(noteSealsFor(silver, member({ graduation_cavalaria: "bronze" })), [{ track: "cavalaria", level: "prata" }]);
  const both = member({ graduation_cavalaria: "ouro", commander_cavalaria: true, graduation_arquearia: "bronze", commander_arquearia: true });
  assert.deepEqual(
    noteSealsFor(both, member({ graduation_cavalaria: "bronze", graduation_arquearia: "prata" })),
    [{ track: "cavalaria", level: "ouro" }, { track: "arquearia", level: "bronze" }],
  );
});

test("selos gravados na anotacao", () => {
  assert.deepEqual(sealsOfNote({ seal_cavalaria: null, seal_arquearia: null }), []);
  assert.deepEqual(sealsOfNote({ seal_cavalaria: "prata", seal_arquearia: null }), [{ track: "cavalaria", level: "prata" }]);
  assert.deepEqual(sealsOfNote({ seal_cavalaria: null, seal_arquearia: "ouro" }), [{ track: "arquearia", level: "ouro" }]);
});

test("texto da anotacao: limpa, nao vazia e com limite", () => {
  assert.equal(cleanNoteBody("  ola \r\n mundo  "), "ola \n mundo");
  assert.equal(cleanNoteBody("   "), null);
  assert.equal(cleanNoteBody(42), null);
  assert.equal(cleanNoteBody("a".repeat(NOTE_MAX)), "a".repeat(NOTE_MAX));
  assert.equal(cleanNoteBody("a".repeat(NOTE_MAX + 1)), null);
});

test("a migracao 025 calcula o selo no banco e fecha a escrita direta", () => {
  const sql = fs.readFileSync("supabase/migrations/025_member_notes.sql", "utf8");
  const code = sql.split(/\r?\n/).filter((line) => !/^\s*--/.test(line)).join("\n");
  assert.match(code, /create trigger member_notes_before_write/);
  assert.match(code, /revoke all on public\.member_notes from anon, authenticated;\s*grant select on public\.member_notes to authenticated;/);
  // Conteudo privado: a tabela nao entra na trilha de auditoria dos ADMs.
  assert.doesNotMatch(code, /log_admin_audit/);
});

test("a migracao 026 centraliza a regra e o gatilho de insercao a usa", () => {
  const sql = fs.readFileSync("supabase/migrations/026_notes_settings.sql", "utf8");
  const code = sql.split(/\r?\n/).filter((line) => !/^\s*--/.test(line)).join("\n");
  assert.match(code, /create or replace function public\.note_write_allowed\(author uuid, recipient uuid default null\)/);
  assert.match(code, /if not public\.note_write_allowed\(new\.author_id, new\.recipient_id\) then\s*raise exception 'note_not_allowed' using errcode = '42501'/);
  // A regra completa nao fica exposta ao navegador: so as funcoes que usam auth.uid().
  assert.match(code, /revoke all on function public\.note_write_allowed\(uuid, uuid\) from public, anon, authenticated;/);
});
