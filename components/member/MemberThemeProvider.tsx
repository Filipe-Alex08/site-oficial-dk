"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { jsonApiFetch } from "@/lib/api-client";
import { effectiveMemberTheme, isMemberStyle, type MemberStyle, type MemberTheme } from "@/lib/member-style";

const CHANNEL = "dk-member-style";

/**
 * Última escolha feita (ou recebida de outra aba) neste navegador. Só existe no cliente: o
 * servidor nunca chama setStyle, então o módulo não guarda nada entre requisições lá.
 *
 * Existe porque, ao voltar à área do membro por navegação interna (Voltar, ou um link vindo
 * do site público), o Next reaproveita do cache o layout antigo, com o `initialStyle` lido no
 * primeiro carregamento. Sem isto a tela voltava no estilo velho, e escolher a opção que já
 * aparecia marcada não gravava nada: ao recarregar, o cookie antigo voltava.
 */
let chosenInBrowser: MemberStyle | null = null;

type MemberThemeContextValue = {
  style: MemberStyle;
  setStyle: (style: MemberStyle) => void;
  /** Tema da graduação do membro, mesmo quando ele escolheu o padrão. */
  graduationTheme: MemberTheme;
  /** Só há o que alternar quando o membro tem uma graduação a mostrar. */
  available: boolean;
};

const MemberThemeContext = createContext<MemberThemeContextValue | null>(null);

export function useMemberTheme() {
  const value = useContext(MemberThemeContext);
  if (!value) throw new Error("useMemberTheme precisa estar dentro de MemberThemeProvider.");
  return value;
}

/**
 * Casca da área do membro. O servidor entrega `initialStyle` (lido do cookie) e o
 * tema já sai no HTML, sem piscar. Trocar de estilo muda o estado na hora e pede ao
 * servidor para gravar o cookie; as outras abas abertas acompanham por BroadcastChannel.
 */
export default function MemberThemeProvider({ initialStyle, graduationTheme, children }: {
  initialStyle: MemberStyle;
  graduationTheme: MemberTheme;
  children: ReactNode;
}) {
  // Na hidratação de uma carga completa `chosenInBrowser` ainda é null, então o HTML do servidor bate.
  const [style, setStyleState] = useState<MemberStyle>(() => chosenInBrowser ?? initialStyle);
  const current = useRef(style);
  useEffect(() => { current.current = style; }, [style]);
  const channel = useRef<BroadcastChannel | null>(null);

  const apply = useCallback((next: MemberStyle) => {
    // Esmaecimento curto quando o navegador sabe fazer; sem ele (ou com movimento reduzido) é troca seca.
    // Dentro da transição o DOM precisa mudar na hora, por isso o flushSync.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const withTransition = (document as Document & { startViewTransition?: (callback: () => void) => unknown }).startViewTransition;
    if (withTransition && !reduced) withTransition.call(document, () => flushSync(() => setStyleState(next)));
    else setStyleState(next);
  }, []);

  const setStyle = useCallback((next: MemberStyle) => {
    chosenInBrowser = next;
    // Escolher a opção que já está ativa não muda a tela, mas ainda grava: o cookie pode estar defasado.
    if (next !== current.current) apply(next);
    channel.current?.postMessage(next);
    // Se não gravar, a escolha vale até recarregar; não vale incomodar o membro com erro.
    void jsonApiFetch("/api/member/style", { style: next }).catch(() => undefined);
  }, [apply]);

  // A escolha feita em outra aba vale aqui na hora.
  useEffect(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const bc = new BroadcastChannel(CHANNEL);
    channel.current = bc;
    bc.onmessage = (event) => {
      if (!isMemberStyle(event.data)) return;
      chosenInBrowser = event.data;
      setStyleState(event.data);
    };
    return () => { bc.close(); channel.current = null; };
  }, []);

  const value = useMemo<MemberThemeContextValue>(
    () => ({ style, setStyle, graduationTheme, available: graduationTheme !== "padrao" }),
    [style, setStyle, graduationTheme],
  );

  return (
    <MemberThemeContext.Provider value={value}>
      <div className="app-area member-shell" data-member-theme={effectiveMemberTheme(style, graduationTheme)} data-member-style={style}>
        {children}
      </div>
    </MemberThemeContext.Provider>
  );
}
