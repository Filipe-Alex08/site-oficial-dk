"use client";

import { Check, Share2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type State = "idle" | "copied" | "failed";

/** Compartilha o link da página: menu nativo quando o aparelho tem, senão copia o endereço. */
export default function ShareButton({ title }: { title: string }) {
  const [state, setState] = useState<State>("idle");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  function flash(next: State) {
    setState(next);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setState("idle"), 2500);
  }

  async function share() {
    // Sem parâmetros de busca nem âncora: o link limpo da publicação.
    const url = `${window.location.origin}${window.location.pathname}`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url });
      } catch (error) {
        // Fechar o menu nativo conta como cancelamento, não como falha.
        if ((error as DOMException).name !== "AbortError") flash("failed");
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      flash("copied");
    } catch {
      flash("failed");
    }
  }

  return <>
    <button className="button button-ghost button-small" type="button" onClick={() => void share()}>
      {state === "copied" ? <Check size={16} aria-hidden="true" /> : <Share2 size={16} aria-hidden="true" />}
      {state === "copied" ? "Link copiado" : "Compartilhar"}
    </button>
    <span className="sr-only" role="status">{state === "copied" ? "Link copiado." : state === "failed" ? "Não foi possível compartilhar o link." : ""}</span>
    {state === "failed" && <small className="share-error" aria-hidden="true">Não foi possível copiar o link.</small>}
  </>;
}
