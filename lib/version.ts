// Versão do site que está publicada.
//
// O deploy injeta NEXT_PUBLIC_APP_VERSION (tag, ou o hash curto do commit) e
// NEXT_PUBLIC_APP_BUILD_DATE (data do commit, AAAA-MM-DD) no momento do BUILD,
// porque o pacote enviado ao servidor não carrega o histórico do Git. Sem essas
// variáveis (por exemplo num build manual), o rodapé não mostra versão em
// produção e mostra "desenvolvimento" fora dela.
export type SiteVersion = { label: string; date: string | null };

// "2026-11-17" -> "17/11/2026". Qualquer outro formato é ignorado.
export function formatBuildDate(value: string | undefined): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value?.trim() ?? "");
  return match ? `${match[3]}/${match[2]}/${match[1]}` : null;
}

export function getSiteVersion(): SiteVersion | null {
  const label = process.env.NEXT_PUBLIC_APP_VERSION?.trim();
  if (label) return { label, date: formatBuildDate(process.env.NEXT_PUBLIC_APP_BUILD_DATE) };
  return process.env.NODE_ENV === "production" ? null : { label: "desenvolvimento", date: null };
}
