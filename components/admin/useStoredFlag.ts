"use client";

import { useCallback, useSyncExternalStore } from "react";

const listeners = new Set<() => void>();

/** Preferência booleana guardada no navegador (sem divergir do HTML do servidor na hidratação). */
export function useStoredFlag(key: string): [boolean, (value: boolean) => void] {
  const subscribe = useCallback((notify: () => void) => {
    listeners.add(notify);
    window.addEventListener("storage", notify);
    return () => { listeners.delete(notify); window.removeEventListener("storage", notify); };
  }, []);
  const value = useSyncExternalStore(
    subscribe,
    () => { try { return window.localStorage.getItem(key) === "1"; } catch { return false; } },
    () => false,
  );
  const set = useCallback((next: boolean) => {
    try { window.localStorage.setItem(key, next ? "1" : "0"); } catch { /* armazenamento bloqueado: a preferência só dura até recarregar */ }
    listeners.forEach((notify) => notify());
  }, [key]);
  return [value, set];
}
