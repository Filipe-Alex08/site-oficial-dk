"use client";

import { QueryClient, QueryClientProvider, useIsFetching, useIsMutating } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, refetchOnWindowFocus: false, retry: 1 } },
  }));
  return <QueryClientProvider client={client}><QueryActivityFeedback />{children}</QueryClientProvider>;
}

function QueryActivityFeedback() {
  const fetching = useIsFetching();
  const mutating = useIsMutating();
  if (!fetching && !mutating) return null;

  const message = mutating
    ? mutating > 1 ? "Salvando alterações…" : "Salvando alteração…"
    : fetching > 1 ? "Atualizando informações…" : "Atualizando informação…";

  return (
    <div className="query-activity-feedback" role="status" aria-live="polite">
      <span className="query-activity-spinner" aria-hidden="true" />
      <span><strong>{message}</strong><small>O site está processando sua solicitação.</small></span>
    </div>
  );
}
