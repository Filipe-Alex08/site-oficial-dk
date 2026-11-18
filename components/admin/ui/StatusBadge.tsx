/** Rótulos de situação de cadastros e atividades, num só lugar (antes duplicados em mais de um arquivo). */
export const statusLabels: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  suspenso: "Suspenso",
  recusado: "Recusado",
  confirmado: "Confirmado",
  a_definir: "A definir",
  adiado: "Adiado",
  cancelado: "Cancelado",
  finalizado: "Finalizado",
  ativo: "Ativo",
  inativo: "Inativo",
};

export const statusLabel = (status: string) => statusLabels[status] ?? status;

/** Selo de situação; a cor vem das classes `.badge.<situação>` de globals.css. */
export default function StatusBadge({ status, label, className = "" }: { status: string; label?: string; className?: string }) {
  return <span className={`badge ${status} ${className}`.trim()}>{label ?? statusLabel(status)}</span>;
}
