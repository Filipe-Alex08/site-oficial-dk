import { privateRobots } from "@/lib/seo";
import AdminProviders from "@/components/admin/AdminProviders";
import MemberNav from "@/components/member/MemberNav";
import { getMemberBadges } from "@/lib/member-badges";

export const metadata = { robots: privateRobots };

export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, ...badges } = await getMemberBadges();
  // Avisos e confirmações usam os mesmos provedores do painel administrativo.
  return <div className="app-area member-shell">
    <AdminProviders>
      <MemberNav isAdmin={isAdmin} badges={badges} />
      {children}
    </AdminProviders>
  </div>;
}
