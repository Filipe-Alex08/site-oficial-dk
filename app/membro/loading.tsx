// Esqueleto da área do membro: título e duas colunas de painéis, o formato da maioria das telas.
export default function Loading() {
  return (
    <section className="section" aria-busy="true" aria-live="polite">
      <div className="container">
        <span className="sr-only">Carregando…</span>
        <span className="skeleton m-skel-title" />
        <div className="m-home-grid" style={{ marginTop: 28 }}>
          <div className="m-home-main">
            <span className="skeleton m-skel-block" />
            <span className="skeleton m-skel-block" />
          </div>
          <div className="m-home-side">
            <span className="skeleton m-skel-block is-tall" />
          </div>
        </div>
      </div>
    </section>
  );
}
