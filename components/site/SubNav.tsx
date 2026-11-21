"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { activityLinks, isActivePath } from "@/lib/site-nav";

type Props =
  | { kind: "activities" }
  | { kind: "anchors"; label: string; items: { id: string; label: string }[] };

/**
 * Faixa de abas colada sob o cabeçalho.
 * - "activities": cada aba é uma página; a atual leva aria-current="page".
 * - "anchors": cada aba é uma seção da mesma página; a que está na tela leva aria-current="true".
 * Um único indicador desliza até a aba ativa.
 */
export default function SubNav(props: Props) {
  const pathname = usePathname();
  const anchorIds = props.kind === "anchors" ? props.items.map((item) => item.id).join(",") : "";
  const [visibleId, setVisibleId] = useState<string | null>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const [ready, setReady] = useState(false);

  const currentKey = props.kind === "activities"
    ? activityLinks.find((link) => isActivePath(pathname, link.href))?.href ?? null
    : visibleId;

  // Scroll-spy: a seção que cruza a faixa central da tela é a ativa.
  useEffect(() => {
    if (!anchorIds) return;
    const sections = anchorIds.split(",").map((id) => document.getElementById(id)).filter((node): node is HTMLElement => Boolean(node));
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) if (entry.isIntersecting) setVisibleId(entry.target.id);
    }, { rootMargin: "-40% 0px -55% 0px" });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [anchorIds]);

  // Move o indicador e mantém a aba ativa à vista na rolagem horizontal (celular).
  useEffect(() => {
    const list = trackRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return;
    const place = () => {
      const active = list.querySelector<HTMLElement>("[aria-current]");
      if (!active) { setReady(false); return; }
      indicator.style.setProperty("--x", `${active.offsetLeft}px`);
      indicator.style.setProperty("--w", `${active.offsetWidth}px`);
      setReady(true);
    };
    place();
    const active = list.querySelector<HTMLElement>("[aria-current]");
    if (active && props.kind === "activities") active.scrollIntoView({ inline: "center", block: "nearest" });
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [currentKey, props.kind]);

  const label = props.kind === "activities" ? "Páginas de atividades" : props.label;

  return (
    <nav className="subnav" aria-label={label}>
      <div className="container subnav-scroll">
        <div className="subnav-track" ref={trackRef}>
        <ul className="subnav-list">
          {props.kind === "activities"
            ? activityLinks.map(({ href, label: text, icon: Icon }) => (
                <li key={href}>
                  <Link className="subnav-link" href={href} aria-current={currentKey === href ? "page" : undefined}>
                    <Icon aria-hidden="true" /> {text}
                  </Link>
                </li>
              ))
            : props.items.map((item) => (
                <li key={item.id}>
                  <a className="subnav-link" href={`#${item.id}`} aria-current={currentKey === item.id ? "true" : undefined}>
                    {item.label}
                  </a>
                </li>
              ))}
        </ul>
        <span ref={indicatorRef} className={`subnav-indicator${ready ? " is-ready" : ""}`} aria-hidden="true" />
        </div>
      </div>
    </nav>
  );
}
