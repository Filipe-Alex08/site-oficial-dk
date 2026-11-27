// E-mails enviados pelo próprio site: cadastro recebido e cadastro aprovado. O Auth do
// Supabase não tem modelo para esses dois momentos, então o site os envia pelo mesmo SMTP.
// Os modelos são gerados por scripts/build-email-templates.mjs, no mesmo layout dos do
// Auth. Veja docs/EMAILS.md. Só para código de servidor.
import { readFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import { logEvent } from "@/lib/app-log";
import { maskEmail } from "@/lib/log-sanitize";

export type SiteEmailName = "cadastro_recebido" | "cadastro_aprovado";

export type SiteEmailData = {
  /** Destino do botão (`{{ .ConfirmationURL }}`); só os modelos com botão usam. */
  actionUrl?: string;
  /** Já filtrada por readSecurityPhrase. */
  securityPhrase?: string;
};

const TEMPLATE_DIR = ["public", "email-templates"] as const;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Resolve só o que os modelos do site usam da sintaxe do Auth: o if/else da frase e três variáveis. */
export function renderSiteEmail(template: string, to: string, data: SiteEmailData = {}) {
  const phrase = data.securityPhrase || "";
  const values: Record<string, string> = {
    ".Email": to,
    ".ConfirmationURL": data.actionUrl || "",
    ".Data.frase_seguranca": phrase,
  };
  return template
    .replace(
      /\{\{ if \.Data\.frase_seguranca \}\}([\s\S]*?)\{\{ else \}\}([\s\S]*?)\{\{ end \}\}/g,
      (_match, withPhrase: string, withoutPhrase: string) => (phrase ? withPhrase : withoutPhrase),
    )
    // Uma única passada: o que um valor trouxer não é interpretado de novo.
    .replace(/\{\{ (\.[\w.]+) \}\}/g, (_match, name: string) => {
      if (!(name in values)) throw new Error(`variavel desconhecida no modelo: ${name}`);
      return escapeHtml(values[name]);
    });
}

function smtpConfig() {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_ADMIN_EMAIL?.trim();
  if (!host || !user || !pass || !from) return null;
  const port = Number(process.env.SMTP_PORT) || 587;
  return { host, port, user, pass, from, senderName: process.env.SMTP_SENDER_NAME?.trim() || "Death Knights" };
}

/** Nunca lança: uma falha no e-mail não pode desfazer um cadastro nem uma aprovação. */
export async function sendSiteEmail(name: SiteEmailName, to: string, data: SiteEmailData = {}) {
  const details = { modelo: name, email: maskEmail(to) };
  try {
    const config = smtpConfig();
    if (!config) {
      logEvent({ level: "aviso", category: "email", action: "email_nao_configurado", message: "E-mail não enviado: SMTP não configurado no site", details });
      return;
    }

    const dir = path.join(process.cwd(), ...TEMPLATE_DIR);
    const [template, subjects] = await Promise.all([
      readFile(path.join(dir, `${name}.html`), "utf8"),
      readFile(path.join(dir, "assuntos-site.json"), "utf8").then((text) => JSON.parse(text) as Record<string, string>),
    ]);

    const transport = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      requireTLS: config.port !== 465,
      auth: { user: config.user, pass: config.pass },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
    await transport.sendMail({
      from: { name: config.senderName, address: config.from },
      // Como objeto: o endereço nunca é lido como uma lista de destinatários.
      to: { name: "", address: to },
      subject: subjects[name],
      html: renderSiteEmail(template, to, data),
    });
    logEvent({ category: "email", action: "email_enviado", message: "E-mail enviado", details });
  } catch (error) {
    // A resposta do servidor SMTP costuma repetir o endereço; no log ele vai mascarado.
    const reason = (error instanceof Error ? error.message : String(error)).split(to).join(details.email);
    logEvent({ level: "erro", category: "email", action: "email_falhou", message: "Falha ao enviar e-mail", details: { ...details, erro: reason } });
  }
}
