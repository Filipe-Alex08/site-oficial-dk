"use client";

import { AlertCircle, CheckCircle2, Info } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type ToastKind = "success" | "error" | "info";
type ToastAction = { label: string; onClick: () => void };
type ToastItem = { id: number; text: string; kind: ToastKind; action?: ToastAction };
type ToastApi = {
  success: (text: string) => void;
  error: (text: string, action?: ToastAction) => void;
  info: (text: string) => void;
  dismiss: (id: number) => void;
};

const ToastContext = createContext<ToastApi | null>(null);

const icons = { success: CheckCircle2, error: AlertCircle, info: Info } as const;
const lifetime: Record<ToastKind, number> = { success: 4000, info: 4000, error: 7000 };

/** Pilha única de avisos do painel. O tipo (sucesso, erro, info) é dito por quem avisa, nunca adivinhado pelo texto. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const nextId = useRef(1);
  const timers = useRef(new Map<number, number>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) window.clearTimeout(timer);
    timers.current.delete(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback((kind: ToastKind, text: string, action?: ToastAction) => {
    const id = nextId.current++;
    setItems((current) => [...current.filter((item) => item.text !== text).slice(-3), { id, text, kind, action }]);
    timers.current.set(id, window.setTimeout(() => dismiss(id), lifetime[kind]));
  }, [dismiss]);

  useEffect(() => {
    const active = timers.current;
    return () => { active.forEach((timer) => window.clearTimeout(timer)); active.clear(); };
  }, []);

  const api = useMemo<ToastApi>(() => ({
    success: (text) => push("success", text),
    error: (text, action) => push("error", text, action),
    info: (text) => push("info", text),
    dismiss,
  }), [push, dismiss]);

  return <ToastContext.Provider value={api}>
    {children}
    <div className="toast-stack" aria-live="polite">
      {items.map((item) => {
        const Icon = icons[item.kind];
        return <div key={item.id} className={`toast is-${item.kind}`} role={item.kind === "error" ? "alert" : "status"}>
          <Icon className="toast-icon" size={18} aria-hidden="true" />
          <span>{item.text}</span>
          {item.action && <button className="text-button" type="button" onClick={() => { item.action?.onClick(); dismiss(item.id); }}>{item.action.label}</button>}
        </div>;
      })}
    </div>
  </ToastContext.Provider>;
}

export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (!api) throw new Error("useToast precisa estar dentro de <ToastProvider>.");
  return api;
}
