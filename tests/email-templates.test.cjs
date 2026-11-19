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
