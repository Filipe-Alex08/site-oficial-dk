export default function CalendarSkeleton() {
  return (
    <section className="section calendar-section" id="calendario" aria-busy="true">
      <div className="container">
        <div className="section-heading">
          <h2>Calendário do DK</h2>
        </div>
        <span className="sr-only">Carregando calendário…</span>
        <div className="skeleton-grid">
          {Array.from({ length: 4 }, (_, index) => <span className="skeleton skeleton-card" key={index} />)}
        </div>
      </div>
    </section>
  );
}
