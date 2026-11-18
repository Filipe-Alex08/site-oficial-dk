"use client";

import type { ReactNode } from "react";
import { ConfirmProvider } from "@/components/admin/ConfirmProvider";
import { ToastProvider } from "@/components/admin/ToastProvider";

/** Avisos e confirmações compartilhados por todo o painel administrativo. */
export default function AdminProviders({ children }: { children: ReactNode }) {
  return <ToastProvider><ConfirmProvider>{children}</ConfirmProvider></ToastProvider>;
}
