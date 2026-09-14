import type { Metadata } from "next";
import { CircleDot, Shield, Swords, Target } from "lucide-react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = { title: "Swordplay e Boffering" };

export default function SwordplayPage() {
  return (
    <>
      <PageHero
        eyebrow="Atividades"
        title="Swordplay e Boffering"
        description="Uma prática com equipamentos acolchoados que combina técnica, estratégia e movimento."
      />
      <section className="section">
        <div className="container prose">
          <h2>O que é Swordplay?</h2>
          <p>O Swordplay é uma atividade esportiva e recreativa inspirada em combates históricos e fantásticos. Os participantes utilizam réplicas acolchoadas desenvolvidas para a prática.</p>
          <h2>O que é Boffering?</h2>
          <p>Boffering é o uso de equipamentos macios e acolchoados em atividades simuladas. A proposta permite treinar movimentos, posicionamento e estratégia de maneira controlada.</p>
          <h2>Equipamentos utilizados</h2>
          <div className="card-grid">
            <article className="card"><span className="card-icon"><Swords /></span><h3>Armas de mão</h3><p>Espadas curtas, longas e combinações de duas armas.</p></article>
            <article className="card"><span className="card-icon"><Shield /></span><h3>Defesa</h3><p>Escudos nórdicos, escudos torre e equipamentos complementares.</p></article>
            <article className="card"><span className="card-icon"><Target /></span><h3>Longo alcance</h3><p>Lanças e arquearia adaptadas ao padrão da atividade.</p></article>
          </div>
          <h2>Regras básicas</h2>
          <div className="detail-list">
            <div className="detail-item"><strong>Equipamento aprovado</strong><span>Somente equipamentos dentro do padrão do DK podem ser utilizados.</span></div>
            <div className="detail-item"><strong>Controle</strong><span>Os movimentos devem respeitar as orientações apresentadas antes de cada atividade.</span></div>
            <div className="detail-item"><strong>Respeito</strong><span>As decisões dos organizadores e o bem-estar de todos devem ser respeitados.</span></div>
          </div>
        </div>
      </section>
    </>
  );
}
