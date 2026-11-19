import PageHero from "@/components/PageHero";

// Mesmo hero e mesma grade da página: nada salta quando o conteúdo chega.
export default function Loading() {
  return (
    <>
      <PageHero title="Mídias" description="Treinos, eventos e encontros da comunidade." variant="events" />
      <section className="section" aria-busy="true" aria-live="polite">
        <div className="container media-feed">
          <span className="sr-only">Carregando publicações…</span>
          <span className="skeleton skeleton-title" />
          <span className="skeleton media-skeleton-featured" />
          <div className="media-grid">
            {Array.from({ length: 6 }, (_, index) => <span className="skeleton media-skeleton-card" key={index} />)}
          </div>
        </div>
      </section>
    </>
  );
}
