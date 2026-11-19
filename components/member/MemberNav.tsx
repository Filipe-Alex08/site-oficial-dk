"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, ClipboardCheck, FileText, House, Settings } from "lucide-react";
import CountBadge from "@/components/ui/CountBadge";

type Badges = { activitiesToAnswer: number; assessmentsToTake: number; membersToReview: number };

/**
 * Navegação da área do membro: abas no topo (computador) e barra inferior (celular).
 * Some durante a realização de uma avaliação, que pede atenção total.
 */
export default function MemberNav({ isAdmin, badges }: { isAdmin: boolean; badges: Badges }) {
  const pathname = usePathname();
  const items = [
    { href: "/membro", label: "Início", icon: <House />, count: 0, countLabel: "", exact: true },
    { href: "/membro/atividades", label: "Atividades", icon: <CalendarCheck />, count: badges.activitiesToAnswer, countLabel: "atividades sem resposta" },
    { href: "/membro/documentos", label: "Documentos", icon: <FileText />, count: 0, countLabel: "" },
    { href: "/membro/simulados", label: "Avaliações", icon: <ClipboardCheck />, count: badges.assessmentsToTake, countLabel: "avaliações para fazer" },
    ...(isAdmin ? [{ href: "/admin", label: "Painel", icon: <Settings />, count: badges.membersToReview, countLabel: "membros aguardando ação", exact: false }] : []),
  ];
  const isActive = (item: { href: string; exact?: boolean }) => item.exact ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
  // /membro/simulados/<token>: a prova ocupa a tela toda.
  if (/^\/membro\/simulados\/[^/]+/.test(pathname)) return null;

  return <>
    <nav className="member-tabs" aria-label="Área do membro">
      <div className="container member-tabs-inner">
        {items.map((item) => <Link key={item.href} href={item.href} className={isActive(item) ? "active" : ""} aria-current={isActive(item) ? "page" : undefined}>
          {item.icon}<span>{item.label}</span><CountBadge count={item.count} label={item.countLabel} />
        </Link>)}
      </div>
    </nav>
    <nav className="member-bottombar" aria-label="Área do membro">
      {items.map((item) => <Link key={item.href} href={item.href} className={isActive(item) ? "active" : ""} aria-current={isActive(item) ? "page" : undefined}>
        {item.icon}<span>{item.label}</span><CountBadge count={item.count} label={item.countLabel} />
      </Link>)}
    </nav>
  </>;
}
