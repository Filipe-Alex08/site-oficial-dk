"use client";

import { MoreHorizontal } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";

export type RowMenuItem = {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
  /** Ação destrutiva: vai para o fim da lista, separada e em vermelho. */
  danger?: boolean;
  disabled?: boolean;
  /** Item que não se aplica a esta linha. */
  hidden?: boolean;
};

/**
 * Menu "⋯" de ações de linha. Ações seguras primeiro; as destrutivas ficam separadas
 * no fim, longe do clique acidental. Abre num portal (não é cortado pela tabela).
 */
export default function RowMenu({ label, items }: { label: string; items: RowMenuItem[] }) {
  const visible = items.filter((item) => !item.hidden);
  const ordered = [...visible.filter((item) => !item.danger), ...visible.filter((item) => item.danger)];
  const firstDanger = ordered.findIndex((item) => item.danger);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    const close = () => setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", close);
    window.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", close);
      window.removeEventListener("scroll", close, true);
    };
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) { setPosition(null); return; }
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 220;
    const height = ordered.length * 40 + (firstDanger > 0 ? 9 : 0) + 12;
    const openUp = window.innerHeight - rect.bottom < height + 12 && rect.top > height;
    setPosition({
      top: openUp ? rect.top - height - 6 : rect.bottom + 6,
      left: Math.max(8, Math.min(rect.right - width, window.innerWidth - width - 8)),
    });
  }, [open, ordered.length, firstDanger]);

  useEffect(() => {
    if (open && position) itemRefs.current[active]?.focus();
  }, [open, position, active]);

  if (!ordered.length) return null;

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) { setActive(0); setOpen(true); return; }
      setActive((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + ordered.length) % ordered.length);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      event.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (event.key === "Tab" && open) {
      setOpen(false);
    }
  }

  function choose(item: RowMenuItem) {
    if (item.disabled) return;
    setOpen(false);
    triggerRef.current?.focus();
    item.onSelect();
  }

  return <>
    <button
      ref={triggerRef}
      type="button"
      className="row-menu-trigger"
      aria-label={label}
      title={label}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={() => { setActive(0); setOpen((current) => !current); }}
      onKeyDown={onKeyDown}
    ><MoreHorizontal aria-hidden="true" /></button>
    {open && position && createPortal(
      <div ref={menuRef} className="row-menu" role="menu" aria-label={label} style={{ position: "fixed", top: position.top, left: position.left }} onKeyDown={onKeyDown}>
        {ordered.map((item, index) => <div key={item.label} role="none">
          {index === firstDanger && index > 0 && <div className="row-menu-sep" role="separator" />}
          <button
            ref={(element) => { itemRefs.current[index] = element; }}
            type="button"
            role="menuitem"
            tabIndex={-1}
            className={`row-menu-item${item.danger ? " is-danger" : ""}`}
            disabled={item.disabled}
            onMouseEnter={() => setActive(index)}
            onClick={() => choose(item)}
          >{item.icon}<span>{item.label}</span></button>
        </div>)}
      </div>,
      document.body,
    )}
  </>;
}
