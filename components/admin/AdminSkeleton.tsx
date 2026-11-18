/** Esqueleto com a mesma grade do painel (barra lateral + conteúdo): evita o salto de layout ao carregar. */
export default function AdminSkeleton() {
  return <section className="admin-shell" aria-busy="true" aria-live="polite">
    <aside className="admin-sidebar" aria-hidden="true">
      <span className="skeleton skeleton-title" />
      {Array.from({ length: 6 }, (_, index) => <span className="skeleton skeleton-line" key={index} />)}
    </aside>
    <div className="admin-content">
      <span className="sr-only">Carregando…</span>
      <span className="skeleton skeleton-title" />
      <span className="skeleton skeleton-line" />
      <span className="skeleton skeleton-line short" />
      <div className="skeleton-grid">
        {Array.from({ length: 4 }, (_, index) => <span className="skeleton skeleton-card" key={index} />)}
      </div>
    </div>
  </section>;
}
