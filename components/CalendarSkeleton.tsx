import SectionHeading from "@/components/site/SectionHeading";

export default function CalendarSkeleton() {
  return (
    <section className="section calendar-section" id="calendario" aria-busy="true">
      <div className="container">
        <SectionHeading title="Calendário do DK" />
        <span className="sr-only">Carregando calendário…</span>
        <div className="skeleton-grid">
          {Array.from({ length: 4 }, (_, index) => <span className="skeleton skeleton-card" key={index} />)}
        </div>
      </div>
    </section>
  );
}
