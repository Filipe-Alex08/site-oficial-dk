#!/usr/bin/env node
// Impede que uma migração nova reuse um prefixo numérico já usado.
//
// As migrações são aplicadas à mão no SQL Editor (veja docs/SETUP.md), então o
// prefixo é a única indicação de ordem: o banco não registra nomes de arquivo.
// Os prefixos repetidos que já existem ficam numa lista de exceções, porque
// renomeá-los agora só criaria divergência com o que já rodou em produção.
import { readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Veja supabase/migrations/README.md para o motivo de cada exceção. A lista é
// exata de propósito: um terceiro arquivo com prefixo 002 também é erro, então
// não basta liberar o prefixo.
const KNOWN_DUPLICATES = new Map([
  ["002", ["002_document_access_rules.sql", "002_instagram_import.sql"]],
  ["003", ["003_chained_document_rules.sql", "003_service_role_table_access.sql"]],
  ["005", ["005_post_video_links.sql", "005_registration_security.sql"]],
]);

const migrationsDir = path.resolve(fileURLToPath(new URL("../supabase/migrations", import.meta.url)));

const entries = await readdir(migrationsDir);
const byPrefix = new Map();

for (const name of entries) {
  const match = /^(\d+)_/.exec(name);
  if (!match) continue;
  const list = byPrefix.get(match[1]) ?? [];
  list.push(name);
  byPrefix.set(match[1], list);
}

const duplicates = [...byPrefix.entries()].filter(([, names]) => names.length > 1);
const isKnown = ([prefix, names]) => {
  const expected = KNOWN_DUPLICATES.get(prefix);
  if (!expected) return false;
  return [...names].sort().join("|") === [...expected].sort().join("|");
};
const known = duplicates.filter(isKnown);
const unexpected = duplicates.filter((group) => !isKnown(group));

if (known.length) {
  console.warn(`Prefixos duplicados já conhecidos (ok): ${known.map(([prefix, names]) => `${prefix} → ${names.length} arquivos`).join(", ")}`);
}

if (unexpected.length) {
  console.error("\nMigrações com um prefixo numérico já usado:");
  for (const [prefix, names] of unexpected) {
    console.error(`  ${prefix}: ${names.join(", ")}`);
  }
  console.error("\nRenomeie o arquivo novo para o próximo número livre.");
  process.exit(1);
}

console.log(`${byPrefix.size} migrações, nenhum prefixo duplicado novo.`);
