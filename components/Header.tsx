"use client";

import Link from "next/link";
import { ChevronDown, Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";

const activityLinks = [
  ["Swordplay/Boffering", "/atividades/swordplay"],
  ["Tipos de Atividades", "/atividades/tipos"],
  ["Jogos", "/atividades/jogos"],
  ["Graduações", "/atividades/graduacoes"],
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link className="brand" href="/" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">
            DK
          </span>
          <span className="brand-copy">
            <strong>Death Knights</strong>
            <small>Swordplay • Belo Horizonte</small>
          </span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>

        <nav
          className={"main-nav " + (open ? "is-open" : "")}
          aria-label="Menu principal"
        >
          <Link
            className={active("/") ? "active" : ""}
            href="/"
            onClick={() => setOpen(false)}
          >
            Página Inicial
          </Link>
          <Link
            className={active("/sobre") ? "active" : ""}
            href="/sobre"
            onClick={() => setOpen(false)}
          >
            Sobre o DK
          </Link>

          <div className="nav-dropdown">
            <button
              className={active("/atividades") ? "active" : ""}
              type="button"
            >
              Atividades <ChevronDown size={15} />
            </button>
            <div className="dropdown-panel">
              {activityLinks.map(([label, href]) => (
                <Link key={href} href={href} onClick={() => setOpen(false)}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <Link
            className={active("/midias") ? "active" : ""}
            href="/midias"
            onClick={() => setOpen(false)}
          >
            Mídias
          </Link>

          <Link
            className={active("/eventos") ? "active" : ""}
            href="/eventos"
            onClick={() => setOpen(false)}
          >
            Eventos
          </Link>

          <Link
            className="member-link"
            href="/area-do-membro/login"
            onClick={() => setOpen(false)}
          >
            Área do Membro
          </Link>
        </nav>

        <p className="header-motto">
          <span>Disciplina</span>
          <span>Movimento</span>
          <span>Comunidade</span>
        </p>
      </div>
    </header>
  );
}
