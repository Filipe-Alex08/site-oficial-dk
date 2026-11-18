import { apiFetch } from "@/lib/api-client";

// Avisa o servidor que publicações ou mídias mudaram, para as páginas públicas
// /midias (que ficam em cache) serem regeneradas na próxima visita.
// Falhar aqui nunca deve atrapalhar a gravação: o cache expira sozinho em minutos.
export function revalidatePublicMedia() {
  void apiFetch("/api/admin/revalidate", { method: "POST" }).catch(() => undefined);
}
