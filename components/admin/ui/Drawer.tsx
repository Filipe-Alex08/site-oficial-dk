"use client";

import { X } from "lucide-react";
import { useId, useRef, type FormEvent, type ReactNode } from "react";
import { useDialogBehavior } from "@/components/admin/ui/useDialogBehavior";

/**
 * Gaveta lateral para formulários longos (criar/editar sem perder a lista de vista).
 * Em telas pequenas ocupa a tela toda. Mesmo comportamento do AdminDialog:
 * foco preso, Esc fecha e o foco volta para quem abriu.
 *
 * Com `onSubmit`, só o corpo e o rodapé ficam dentro do <form>: o `headerExtra`
 * (barra de templates, abas…) fica de fora e pode abrir os próprios diálogos com formulário.
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

  const body = <>
    <div className="admin-drawer-body">{children}</div>
    {footer && <footer className="admin-dialog-foot">{footer}</footer>}
  </>;

  return <div className="admin-drawer-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <aside ref={ref} className={`admin-drawer${wide ? " is-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <header className="admin-drawer-head">
        <div className="admin-drawer-title"><h3 id={titleId}>{title}</h3>{description && <p>{description}</p>}</div>
        <button className="admin-dialog-close admin-drawer-close" type="button" onClick={onClose} aria-label="Fechar"><X size={18} aria-hidden="true" /></button>
      </header>
      {headerExtra && <div className="admin-drawer-extra">{headerExtra}</div>}
      {onSubmit ? <form className="admin-drawer-form" onSubmit={onSubmit}>{body}</form> : body}
    </aside>
  </div>;
}
