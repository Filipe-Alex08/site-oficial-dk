const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

// O editor roda no servidor com python3; aqui basta qualquer Python 3 (no Windows, "python").
const python = ["python3", "python"].find((cmd) => {
  const probe = spawnSync(cmd, ["-c", "import sys; sys.exit(0 if sys.version_info[0] == 3 else 1)"]);
  return probe.status === 0;
});
const skip = python ? false : "Python 3 nao encontrado";

const editor = "deploy/remote-email-templates-edit.py";
const subjects = JSON.parse(fs.readFileSync("public/email-templates/assuntos.json", "utf8"));

const compose = (eol = "\n") => [
  "services:",
  "  studio:",
  "    environment:",
  "      STUDIO_PG_META_URL: http://meta:8080",
  "",
  "  auth:",
  "    image: supabase/gotrue:v2",
  "    environment:",
  "      GOTRUE_SITE_URL: ${SITE_URL}",
  "      GOTRUE_MAILER_AUTOCONFIRM: ${ENABLE_EMAIL_AUTOCONFIRM}",
  "    depends_on:",
  "      - db",
  "",
  "  rest:",
  "    environment:",
  "      PGRST_DB_SCHEMAS: public",
  "",
].join(eol);

function run(composeText, base = "https://dk.example/email-templates", subjectsOverride = subjects) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "dk-emails-"));
  const composePath = path.join(dir, "docker-compose.yml");
  const subjectsPath = path.join(dir, "assuntos.json");
  fs.writeFileSync(composePath, composeText, "utf8");
  fs.writeFileSync(subjectsPath, JSON.stringify(subjectsOverride), "utf8");
  const result = spawnSync(python, ["-I", editor, composePath, dir, base, subjectsPath], { encoding: "utf8" });
  const out = path.join(dir, "compose.new");
  return { status: result.status, stderr: result.stderr, text: fs.existsSync(out) ? fs.readFileSync(out, "utf8") : null, dir };
}

test("liga os 6 assuntos e 6 modelos so no servico auth, entre aspas e com acentos legiveis", { skip }, () => {
  const r = run(compose());
  assert.equal(r.status, 0, r.stderr);
  const lines = r.text.split("\n");
  const keys = lines.filter((l) => /GOTRUE_MAILER_(SUBJECTS|TEMPLATES)_/.test(l));
  assert.equal(keys.length, 12);
  assert.ok(lines.includes('      GOTRUE_MAILER_SUBJECTS_RECOVERY: "Redefinir sua senha — Death Knights"'));
  assert.ok(lines.includes('      GOTRUE_MAILER_TEMPLATES_RECOVERY: "https://dk.example/email-templates/recovery.html"'));
  assert.ok(lines.includes('      GOTRUE_MAILER_TEMPLATES_EMAIL_CHANGE: "https://dk.example/email-templates/email_change.html"'));
  // As linhas novas ficam dentro do auth: depois de GOTRUE_MAILER_AUTOCONFIRM e antes de depends_on.
  const first = lines.findIndex((l) => l.includes("GOTRUE_MAILER_SUBJECTS_"));
  assert.ok(first > lines.indexOf("      GOTRUE_MAILER_AUTOCONFIRM: ${ENABLE_EMAIL_AUTOCONFIRM}") && first < lines.indexOf("    depends_on:"));
  // O resto do arquivo e os outros servicos ficam como estavam.
  const without = lines.filter((l) => !/GOTRUE_MAILER_(SUBJECTS|TEMPLATES)_|E-mails em portugues/.test(l)).join("\n");
  assert.equal(without, compose());
  assert.equal((r.text.match(/E-mails em portugues/g) || []).length, 1);
});

test("aplicar de novo o mesmo resultado nao muda nada (exit 3), e mudar o endereco troca sem duplicar", { skip }, () => {
  const first = run(compose());
  assert.equal(run(first.text).status, 3);
  const moved = run(first.text, "http://172.18.0.1:3000/email-templates");
  assert.equal(moved.status, 0, moved.stderr);
  assert.equal((moved.text.match(/GOTRUE_MAILER_TEMPLATES_RECOVERY/g) || []).length, 1);
  assert.ok(moved.text.includes('"http://172.18.0.1:3000/email-templates/recovery.html"'));
  const changedSubject = run(first.text, "https://dk.example/email-templates", { ...subjects, recovery: "Outro assunto" });
  assert.equal(changedSubject.status, 0);
  assert.ok(changedSubject.text.includes('GOTRUE_MAILER_SUBJECTS_RECOVERY: "Outro assunto"'));
});

test("compose com final de linha CRLF continua CRLF", { skip }, () => {
  const r = run(compose("\r\n"));
  assert.equal(r.status, 0, r.stderr);
  assert.ok(!/[^\r]\n/.test(r.text), "nenhuma linha ficou so com LF");
});

test("formatos que nao da para editar com seguranca sao recusados sem gravar nada", { skip }, () => {
  const noAuth = run("services:\n  rest:\n    environment:\n      A: b\n");
  assert.equal(noAuth.status, 1);
  assert.equal(noAuth.text, null);
  const listFormat = run(compose().replace("GOTRUE_SITE_URL: ${SITE_URL}", "- GOTRUE_SITE_URL=x").replace("      GOTRUE_MAILER_AUTOCONFIRM: ${ENABLE_EMAIL_AUTOCONFIRM}", "      - A=b"));
  assert.equal(listFormat.status, 1);
  for (const base of ["https://dk.example/email-templates/", "javascript:alert(1)", "https://dk.example/a b", ""]) {
    assert.equal(run(compose(), base).status, 1, base);
  }
  assert.equal(run(compose(), "https://dk.example/email-templates", { ...subjects, recovery: "com $VAR" }).status, 1);
});

test("os scripts de servidor tem sintaxe valida e o release encadeia o passo dos e-mails", () => {
  const bash = spawnSync("bash", ["--version"]);
  if (bash.status === 0) {
    for (const file of ["deploy/remote-email-templates.sh", "deploy/remote-release.sh"]) {
      const check = spawnSync("bash", ["-n", file], { encoding: "utf8" });
      assert.equal(check.status, 0, `${file}: ${check.stderr}`);
    }
  }
  const release = fs.readFileSync("deploy/remote-release.sh", "utf8");
  assert.match(release, /remote-email-templates\.sh" apply/);
  assert.match(release, /NO_EMAIL_TEMPLATES/);
  // Falha nesse passo nao desfaz a publicacao: precisa estar numa condicao (set -e nao pode abortar o release).
  assert.match(release, /elif ! bash "\$DIR\/remote-email-templates\.sh" apply/);
  const deploy = fs.readFileSync("deploy/deploy.ps1", "utf8");
  assert.match(deploy, /\[switch\]\$NoEmailTemplates/);
  assert.match(deploy, /Copy-Lf "remote-email-templates\.sh"/);
  assert.match(deploy, /Copy-Lf "remote-email-templates-edit\.py"/);
  assert.match(deploy, /NO_EMAIL_TEMPLATES=1/);
});

test("o site serve os modelos e o robots.txt os esconde dos buscadores", () => {
  assert.ok(fs.existsSync("public/email-templates/recovery.html"));
  assert.match(fs.readFileSync("app/robots.ts", "utf8"), /"\/email-templates\/"/);
});
