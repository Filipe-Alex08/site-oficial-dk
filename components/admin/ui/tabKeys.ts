import type { KeyboardEvent } from "react";

/**
 * Navegação por teclado de uma lista de abas (role="tablist"):
 * setas, Home e End movem o foco e ativam a aba, como no padrão ARIA de abas
 * com ativação automática. Use junto de tabIndex={ativa ? 0 : -1} em cada aba.
 */
export function onTabListKeyDown(event: KeyboardEvent<HTMLElement>) {
  const keys = ["ArrowLeft", "ArrowRight", "Home", "End"];
  if (!keys.includes(event.key)) return;
  const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]:not(:disabled)'));
  if (!tabs.length) return;
  const current = tabs.indexOf(document.activeElement as HTMLElement);
  let next = current;
  if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
  else if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
  else if (event.key === "Home") next = 0;
  else next = tabs.length - 1;
  event.preventDefault();
  tabs[next].focus();
  tabs[next].click();
}
