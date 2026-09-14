import type { Metadata } from "next";
import { Map, Network, Shield } from "lucide-react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = { title: "Eventos Externos" };

export default function ExternalEventsPage() {
  return (
    <>
      <PageHero eyebrow="Eventos" title="Eventos Externos" description="O DK também participa de encontros organizados por outros grupos e comunidades." />
      <section className="section"><div className="container card-grid">
        <article className="card"><span className="card-icon"><Map /></span><h3>Eventos estaduais</h3>
        <p>Grandes encontros realizados em Minas Gerais e em outros estados, reunindo diferentes grupos de Swordplay em um mesmo field. São grandes batalhas, troca de experiências, novas amizades e muita integração. Exemplos: 
          <ul>
            <li>Encontro Mineiro de Swordplay;</li>
            <li>Encontro Carioca de Swordplay;</li>
            <li>Encontro Paulista de Swordplay;</li>
            <li>Encontro da Aliança da Estrada Real;</li>
            <li>Guerra das Facções;</li>
          </ul>
          </p></article>

        <article className="card"><span className="card-icon"><Network /></span><h3>Eventos regionais</h3>
        <p> Encontros ainda maiores, capazes de reunir grupos de várias cidades, estados e regiões. São eventos marcados por batalhas intensas, estratégias coletivas e a oportunidade de lutar ao lado — ou contra — jogadores de diferentes partes do país.
          <ul>
            <li>Apocalipse;</li>
            <li>Odisseia;</li>
          </ul>
        </p></article>
      </div></section>
    </>
  );
}
