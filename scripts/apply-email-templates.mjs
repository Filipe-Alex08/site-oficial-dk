#!/usr/bin/env node
// Aplica os modelos de e-mail em português (public/email-templates) a um projeto
// Supabase HOSPEDADO pela API de gerenciamento. Sem --apply só mostra o que faria.
//
//   node --env-file=.env.local scripts/apply-email-templates.mjs           (simulação)
//   node --env-file=.env.local scripts/apply-email-templates.mjs --apply   (aplica)
//
// Precisa de SUPABASE_ACCESS_TOKEN: um token pessoal (supabase.com/dashboard/account/tokens),
// definido só no terminal de quem roda; nunca vai para o .env.local nem para o Git.
// O projeto vem de NEXT_PUBLIC_SUPABASE_URL (https://<ref>.supabase.co). Servidor
// próprio não tem essa API: use as variáveis GOTRUE_MAILER_* descritas em docs/EMAILS.md.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.resolve(fileURLToPath(new URL("../public/email-templates", import.meta.url)));
const apply = process.argv.includes("--apply");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ref = /^https:\/\/([a-z0-9]{20})\.supabase\.co\/?$/.exec(url)?.[1];
if (!ref) {
  console.error("NEXT_PUBLIC_SUPABASE_URL não é de um projeto hospedado (https://<ref>.supabase.co). Nada foi feito.");
  process.exit(1);
}

const subjects = JSON.parse(await readFile(path.join(dir, "assuntos.json"), "utf8"));
const body = {};
for (const [name, subject] of Object.entries(subjects)) {
  body[`mailer_subjects_${name}`] = subject;
  body[`mailer_templates_${name}_content`] = await readFile(path.join(dir, `${name}.html`), "utf8");
}

console.log(`Projeto: ${ref}`);
for (const [key, value] of Object.entries(body)) console.log(`  ${key} (${value.length} caracteres)`);

if (!apply) {
  console.log("\nSimulação: nada foi enviado. Rode de novo com --apply para aplicar.");
  process.exit(0);
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error("\nDefina SUPABASE_ACCESS_TOKEN no terminal antes de usar --apply.");
  process.exit(1);
}

const response = await fetch(`https://api.supabase.com/v1/projects/${ref}/config/auth`, {
  method: "PATCH",
  headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
  body: JSON.stringify(body),
});
if (!response.ok) {
  console.error(`\nA API recusou (HTTP ${response.status}): ${(await response.text()).slice(0, 300)}`);
  process.exit(1);
}
console.log("\nModelos aplicados. Confira em Authentication → Emails → Templates.");
