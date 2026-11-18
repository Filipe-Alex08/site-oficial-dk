/** Bolinha com a quantidade de pendências; some quando não há nenhuma. */
export default function CountBadge({ count, label }: { count: number; label: string }) {
  if (!count || count < 0) return null;
  return <span className="count-badge" role="status" aria-label={`${count} ${label}`} title={`${count} ${label}`}>{count > 99 ? "99+" : count}</span>;
}
