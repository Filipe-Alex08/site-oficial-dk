"use client";

import { useRouter } from "next/navigation";
import { useRealtimeTables } from "@/components/RealtimeProvider";

// Coloque dentro de uma página renderizada no servidor: quando uma das tabelas
// muda, a página é renderizada de novo e os dados novos substituem os antigos
// sem perder o estado do navegador (rolagem, campos digitados).
export default function LiveRefresh({ tables, debounceMs = 800 }: { tables: readonly string[]; debounceMs?: number }) {
  const router = useRouter();
  useRealtimeTables(tables, () => router.refresh(), { debounceMs });
  return null;
}
