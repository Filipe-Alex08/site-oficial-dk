export default function Loading() {
  return (
    <article aria-busy="true" aria-live="polite">
      <span className="sr-only">Carregando publicação…</span>
      <section className="post-hero"><div className="container post-hero-content">
        <span className="skeleton skeleton-line short" />
        <span className="skeleton skeleton-title" style={{ height: 52, width: "min(640px, 90%)", margin: "24px 0" }} />
        <span className="skeleton skeleton-line short" />
      </div></section>
      <section className="section"><div className="container post-layout">
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line short" />
        <div className="media-gallery has-lead" style={{ marginTop: 32 }}>
          {Array.from({ length: 5 }, (_, index) => <span className="skeleton gallery-item" key={index} />)}
        </div>
      </div></section>
    </article>
  );
}
