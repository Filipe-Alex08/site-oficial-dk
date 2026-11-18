import { privateRobots } from "@/lib/seo";
import AdminProviders from "@/components/admin/AdminProviders";

export const metadata = { robots: privateRobots };

export default function PrivateLayout({ children }: { children: React.ReactNode }) {
  // Avisos e confirmações usam os mesmos provedores do painel administrativo.
  return <div className="app-area"><AdminProviders>{children}</AdminProviders></div>;
}
