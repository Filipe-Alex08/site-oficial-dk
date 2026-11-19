// Preferência de aparência da área do membro: seguir a graduação ou ficar no padrão.
// Fica num cookie para o servidor já entregar a página com o tema certo (sem piscar).
// O cookie é gravado pela rota /api/member/style e só o servidor o lê: nenhum código
// do navegador toca em document.cookie (veja tests/auth-hardening.test.cjs).
// Arquivo puro, sem imports de runtime: o servidor, o cliente e os testes usam o mesmo.

export const MEMBER_STYLE_COOKIE = "dk_member_style";

export type MemberStyle = "graduacao" | "padrao";
export type MemberTheme = "padrao" | "bronze" | "prata" | "ouro";

/** Um ano; vale no site todo. `secure` é acrescentado por quem grava (depende do HTTPS do site). */
export const MEMBER_STYLE_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365,
};

/** Valor exato aceito ao gravar (a rota recusa qualquer outra coisa). */
export function isMemberStyle(value: unknown): value is MemberStyle {
  return value === "graduacao" || value === "padrao";
}

/** Ao ler, qualquer valor ausente ou desconhecido vira "graduacao": é o comportamento de antes do alternador. */
export function parseMemberStyle(value: string | null | undefined): MemberStyle {
  return value === "padrao" ? "padrao" : "graduacao";
}

/** Tema que de fato vale: o padrão ganha sempre que o membro escolheu "padrao". */
export function effectiveMemberTheme(style: MemberStyle, graduationTheme: MemberTheme): MemberTheme {
  return style === "padrao" ? "padrao" : graduationTheme;
}
