"use client";

import { X } from "lucide-react";
import { useId, useRef, type FormEvent, type ReactNode } from "react";
import { useDialogBehavior } from "@/components/admin/ui/useDialogBehavior";

/**
 * Gaveta lateral para formulários longos (criar/editar sem perder a lista de vista).
 * Em telas pequenas ocupa a tela toda. Mesmo comportamento do AdminDialog:
 * foco preso, Esc fecha e o foco volta para quem abriu.
 */
export default function Drawer({ title, description, onClose, footer, children, onSubmit, headerExtra, wide = false }: {
  title: string;
  description?: string;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  /** Conteúdo fixo logo abaixo do título (abas, barra de templates…). */
  headerExtra?: ReactNode;
  wide?: boolean;
}) {
  const titleId = useId();
  const ref = useRef<HTMLElement>(null);
  useDialogBehavior(ref, onClose, "input:not(:disabled), textarea:not(:disabled), button.admin-drawer-close");

  const content = <>
    <header className="admin-drawer-head">
      <div className="admin-drawer-title"><h3 id={titleId}>{title}</h3>{description && <p>{description}</p>}</div>
      <button className="admin-dialog-close admin-drawer-close" type="button" onClick={onClose} aria-label="Fechar"><X size={18} aria-hidden="true" /></button>
    </header>
    {headerExtra && <div className="admin-drawer-extra">{headerExtra}</div>}
    <div className="admin-drawer-body">{children}</div>
    {footer && <footer className="admin-dialog-foot">{footer}</footer>}
  </>;

  return <div className="admin-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <aside ref={ref} className={`admin-drawer${wide ? " is-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      {onSubmit ? <form onSubmit={onSubmit}>{content}</form> : content}
    </aside>
  </div>;
}
