// Este cookie guarda o access token E o refresh token: é uma credencial
// durável, não um crachá de curta validade. Quem lê o valor continua entrando na
// conta mesmo depois de o access token expirar.
//
// `httpOnly` fica ligado: nada no navegador lê o cookie. As chamadas de dados
// passam pelo proxy em app/api/supabase (lib/supabase/client.ts) e login, conta
// e saída ficam em app/api/auth. Se alguém voltar a usar createBrowserClient ou
// document.cookie para a sessão, vai parar de funcionar — de propósito, porque
// com o cookie legível um XSS rouba a sessão inteira.
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
  httpOnly: true,
  sameSite: "lax" as const,
  secure: cookieRequiresTls,
  maxAge: 400 * 24 * 60 * 60,
};
