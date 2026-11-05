// O cliente de navegador precisa ler o cookie de sessão, então HttpOnly não é
// definido aqui (a CSP é o controle compensatório contra roubo de token por
// XSS). `Secure` é derivado da URL pública do site para que servidor e
// navegador gravem o mesmo conjunto de atributos — se os dois discordarem, o
// navegador cria cookies duplicados e a sessão fica inconsistente.
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
