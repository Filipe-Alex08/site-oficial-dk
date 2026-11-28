"use client";

import { Ellipsis, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import type { AdminNavItem, AdminSection } from "@/components/admin/AdminDataContext";
import { useDialogBehavior } from "@/components/admin/ui/useDialogBehavior";
import CountBadge from "@/components/ui/CountBadge";

/** Ordem em que as seções disputam as vagas fixas da barra (as demais vão para "Mais"). */
const priority: AdminSection[] = ["resumo", "membros", "calendario", "torneio", "midias", "simulados", "presencas", "convites", "documentos", "logs", "configuracoes"];

/** Navegação do painel no celular: quatro atalhos fixos e uma folha com todo o resto. */
export default function AdminBottomBar({ nav, section, onSelect }: { nav: AdminNavItem[]; section: AdminSection; onSelect: (id: AdminSection) => void }) {
  const [open, setOpen] = useState(false);
  const rank = (id: AdminSection) => priority.indexOf(id);
  const sorted = [...nav].sort((a, b) => rank(a.id) - rank(b.id));
  const fitsAll = nav.length <= 5;
  const pinned = fitsAll ? sorted : sorted.slice(0, 4);
  const moreActive = !pinned.some((item) => item.id === section);
  const moreBadge = fitsAll ? 0 : sorted.slice(4).reduce((total, item) => total + (item.badge ?? 0), 0);

  return <>
    <nav className="admin-bottombar" aria-label="Seções do painel">
      {pinned.map((item) => <button key={item.id} type="button" className={item.id === section ? "active" : ""} aria-current={item.id === section ? "page" : undefined} onClick={() => onSelect(item.id)}>
        {item.icon}<span>{item.label}</span><CountBadge count={item.badge ?? 0} label={item.badgeLabel ?? "pendências"} />
      </button>)}
      {!fitsAll && <button type="button" className={moreActive ? "active" : ""} aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        <Ellipsis /><span>Mais</span><CountBadge count={moreBadge} label="pendências" />
      </button>}
    </nav>
    {open && <Sheet nav={nav} section={section} onClose={() => setOpen(false)} onSelect={(id) => { setOpen(false); onSelect(id); }} />}
  </>;
}

function Sheet({ nav, section, onClose, onSelect }: { nav: AdminNavItem[]; section: AdminSection; onClose: () => void; onSelect: (id: AdminSection) => void }) {
  const titleId = useId();
  const ref = useRef<HTMLElement>(null);
  useDialogBehavior(ref, onClose, "button.sheet-close");
  const groups = nav.reduce<Array<{ label: string; items: AdminNavItem[] }>>((all, item) => {
    const group = all.find((entry) => entry.label === item.group);
    if (group) group.items.push(item); else all.push({ label: item.group, items: [item] });
    return all;
  }, []);

  return <div className="sheet-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={ref} className="sheet" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header><h3 id={titleId}>Todas as seções</h3><button className="admin-dialog-close sheet-close" type="button" onClick={onClose} aria-label="Fechar"><X size={18} aria-hidden="true" /></button></header>
      {groups.map((group) => <div className="sheet-group" key={group.label}>
        {group.label && <span className="admin-nav-label">{group.label}</span>}
        <div className="sheet-grid">
          {group.items.map((item) => <button key={item.id} type="button" className={item.id === section ? "active" : ""} onClick={() => onSelect(item.id)}>
            {item.icon}<span>{item.label}</span><CountBadge count={item.badge ?? 0} label={item.badgeLabel ?? "pendências"} />
          </button>)}
        </div>
      </div>)}
    </section>
  </div>;
}
