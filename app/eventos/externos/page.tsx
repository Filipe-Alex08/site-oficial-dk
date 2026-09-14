import type { Metadata } from "next";
import { Map, Network, Shield } from "lucide-react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = { title: "Eventos Externos" };

export default function ExternalEventsPage() {
  return (
    <>
      <PageHero eyebrow="Eventos" title="Eventos Externos" description="O DK também participa de encontros organizados por outros grupos e comunidades." />
      <section className="section"><div className="container card-grid">
        <article className="card"><span className="card-icon"><Map /></span><h3>Eventos estaduais</h3><p>Encontros realizados em Minas Gerais e em outros estados.</p></article>
        <article className="card"><span className="card-icon"><Network /></span><h3>Eventos regionais</h3><p>Atividades que aproximam grupos de diferentes cidades e regiões.</p></article>
        <article className="card"><span className="card-icon"><Shield /></span><h3>Encontros entre clãs</h3><p>Momentos de convivência e troca de experiência com outras comunidades.</p></article>
      </div></section>
    </>
  );
}
