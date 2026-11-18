"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

const FOCUSABLE = 'button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), [tabindex="0"]';

/** Modal do painel. Não usa <dialog>: o menu do Select é um portal no body e ficaria atrás dele. */
export default function AdminDialog({ title, description, onClose, footer, children, onSubmit }: {
  title: string;
  description?: string;
  onClose: () => void;
  footer: ReactNode;
  children: ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  // Ref: o efeito roda só na abertura; um callback novo a cada render não pode roubar o foco.
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input:not(:disabled), button.admin-dialog-close")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        // O Select fecha o próprio menu com Esc e já marca o evento.
        if (event.defaultPrevented) return;
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
  }, []);

  const content = <>
    <header className="admin-dialog-head">
      <div><h3 id={titleId}>{title}</h3>{description && <p>{description}</p>}</div>
      <button className="admin-dialog-close" type="button" onClick={onClose} aria-label="Fechar"><X size={18} aria-hidden="true" /></button>
    </header>
    <div className="admin-dialog-body">{children}</div>
    <footer className="admin-dialog-foot">{footer}</footer>
  </>;

  return <div className="admin-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section ref={dialogRef} className="admin-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      {onSubmit ? <form onSubmit={onSubmit}>{content}</form> : content}
    </section>
  </div>;
}
