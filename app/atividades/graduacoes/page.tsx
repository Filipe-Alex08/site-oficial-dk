import type { Metadata } from "next";
import { Award, BookOpenCheck, ShieldCheck } from "lucide-react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = { title: "Graduações" };

export default function GraduationPage() {
  return (
    <>
      <PageHero eyebrow="Atividades" title="Graduações" description="Um caminho de desenvolvimento que reconhece conhecimento, participação e responsabilidade." />
      <section className="section">
        <div className="container">
          <div className="card-grid">
            <article className="card graduation bronze"><span className="card-icon"><Award /></span><h3>Bronze</h3><p>Primeiro nível de graduação, voltado aos fundamentos e à participação regular.</p></article>
            <article className="card graduation silver"><span className="card-icon"><ShieldCheck /></span><h3>Prata</h3><p>Reconhece evolução técnica, experiência e responsabilidade nas atividades.</p></article>
            <article className="card graduation gold"><span className="card-icon"><BookOpenCheck /></span><h3>Ouro</h3><p>Representa domínio avançado, compromisso e contribuição com o desenvolvimento do grupo.</p></article>
          </div>
          <div className="info-band"><strong>Informações internas</strong><p>Critérios detalhados, exames e registros individuais ficam disponíveis somente para membros autorizados.</p></div>
        </div>
      </section>
    </>
  );
}
