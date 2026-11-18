"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";

// Tempo real por "sinal de invalidação".
//
// Triggers do Postgres (migração 023) avisam { table, op } e o servidor do site
// repassa por Server-Sent Events (app/api/realtime). Nenhuma linha viaja no aviso:
// ao recebê-lo, o componente busca os dados de novo pelos caminhos de sempre
// (proxy /api/supabase com a sessão do cookie HttpOnly e RLS).
const ENDPOINT = "/api/realtime";
const RESYNC_TABLE = "*"; // o servidor reconectou ao banco: avisos podem ter sido perdidos
const MIN_RETRY_MS = 5_000;
const MAX_RETRY_MS = 5 * 60_000;

type Listener = { tables: ReadonlySet<string>; notify: () => void };
type RealtimeContextValue = { subscribe: (listener: Listener) => () => void };

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export default function RealtimeProvider({ children }: { children: ReactNode }) {
  const listeners = useRef(new Set<Listener>());
  const source = useRef<EventSource | null>(null);
  const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelay = useRef(MIN_RETRY_MS);
  const reconnected = useRef(false);
  const connectRef = useRef<() => void>(() => undefined);

  const notifyAll = useCallback(() => {
    listeners.current.forEach((listener) => listener.notify());
  }, []);

  const disconnect = useCallback(() => {
    if (retryTimer.current) { clearTimeout(retryTimer.current); retryTimer.current = null; }
    source.current?.close();
    source.current = null;
  }, []);

  // A conexão existe só enquanto a aba está visível e alguém precisa dela: abas em
  // segundo plano não seguram conexões no servidor.
  const connect = useCallback(() => {
    if (source.current || retryTimer.current) return;
    if (typeof EventSource === "undefined") return;
    if (document.visibilityState !== "visible" || listeners.current.size === 0) return;

    const es = new EventSource(ENDPOINT);
    source.current = es;

    es.onopen = () => {
      retryDelay.current = MIN_RETRY_MS;
      // Depois de uma queda, o que mudou nesse intervalo não chegou: reconcilia.
      if (reconnected.current) notifyAll();
      reconnected.current = false;
    };

    es.addEventListener("change", (event) => {
      let table: unknown;
      try { table = JSON.parse((event as MessageEvent<string>).data)?.table; } catch { return; }
      if (typeof table !== "string") return;
      listeners.current.forEach((listener) => {
        if (table === RESYNC_TABLE || listener.tables.has(table)) listener.notify();
      });
    });

    es.onerror = () => {
      reconnected.current = true;
      // Enquanto o navegador ainda está tentando (CONNECTING), ele mesmo reconecta.
      // CLOSED = o servidor recusou (503: tempo real indisponível): tenta de novo
      // com espera crescente para não martelar o servidor.
      if (es.readyState !== EventSource.CLOSED) return;
      source.current = null;
      es.close();
      retryTimer.current = setTimeout(() => {
        retryTimer.current = null;
        connectRef.current();
      }, retryDelay.current);
      retryDelay.current = Math.min(retryDelay.current * 2, MAX_RETRY_MS);
    };
  }, [notifyAll]);

  // A nova tentativa precisa chamar a versão atual de connect sem referenciá-la
  // dentro da própria definição.
  useEffect(() => { connectRef.current = connect; }, [connect]);

  const subscribe = useCallback((listener: Listener) => {
    listeners.current.add(listener);
    connect();
    return () => {
      listeners.current.delete(listener);
      if (listeners.current.size === 0) disconnect();
    };
  }, [connect, disconnect]);

  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        // Voltou para a aba: atualiza o que pode ter mudado e reabre a conexão.
        retryDelay.current = MIN_RETRY_MS;
        connect();
        notifyAll();
      } else {
        disconnect();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      disconnect();
    };
  }, [connect, disconnect, notifyAll]);

  const value = useMemo(() => ({ subscribe }), [subscribe]);
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

/**
 * Chama `onChange` (com debounce) quando qualquer uma das tabelas muda, quando a
 * conexão volta depois de uma queda e quando a aba volta a ficar visível.
 * Sem o provider ou sem tempo real no servidor, simplesmente não faz nada.
 */
export function useRealtimeTables(
  tables: readonly string[],
  onChange: () => void,
  { debounceMs = 800, enabled = true }: { debounceMs?: number; enabled?: boolean } = {},
) {
  const context = useContext(RealtimeContext);
  const callback = useRef(onChange);
  useEffect(() => { callback.current = onChange; });

  const tablesKey = tables.join(",");
  useEffect(() => {
    if (!context || !enabled) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const unsubscribe = context.subscribe({
      tables: new Set(tablesKey ? tablesKey.split(",") : []),
      notify: () => {
        clearTimeout(timer);
        timer = setTimeout(() => callback.current(), debounceMs);
      },
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [context, tablesKey, debounceMs, enabled]);
}
