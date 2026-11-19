"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CalendarCheck, ClipboardCheck, FileText, House, NotebookPen, PanelLeftClose, PanelLeftOpen, Settings } from "lucide-react";
import CountBadge from "@/components/ui/CountBadge";
import { useStoredFlag } from "@/components/admin/useStoredFlag";

type NavItem = { href: string; label: string; icon: ReactNode; count: number; countLabel: string; exact?: boolean };
type Badges = { activitiesToAnswer: number; assessmentsToTake: number; membersToReview: number; notesUnread: number; notesEnabled: boolean };

/**
 * Navegação da área do membro, no mesmo padrão do painel administrativo:
 * barra lateral recolhível no computador e barra inferior no celular.
 * Some durante a realização de uma avaliação, que pede atenção total.
 */
export default function MemberNav({ isAdmin, badges }: { isAdmin: boolean; badges: Badges }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useStoredFlag("dk-member-sidebar-collapsed");
  const items: NavItem[] = [
    { href: "/membro", label: "Início", icon: <House />, count: 0, countLabel: "", exact: true },
    { href: "/membro/atividades", label: "Atividades", icon: <CalendarCheck />, count: badges.activitiesToAnswer, countLabel: "atividades sem resposta" },
    { href: "/membro/documentos", label: "Documentos", icon: <FileText />, count: 0, countLabel: "" },
    ...(badges.notesEnabled ? [{ href: "/membro/anotacoes", label: "Anotações", icon: <NotebookPen />, count: badges.notesUnread, countLabel: "anotações não lidas" }] : []),
    { href: "/membro/simulados", label: "Avaliações", icon: <ClipboardCheck />, count: badges.assessmentsToTake, countLabel: "avaliações para fazer" },
  ];
  const admin: NavItem = { href: "/admin", label: "Painel", icon: <Settings />, count: badges.membersToReview, countLabel: "membros aguardando ação", exact: false };
  const all = isAdmin ? [...items, admin] : items;
  const isActive = (item: NavItem) => item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
  // /membro/simulados/<token>: a prova ocupa a tela toda.
  if (/^\/membro\/simulados\/[^/]+/.test(pathname)) return null;

  const link = (item: NavItem) => <Link key={item.href} href={item.href} className={isActive(item) ? "active" : ""} aria-current={isActive(item) ? "page" : undefined} title={collapsed ? item.label : undefined}>
    {item.icon}<span>{item.label}</span><CountBadge count={item.count} label={item.countLabel} />
  </Link>;

  return <>
    <aside className="member-sidebar" data-collapsed={collapsed ? "true" : "false"}>
      <div className="member-sidebar-head">
        <Image className="admin-brand-mark" src="/images/dk-emblem.webp" alt="" width={34} height={34} />
        <div className="admin-brand-text"><strong>DK</strong><span>Membro</span></div>
        <button className="admin-collapse" type="button" onClick={() => setCollapsed(!collapsed)} aria-pressed={collapsed} aria-label={collapsed ? "Expandir barra lateral" : "Recolher barra lateral"} title={collapsed ? "Expandir" : "Recolher"}>
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
        </button>
      </div>
      <nav aria-label="Área do membro">{all.map(link)}</nav>
    </aside>
    <nav className="member-bottombar" aria-label="Área do membro">
      {all.map((item) => <Link key={item.href} href={item.href} className={isActive(item) ? "active" : ""} aria-current={isActive(item) ? "page" : undefined}>
        {item.icon}<span>{item.label}</span><CountBadge count={item.count} label={item.countLabel} />
      </Link>)}
    </nav>
  </>;
}
