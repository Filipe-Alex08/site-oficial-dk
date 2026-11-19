"use client";

import { X } from "lucide-react";
import { useId, useRef, type ReactNode } from "react";
import { useDialogBehavior } from "@/components/admin/ui/useDialogBehavior";

/** Modal do painel. Não usa <dialog>: o menu do Select é um portal no body e ficaria atrás dele. */
export default function AdminDialog({ title, description, onClose, footer, children, onSubmit, size = "md" }: {
  title: string;
  description?: string;
  onClose: () => void;
  footer?: ReactNode;
  children?: ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  size?: "sm" | "md";
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  useDialogBehavior(dialogRef, onClose);

  const content = <>
    <header className="admin-dialog-head">
      <div><h3 id={titleId}>{title}</h3>{description && <p>{description}</p>}</div>
      <button className="admin-dialog-close" type="button" onClick={onClose} aria-label="Fechar"><X size={18} aria-hidden="true" /></button>
    </header>
    {children != null && <div className="admin-dialog-body">{children}</div>}
    {footer && <footer className="admin-dialog-foot">{footer}</footer>}
  </>;

  return <div className="admin-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} className={`admin-dialog${size === "sm" ? " is-sm" : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId}>
      {onSubmit ? <form onSubmit={onSubmit}>{content}</form> : content}
    </section>
  </div>;
}
