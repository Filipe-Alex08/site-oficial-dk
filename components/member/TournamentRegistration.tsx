"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/admin/ToastProvider";
import { jsonApiFetch } from "@/lib/api-client";

export default function TournamentRegistration({ id, registered }: { id: string; registered: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, startTransition] = useTransition();

  async function update() {
    setSubmitting(true);
    try {
      const response = await jsonApiFetch("/api/member/tournaments", { id, registered: !registered }, { method: "PATCH" });
      const body = await response.json() as { error?: string };
      if (!response.ok) throw new Error(body.error || "Não foi possível atualizar a inscrição.");
      toast.success(registered ? "Inscrição cancelada." : "Inscrição confirmada.");
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a inscrição.");
      startTransition(() => router.refresh());
    } finally {
      setSubmitting(false);
    }
  }

  return <button className={registered ? "button button-ghost" : "button button-primary"} type="button" disabled={submitting || refreshing} onClick={() => void update()}>
    {submitting || refreshing ? "Salvando…" : registered ? "Cancelar inscrição" : "Confirmar inscrição"}
  </button>;
}
