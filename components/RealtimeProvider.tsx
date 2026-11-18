"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, type ReactNode } from "react";
import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

// Tempo real por "sinal de invalidação".
//
// Triggers do Postgres (migração 023) publicam no tópico público abaixo apenas
// { table, op }: nenhuma linha, nenhum dado pessoal. O navegador escuta com a
// chave pública e, ao receber o sinal, busca os dados de novo pelos caminhos de
// sempre (proxy /api/supabase com a sessão do cookie HttpOnly e RLS). Assim o
// token nunca chega ao JavaScript e nenhuma tabela entra na publicação
// supabase_realtime.
const TOPIC = "dk:changes";
const EVENT = "change";

type Listener = { tables: ReadonlySet<string>; notify: () => void };
type RealtimeContextValue = { subscribe: (listener: Listener) => () => void };

const RealtimeContext = createContext<RealtimeContextValue | null>(null);

export default function RealtimeProvider({ children }: { children: ReactNode }) {
  const listeners = useRef(new Set<Listener>());
  const connection = useRef<{ client: SupabaseClient; channel: RealtimeChannel } | null>(null);

  const notifyAll = useCallback(() => {
    listeners.current.forEach((listener) => listener.notify());
  }, []);

  const connect = useCallback(() => {
    if (connection.current) return;
    const client = createClient();
    if (!client) return;

    // Depois de cair e voltar, eventos podem ter sido perdidos: reconcilia tudo.
    let wasDown = false;
    const channel = client
      .channel(TOPIC)
      .on("broadcast", { event: EVENT }, ({ payload }) => {
        const table = typeof payload?.table === "string" ? payload.table : null;
        if (!table) return;
        listeners.current.forEach((listener) => {
          if (listener.tables.has(table)) listener.notify();
        });
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          if (wasDown) notifyAll();
          wasDown = false;
        } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
          wasDown = true;
        }
      });
    connection.current = { client, channel };
  }, [notifyAll]);

  const disconnect = useCallback(() => {
    const current = connection.current;
    connection.current = null;
    if (current) void current.client.removeChannel(current.channel);
  }, []);

  // O WebSocket só existe enquanto algum componente da tela precisa dele: páginas
  // que não assinam nada (a maioria das públicas) não abrem conexão.
  const subscribe = useCallback((listener: Listener) => {
    listeners.current.add(listener);
    connect();
    return () => {
      listeners.current.delete(listener);
      if (listeners.current.size === 0) disconnect();
    };
  }, [connect, disconnect]);

  // Ao voltar para a aba, atualiza o que pode ter mudado enquanto ela estava oculta
  // (navegadores suspendem WebSockets de abas em segundo plano).
  useEffect(() => {
    const onVisible = () => { if (document.visibilityState === "visible") notifyAll(); };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      disconnect();
    };
  }, [notifyAll, disconnect]);

  const value = useMemo(() => ({ subscribe }), [subscribe]);
  return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
}

/**
 * Chama `onChange` (com debounce) quando qualquer uma das tabelas muda, quando a
 * conexão volta depois de uma queda e quando a aba volta a ficar visível.
 * Sem o provider ou sem Realtime no servidor, simplesmente não faz nada.
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
