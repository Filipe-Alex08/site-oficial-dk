const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const dir = "public/email-templates";
const subjects = JSON.parse(fs.readFileSync(`${dir}/assuntos.json`, "utf8"));

test("todo tipo de e-mail de autenticacao tem modelo e assunto em portugues", () => {
  for (const name of ["recovery", "email_change", "confirmation", "invite", "magic_link", "reauthentication"]) {
    const html = fs.readFileSync(`${dir}/${name}.html`, "utf8");
    assert.match(html, /<html lang="pt-BR">/, name);
    assert.match(html, /<meta charset="utf-8">/, name);
    assert.ok(subjects[name]?.includes("Death Knights"), name);
    // Reautenticacao leva um codigo; os demais levam o link do GoTrue (nao pode faltar nem ser trocado por URL fixa).
    assert.match(html, name === "reauthentication" ? /\{\{ \.Token \}\}/ : /\{\{ \.ConfirmationURL \}\}/, name);
    assert.doesNotMatch(html, /https?:\/\/(?!\{\{)/, `${name}: sem endereco fixo nem imagem externa`);
  }
});

test("a troca de e-mail mostra o endereco de origem e o de destino", () => {
  const html = fs.readFileSync(`${dir}/email_change.html`, "utf8");
  assert.match(html, /\{\{ \.Email \}\}/);
  assert.match(html, /\{\{ \.NewEmail \}\}/);
});

test("o modelo de recuperacao avisa que o link e do mesmo navegador e que ignorar e seguro", () => {
  const html = fs.readFileSync(`${dir}/recovery.html`, "utf8");
  assert.match(html, /mesmo navegador/);
  assert.match(html, /ignore este e-mail/);
});

test("a frase de seguranca aparece nos e-mails enviados so ao dono da conta, nunca na troca de e-mail", () => {
  for (const name of ["recovery", "confirmation", "invite", "magic_link", "reauthentication"]) {
    const html = fs.readFileSync(`${dir}/${name}.html`, "utf8");
    assert.match(html, /\{\{ if \.Data\.frase_seguranca \}\}/, name);
    assert.match(html, /não foi enviado por nós/, name);
    assert.match(html, /\{\{ else \}\}/, name);
  }
  // O mesmo modelo vai para o endereco novo: texto editavel pelo usuario nao pode ir junto.
  assert.doesNotMatch(fs.readFileSync(`${dir}/email_change.html`, "utf8"), /frase_seguranca/);
});

// --- E-mails enviados pelo site (cadastro recebido e aprovado) ----------------

const vm = require("node:vm");
const ts = require("typescript");

const siteNames = ["cadastro_recebido", "cadastro_aprovado"];
const siteSubjects = JSON.parse(fs.readFileSync(`${dir}/assuntos-site.json`, "utf8"));
const readSite = (name) => fs.readFileSync(`${dir}/${name}.html`, "utf8");

function loadMailer({ env = {}, sendMail = async () => {} } = {}) {
  const logs = [];
  const sent = [];
  const exports = {};
  const mocks = {
    nodemailer: { createTransport: (options) => ({ sendMail: async (message) => { sent.push({ options, message }); return sendMail(message); } }) },
    "@/lib/app-log": { logEvent: (entry) => logs.push(entry) },
    "@/lib/log-sanitize": { maskEmail: () => "m***@example.com" },
  };
  vm.runInNewContext(ts.transpileModule(fs.readFileSync("lib/site-email.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText, {
    exports, process: { env, cwd: () => process.cwd() },
    require: (name) => name in mocks ? mocks[name] : require(name),
  });
  return { ...exports, logs, sent };
}

const smtp = { SMTP_HOST: "smtp.test", SMTP_PORT: "587", SMTP_USER: "user", SMTP_PASS: "pass", SMTP_ADMIN_EMAIL: "noreply@example.com" };

test("os modelos do site seguem o formato dos do Auth e ficam fora da lista enviada ao Auth", () => {
  const base = readSite("recovery");
  for (const name of siteNames) {
    const html = readSite(name);
    assert.match(html, /<html lang="pt-BR">/, name);
    assert.match(html, /<meta charset="utf-8">/, name);
    assert.ok(siteSubjects[name]?.includes("Death Knights"), name);
    assert.equal(subjects[name], undefined, name);
    assert.match(html, /\{\{ \.Email \}\}/, name);
    assert.doesNotMatch(html, /https?:\/\/(?!\{\{)/, `${name}: sem endereco fixo nem imagem externa`);
    // Mesmo cabecalho e rodape.
    assert.ok(html.includes(base.slice(base.indexOf("<body"), base.indexOf("<h1"))), name);
    assert.ok(html.endsWith(base.slice(base.lastIndexOf('<tr><td style="padding:16px'))), name);
  }
  assert.match(readSite("cadastro_recebido"), /aguarda a aprovação de um administrador/);
  assert.doesNotMatch(readSite("cadastro_recebido"), /\{\{ \.ConfirmationURL \}\}|frase_seguranca/);
  assert.match(readSite("cadastro_aprovado"), /\{\{ \.ConfirmationURL \}\}/);
});

test("o preenchimento escapa HTML, nao reinterpreta valores e escolhe o quadro da frase", () => {
  const { renderSiteEmail } = loadMailer();
  const url = "https://example.com/area-do-membro/login";
  const approved = readSite("cadastro_aprovado");

  const withPhrase = renderSiteEmail(approved, `a<b>"&@example.com`, { actionUrl: url, securityPhrase: "Lobo cinza" });
  assert.ok(withPhrase.includes("a&lt;b&gt;&quot;&amp;@example.com"));
  assert.ok(withPhrase.includes(`href="${url}"`));
  assert.match(withPhrase, /Sua frase de segurança: <strong>Lobo cinza<\/strong>/);
  assert.doesNotMatch(withPhrase, /ainda não definiu|\{\{/);

  const without = renderSiteEmail(approved, "member@example.com", { actionUrl: url });
  assert.match(without, /ainda não definiu uma frase de segurança/);
  assert.doesNotMatch(without, /Sua frase de segurança:|\{\{/);

  assert.ok(renderSiteEmail("{{ .Email }}", "{{ .ConfirmationURL }}", { actionUrl: url }).includes("{{ .ConfirmationURL }}"));
  assert.doesNotMatch(renderSiteEmail(readSite("cadastro_recebido"), "member@example.com"), /\{\{/);
  assert.throws(() => renderSiteEmail("{{ .Token }}", "member@example.com"));
});

test("envia pelo SMTP configurado, com assunto do modelo e um unico destinatario", async () => {
  for (const name of siteNames) {
    const mailer = loadMailer({ env: smtp });
    await mailer.sendSiteEmail(name, "member@example.com", { actionUrl: "https://example.com/area-do-membro/login" });
    const [{ options, message }] = mailer.sent;
    assert.equal(options.secure, false);
    assert.equal(options.requireTLS, true);
    assert.equal(message.subject, siteSubjects[name]);
    assert.equal(message.to.address, "member@example.com");
    assert.deepEqual([message.from.name, message.from.address], ["Death Knights", "noreply@example.com"]);
    assert.ok(message.html.includes("member@example.com"));
    assert.equal(mailer.logs[0].action, "email_enviado");
  }
});

test("sem SMTP ou com falha no envio, so registra no log e nunca lanca", async () => {
  const unset = loadMailer({ env: { ...smtp, SMTP_PASS: "" } });
  await unset.sendSiteEmail("cadastro_recebido", "member@example.com");
  assert.equal(unset.sent.length, 0);
  assert.equal(unset.logs[0].action, "email_nao_configurado");

  const failing = loadMailer({ env: smtp, sendMail: async () => { throw new Error("550 <member@example.com> recusado"); } });
  await failing.sendSiteEmail("cadastro_recebido", "member@example.com");
  assert.equal(failing.logs[0].action, "email_falhou");
  assert.doesNotMatch(JSON.stringify(failing.logs), /member@example\.com/);
});
