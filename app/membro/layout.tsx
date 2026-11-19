import { cookies } from "next/headers";
import { privateRobots } from "@/lib/seo";
import AdminProviders from "@/components/admin/AdminProviders";
import MemberNav from "@/components/member/MemberNav";
import MemberThemeProvider from "@/components/member/MemberThemeProvider";
import { getMemberBadges } from "@/lib/member-badges";
import { getMemberTheme } from "@/lib/member-access";
import { MEMBER_STYLE_COOKIE, parseMemberStyle } from "@/lib/member-style";
import { getViewer } from "@/lib/viewer";

export const metadata = { robots: privateRobots };

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  // getViewer e getMemberBadges compartilham a mesma consulta (cache por requisição).
  const [{ isAdmin, ...badges }, { profile }, cookieStore] = await Promise.all([getMemberBadges(), getViewer(), cookies()]);
  const initialStyle = parseMemberStyle(cookieStore.get(MEMBER_STYLE_COOKIE)?.value);
  // O tema sai já no HTML do servidor: nada de esperar o cabeçalho buscar a conta.
  // Avisos e confirmações usam os mesmos provedores do painel administrativo.
  return <MemberThemeProvider initialStyle={initialStyle} graduationTheme={getMemberTheme(profile)}>
    <AdminProviders>
      <MemberNav isAdmin={isAdmin} badges={badges} />
      <div className="member-content">{children}</div>
    </AdminProviders>
  </MemberThemeProvider>;
}
