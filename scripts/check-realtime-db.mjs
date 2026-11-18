#!/usr/bin/env node
// Autoteste do canal de tempo real: conecta com REALTIME_DATABASE_URL, escuta
// dk_changes, envia um aviso para si mesmo e confere que ele chega. Também diz
// quantas tabelas já têm o gatilho da migração 023.
//
//   node --env-file=.env.local scripts/check-realtime-db.mjs
//
// Nunca imprime a URL nem a senha.
import pg from "pg";

const url = process.env.REALTIME_DATABASE_URL?.trim();
if (!url) {
  console.error("REALTIME_DATABASE_URL não está definida.");
  process.exit(2);
}

const client = new pg.Client({ connectionString: url, application_name: "dk-realtime-check", connectionTimeoutMillis: 10_000 });
let received = null;
client.on("notification", (message) => {
  if (message.channel === "dk_changes") received = message.payload;
});

try {
  await client.connect();
  console.log("ok   conectou ao banco");

  await client.query("LISTEN dk_changes");
  console.log("ok   LISTEN dk_changes aceito");

  await client.query(`select pg_notify('dk_changes', '{"table":"selftest","op":"TEST"}')`);
  for (let waited = 0; received === null && waited < 5000; waited += 100) await new Promise((r) => setTimeout(r, 100));
  if (received === null) throw new Error("o aviso de teste não chegou em 5 s (a conexão não suporta LISTEN? é a porta 6543?)");
  console.log("ok   aviso de teste recebido:", received);

  const { rows } = await client.query("select count(*)::int as n from pg_trigger where tgname = 'dk_broadcast_change' and not tgisinternal");
  console.log(rows[0].n > 0
    ? `ok   gatilho presente em ${rows[0].n} tabela(s)`
    : "AVISO nenhum gatilho dk_broadcast_change: aplique a migração 023.");
  await client.end();
} catch (error) {
  console.error("FALHA", error instanceof Error ? error.message : error);
  await client.end().catch(() => undefined);
  process.exit(1);
}
