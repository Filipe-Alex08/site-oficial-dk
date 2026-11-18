"use client";

import { CircleHelp } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

/** Ícone (?) com explicação: abre com hover ou foco e, no toque, ao tocar. */
export default function InfoTip({ children, label = "Mais informações" }: { children: ReactNode; label?: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLSpanElement>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return <span className={`info-tip${open ? " is-open" : ""}`} ref={rootRef}>
    <button type="button" className="info-tip-button" aria-label={label} aria-expanded={open} aria-describedby={id} onClick={() => setOpen((current) => !current)}>
      <CircleHelp aria-hidden="true" />
    </button>
    <span role="tooltip" id={id} className="info-tip-card">{children}</span>
  </span>;
}
