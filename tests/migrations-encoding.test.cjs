const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

// Em 2026-11 a migração 006 foi aplicada em produção lendo UTF-8 como Windows-1257 e
// gravou "CapricĆ³rnio" dentro de uma função. A partir da 017, o SQL fora de comentários
// deve ser ASCII puro: acentos entram por escape Unicode (U&'Capric\00F3rnio'), que não
// depende da codificação de quem aplicar o arquivo.
const dir = "supabase/migrations";
const recent = fs.readdirSync(dir).filter((f) => /^\d+_.*\.sql$/.test(f) && parseInt(f, 10) >= 17);

test("migracoes novas existem para serem checadas", () => {
  assert.ok(recent.length >= 2);
});

for (const file of recent) {
  test(`${file}: SQL fora de comentarios e ASCII (acentos so por escape Unicode)`, () => {
    const offenders = [];
    fs.readFileSync(`${dir}/${file}`, "utf8").split(/\r?\n/).forEach((line, i) => {
      if (/[^\x00-\x7F]/.test(line) && !/^\s*--/.test(line)) offenders.push(`${i + 1}: ${line.trim().slice(0, 80)}`);
    });
    assert.deepEqual(offenders, []);
  });
}

test("o aplicador de migracoes fixa o cliente psql em UTF-8", () => {
  assert.match(fs.readFileSync("deploy/remote-migrate.sh", "utf8"), /PGCLIENTENCODING=UTF8/);
});
