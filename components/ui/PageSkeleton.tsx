// Esqueleto genérico de página: aparece na hora da navegação, enquanto o servidor
// ainda está montando a página de verdade.
export default function PageSkeleton({ cards = 6 }: { cards?: number }) {
  return (
    <section className="section" aria-busy="true" aria-live="polite">
      <div className="container">
        <span className="sr-only">Carregando…</span>
        <span className="skeleton skeleton-title" />
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line short" />
        <div className="skeleton-grid">
          {Array.from({ length: cards }, (_, index) => <span className="skeleton skeleton-card" key={index} />)}
        </div>
      </div>
    </section>
  );
}
