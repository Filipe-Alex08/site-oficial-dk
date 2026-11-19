#!/usr/bin/env node
// Gera os modelos de e-mail do Supabase Auth em português (public/email-templates).
//
// Os e-mails de autenticação saem do servidor de Auth (GoTrue), não do site, então o
// texto vive nestes modelos e é colado no painel (ou apontado por variável de
// ambiente, no servidor próprio). Veja docs/EMAILS.md.
//
// O layout é um só (tabelas e estilos em linha, que é o que os leitores de e-mail
// aceitam, sem imagens externas para não depender de "carregar imagens") e cada
// modelo traz só o conteúdo. Variáveis do GoTrue: {{ .ConfirmationURL }}, {{ .Email }},
// {{ .NewEmail }}, {{ .Token }}.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const outDir = path.resolve(fileURLToPath(new URL("../public/email-templates", import.meta.url)));
const BRAND = "Death Knights";

const templates = {
  recovery: {
    subject: `Redefinir sua senha — ${BRAND}`,
    title: "Redefinir sua senha",
    intro: "Recebemos um pedido para criar uma nova senha para a conta {{ .Email }}.",
    button: "Criar nova senha",
    outro: "O link vale por tempo limitado e só pode ser aberto no mesmo navegador em que o pedido foi feito. Se não foi você, ignore este e-mail: sua senha continua a mesma.",
  },
  email_change: {
    phrase: false,
    subject: `Confirme a troca de e-mail — ${BRAND}`,
    title: "Confirmar troca de e-mail",
    intro: "Houve um pedido para trocar o e-mail da conta {{ .Email }} para {{ .NewEmail }}.",
    button: "Confirmar a troca",
    outro: "Por segurança, a troca só vale depois de confirmada nos dois endereços: você pode receber este aviso no e-mail atual e no novo. Se não foi você, ignore este e-mail e troque sua senha.",
  },
  confirmation: {
    subject: `Confirme seu e-mail — ${BRAND}`,
    title: "Confirmar seu e-mail",
    intro: "Falta só confirmar que este e-mail é seu para ativar a conta.",
    button: "Confirmar e-mail",
    outro: "Se não foi você, ignore este e-mail.",
  },
  invite: {
    subject: `Você foi convidado — ${BRAND}`,
    title: "Você foi convidado",
    intro: "Você recebeu um convite para entrar na área dos membros.",
    button: "Aceitar convite",
    outro: "Se você não esperava este convite, ignore este e-mail.",
  },
  magic_link: {
    subject: `Seu link de acesso — ${BRAND}`,
    title: "Seu link de acesso",
    intro: "Use o botão abaixo para entrar na área dos membros.",
    button: "Entrar",
    outro: "O link vale por tempo limitado. Se não foi você, ignore este e-mail.",
  },
  reauthentication: {
    subject: `Código de confirmação — ${BRAND}`,
    title: "Código de confirmação",
    intro: "Use o código abaixo para confirmar a operação. Ele vale por poucos minutos.",
    code: "{{ .Token }}",
    outro: "Se não foi você, ignore este e-mail e troque sua senha.",
  },
};

// Frase de segurança do membro (user_metadata.frase_seguranca, veja lib/security-phrase.ts).
// Um e-mail falso não sabe a frase; sem ela definida, o e-mail ensina a criar.
// A troca de e-mail NÃO leva a frase: o GoTrue usa o mesmo modelo para o endereço
// atual e para o novo, e user_metadata é editável pelo próprio usuário, então mostrar
// esse texto ao endereço novo deixaria um membro mal-intencionado escrever o que
// quisesse num e-mail "oficial" enviado a outra pessoa.
const PHRASE_BLOCK = `{{ if .Data.frase_seguranca }}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px"><tr><td style="padding:14px 16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;font-size:14px;line-height:1.5;color:#065f46">
            Sua frase de segurança: <strong>{{ .Data.frase_seguranca }}</strong><br>
            Se este e-mail não mostrar a sua frase, não clique em nada: ele não foi enviado por nós.
          </td></tr></table>
          {{ else }}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px"><tr><td style="padding:14px 16px;background:#fffbeb;border:1px solid #fde68a;border-radius:8px;font-size:14px;line-height:1.5;color:#92400e">
            Você ainda não definiu uma frase de segurança. Crie uma em Editar perfil, na seção Segurança: ela passa a aparecer nos nossos e-mails e mostra quais são verdadeiros.
          </td></tr></table>
          {{ end }}`;

function render({ title, intro, button, code, outro, phrase = true }) {
  const action = code
    ? `<p style="margin:0 0 24px;font-size:30px;letter-spacing:8px;font-weight:700;color:#111827;text-align:center">${code}</p>`
    : `<p style="margin:0 0 24px;text-align:center"><a href="{{ .ConfirmationURL }}" style="display:inline-block;padding:14px 28px;border-radius:8px;background:#b91c1c;color:#ffffff;font-weight:700;font-size:16px;text-decoration:none">${button}</a></p>
          <p style="margin:0 0 24px;font-size:13px;color:#6b7280;word-break:break-all">Se o botão não funcionar, copie e cole este endereço no navegador:<br><a href="{{ .ConfirmationURL }}" style="color:#b91c1c">{{ .ConfirmationURL }}</a></p>`;
  return `<!doctype html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden">
        <tr><td style="background:#111827;padding:20px 28px;color:#ffffff;font-size:18px;font-weight:700;letter-spacing:2px;text-transform:uppercase">${BRAND}</td></tr>
        <tr><td style="padding:28px">
          <h1 style="margin:0 0 16px;font-size:22px;color:#111827">${title}</h1>
          <p style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#374151">${intro}</p>
          ${phrase ? PHRASE_BLOCK : ""}
          ${action}
          <p style="margin:0;font-size:13px;line-height:1.5;color:#6b7280">${outro}</p>
        </td></tr>
        <tr><td style="padding:16px 28px;background:#f9fafb;font-size:12px;line-height:1.5;color:#6b7280">Mensagem automática de ${BRAND}. Nunca pedimos sua senha por e-mail. Não responda a este endereço.</td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;
}

await mkdir(outDir, { recursive: true });
for (const [name, template] of Object.entries(templates)) {
  await writeFile(path.join(outDir, `${name}.html`), render(template), "utf8");
}
await writeFile(path.join(outDir, "assuntos.json"), `${JSON.stringify(Object.fromEntries(Object.entries(templates).map(([name, template]) => [name, template.subject])), null, 2)}\n`, "utf8");
console.log(`${Object.keys(templates).length} modelos gerados em ${outDir}`);
