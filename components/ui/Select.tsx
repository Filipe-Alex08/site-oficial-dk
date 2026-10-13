"use client";

import { ChevronDown } from "lucide-react";
import { KeyboardEvent, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type SelectOption = { value: string; label: string; group?: string };

export default function Select({ id, value, options, onChange, disabled = false }: {
  id?: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuStyle, setMenuStyle] = useState<{ top: number; left: number; width: number; maxHeight: number } | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = `${id ?? "select"}-options`;
  const selected = useMemo(() => options.find((option) => option.value === value), [options, value]);

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return;
      setOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  useLayoutEffect(() => {
    if (!open || !rootRef.current) { setMenuStyle(null); return; }
    function positionMenu() {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const gap = 6;
      const margin = 8;
      const desiredHeight = Math.min(280, Math.max(120, options.length * 38));
      const roomBelow = window.innerHeight - rect.bottom - gap - margin;
      const roomAbove = rect.top - gap - margin;
      const openUp = roomBelow < Math.min(desiredHeight, 180) && roomAbove > roomBelow;
      const maxHeight = Math.max(100, Math.min(desiredHeight, openUp ? roomAbove : roomBelow));
      const left = Math.max(margin, Math.min(rect.left, window.innerWidth - rect.width - margin));
      setMenuStyle({ top: openUp ? Math.max(margin, rect.top - maxHeight - gap) : rect.bottom + gap, left, width: rect.width, maxHeight });
    }
    positionMenu();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
    return () => {
      window.removeEventListener("resize", positionMenu);
      window.removeEventListener("scroll", positionMenu, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    const activeOption = optionRefs.current[activeIndex];
    if (open && activeOption && document.activeElement !== activeOption) activeOption.focus();
  }, [activeIndex, menuStyle, open]);

  function openMenu(index = options.findIndex((option) => option.value === value)) {
    setActiveIndex(index >= 0 ? index : 0);
    setOpen(true);
  }

  function choose(option: SelectOption) {
    onChange(option.value);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!open) openMenu();
      else setActiveIndex((index) => (index + (event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length);
    } else if (event.key === "Escape" && open) {
      event.preventDefault(); setOpen(false); triggerRef.current?.focus();
    } else if (event.key === "Enter" || event.key === " ") {
      if (!open) { event.preventDefault(); openMenu(); }
    }
  }

  return <div className={`site-select${open ? " is-open" : ""}`} ref={rootRef}>
    <button ref={triggerRef} id={id} type="button" className="site-select-trigger" aria-haspopup="listbox" aria-expanded={open} aria-controls={menuId} disabled={disabled} onClick={() => open ? setOpen(false) : openMenu()} onKeyDown={handleKeyDown}>
      <span>{selected?.label ?? "Selecione uma opção"}</span><ChevronDown size={17} aria-hidden="true" />
    </button>
    {open && menuStyle && createPortal(<div ref={menuRef} className="site-select-menu" style={{ position: "fixed", top: menuStyle.top, left: menuStyle.left, width: menuStyle.width, maxHeight: menuStyle.maxHeight }} id={menuId} role="listbox" aria-activedescendant={`${menuId}-${activeIndex}`} onKeyDown={handleKeyDown}>
      {options.map((option, index) => {
        const showGroup = option.group && option.group !== options[index - 1]?.group;
        return <div className="site-select-option-wrap" key={option.value}>
          {showGroup && <div className="site-select-group" role="presentation">{option.group}</div>}
          <button ref={(element) => { optionRefs.current[index] = element; }} id={`${menuId}-${index}`} className="site-select-option" type="button" role="option" aria-selected={option.value === value} tabIndex={-1} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(option)}>{option.label}</button>
        </div>;
      })}
    </div>, document.body)}
  </div>;
}
