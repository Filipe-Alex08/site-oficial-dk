import { Castle, Dices, ListChecks, Swords } from "lucide-react";
import { GraduationIcon } from "@/components/site/icons";
import type { ComponentType } from "react";

type NavIcon = ComponentType<{ size?: number | string; className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

/** Fonte única da navegação pública: cabeçalho, rodapé, sub-navegação e "anterior/próxima". */
export type NavLink = { label: string; href: string; icon?: NavIcon };

export const mainLinks: NavLink[] = [
  { label: "Início", href: "/" },
  { label: "Sobre", href: "/sobre" },
  { label: "Mídias", href: "/midias" },
  { label: "Eventos", href: "/eventos" },
];

/** Ordem de leitura das páginas de Atividades (também é a ordem das abas e do "próxima"). */
export const activityLinks: (NavLink & { icon: NavIcon })[] = [
  { label: "Swordplay e Boffering", href: "/atividades/swordplay", icon: Swords },
  { label: "Tipos de atividades", href: "/atividades/tipos", icon: ListChecks },
  { label: "Jogos", href: "/atividades/jogos", icon: Dices },
  { label: "Graduações", href: "/atividades/graduacoes", icon: GraduationIcon },
];

export const legalLinks: NavLink[] = [
  { label: "Privacidade", href: "/privacidade" },
  { label: "Termos", href: "/termos" },
];

export const footerColumns: { title: string; links: NavLink[] }[] = [
  { title: "O grupo", links: [mainLinks[0], mainLinks[1], mainLinks[2], mainLinks[3]] },
  { title: "Atividades", links: activityLinks },
  { title: "Legal", links: legalLinks },
];

/** A rota de um jogo pertence à aba "Jogos". */
export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}

export function activityNeighbours(href: string) {
  const index = activityLinks.findIndex((link) => isActivePath(href, link.href));
  return {
    prev: index > 0 ? activityLinks[index - 1] : null,
    next: index >= 0 && index < activityLinks.length - 1 ? activityLinks[index + 1] : null,
  };
}
