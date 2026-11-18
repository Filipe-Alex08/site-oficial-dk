"use client";

import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE = 'button:not(:disabled), a[href], input:not(:disabled):not([type="hidden"]), textarea:not(:disabled), [tabindex="0"]';

/**
 * Comportamento comum de janelas modais do painel (diálogo, gaveta, confirmação):
 * trava a rolagem do corpo, leva o foco para dentro, prende o Tab, fecha com Esc
 * (a menos que o Select aberto já tenha tratado o evento) e devolve o foco ao fechar.
 */
export function useDialogBehavior(containerRef: RefObject<HTMLElement | null>, onClose: () => void, initialFocus = "input:not(:disabled), button.admin-dialog-close") {
  // Ref: o efeito roda só na abertura; um callback novo a cada render não pode roubar o foco.
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; });

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const root = containerRef.current;
    (root?.querySelector<HTMLElement>("[data-autofocus]") ?? root?.querySelector<HTMLElement>(initialFocus))?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        if (event.defaultPrevented) return;
        event.preventDefault();
        closeRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const controls = containerRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
