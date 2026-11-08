// Este cookie guarda o access token E o refresh token: é uma credencial
// durável, não um crachá de curta validade. Quem lê o valor continua entrando na
// conta mesmo depois de o access token expirar.
//
// `httpOnly` ainda NÃO está ligado aqui, de propósito: é a última etapa da
// migração para o proxy. Com o navegador ainda podendo ler o cookie, um XSS
// rouba a sessão inteira. Depois de ler lib/supabase/client.ts dá para ligá-lo
// — nada no navegador precisa mais do valor —, mas só depois de conferir à mão
// login, upload de foto, painel administrativo e saída.
//
// `Secure` é derivado da URL pública do site para que servidor e navegador
// gravem o mesmo conjunto de atributos — se os dois discordarem, o navegador
// cria cookies duplicados e a sessão fica inconsistente.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "";
const cookieRequiresTls = siteUrl
  ? siteUrl.startsWith("https://")
  : process.env.NODE_ENV === "production";

export const SUPABASE_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  secure: cookieRequiresTls,
  maxAge: 400 * 24 * 60 * 60,
};
