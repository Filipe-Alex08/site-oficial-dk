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
        variant="training"
      />
      <section className="section">
        <div className="container prose">
          <h2>O que é Swordplay?</h2>
          <p>
            O Swordplay é uma atividade esportiva e recreativa inspirada em
            combates históricos e fantásticos. Os participantes utilizam
            réplicas acolchoadas de equipamentos medievais desenvolvidas para a
            prática.
          </p>
          <h2>O que é Boffering?</h2>
          <p>
            Boffering é o uso de equipamentos macios e acolchoados em atividades
            simuladas. A proposta permite treinar movimentos, posicionamento e
            estratégia de maneira controlada.
          </p>
          <h2>Equipamentos utilizados</h2>
          <div className="card-grid">
            <article className="card">
              <span className="card-icon">
                <Swords />
              </span>
              <h3>Equipamentos de mão</h3>
              <p>
                Equipamentos curtos, equipamentos longos e combinações de duas
                armas.
              </p>
            </article>
            <article className="card">
              <span className="card-icon">
                <Shield />
              </span>
              <h3>Defesa</h3>
              <p>Escudos nórdicos, escudos torre, escudos broquel.</p>
            </article>
            <article className="card">
              <span className="card-icon">
                <Target />
              </span>
              <h3>Longo alcance</h3>
              <p>Lanças e arquearia adaptadas ao padrão da atividade.</p>
            </article>
          </div>
          <h2>Regras básicas</h2>
          <div className="detail-list">
            <div className="detail-item">
              <strong>Equipamento</strong>
              <span>
                Somente poderão ser utilizados equipamentos que estejam de
                acordo com os padrões de construção e segurança estabelecidos.
                Consulte a equipe de segurança para informações sobre
                equipamentos.
              </span>
            </div>
            <div className="detail-item">
              <strong>Conduta</strong>
              <span>
                Todos os participantes devem seguir as orientações dos
                responsáveis e as regras apresentadas antes e durante cada
                atividade.
              </span>
            </div>
            <div className="detail-item">
              <strong>Respeito</strong>
              <span>
                Todos devem ser tratados com respeito e igualdade, preservando
                sempre a segurança, o bem-estar e os limites de cada
                participante.
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
