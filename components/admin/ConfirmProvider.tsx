"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import AdminDialog from "@/components/admin/AdminDialog";

type ConfirmOptions = {
  title: string;
  message?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Ação destrutiva: o botão de confirmar fica vermelho e o foco começa em "Cancelar". */
  danger?: boolean;
};
type Pending = ConfirmOptions & { resolve: (value: boolean) => void };

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

/** Substitui window.confirm: `if (!(await confirm({ title, danger: true }))) return;` */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<Pending | null>(null);
  const pendingRef = useRef<Pending | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => {
    // Um pedido novo cancela o anterior em vez de deixá-lo pendurado.
    pendingRef.current?.resolve(false);
    const next = { ...options, resolve };
    pendingRef.current = next;
    setPending(next);
  }), []);

  function settle(value: boolean) {
    pendingRef.current?.resolve(value);
    pendingRef.current = null;
    setPending(null);
  }

  return <ConfirmContext.Provider value={confirm}>
    {children}
    {pending && <AdminDialog
      size="sm"
      title={pending.title}
      onClose={() => settle(false)}
      footer={<>
        <button className="button button-ghost" type="button" data-autofocus={pending.danger ? "" : undefined} onClick={() => settle(false)}>{pending.cancelLabel ?? "Cancelar"}</button>
        <button className={`button ${pending.danger ? "button-danger" : "button-primary"}`} type="button" data-autofocus={pending.danger ? undefined : ""} onClick={() => settle(true)}>{pending.confirmLabel ?? "Confirmar"}</button>
      </>}
    >{pending.message && <p className="confirm-message">{pending.message}</p>}</AdminDialog>}
  </ConfirmContext.Provider>;
}

export function useConfirm() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm precisa estar dentro de <ConfirmProvider>.");
  return confirm;
}
