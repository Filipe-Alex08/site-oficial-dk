import type { Metadata } from "next";
import { Flag, Handshake, Medal, Route, Swords, Users } from "lucide-react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = { title: "Tipos de Atividades" };

const activities = [
  ["Treinos técnicos", "Exercícios voltados para movimentação, domínio de equipamento e atuação em equipe.", Medal],
  ["Duelos", "Enfrentamentos individuais ou em pequenos grupos para praticar leitura e resposta.", Swords],
  ["Batalhas em equipe", "Atividades coletivas que trabalham comunicação, posicionamento e estratégia.", Users],
  ["Batalhas campais", "Grandes confrontos com formações, funções e objetivos definidos.", Flag],
  ["Dinâmicas recreativas", "Jogos com regras especiais para estimular adaptação e diversão.", Route],
  ["Integração", "Momentos para receber participantes e fortalecer a convivência no grupo.", Handshake],
];

export default function ActivityTypesPage() {
  return (
    <>
      <PageHero eyebrow="Atividades" title="Tipos de Atividades" description="Diferentes formatos para desenvolver habilidade, estratégia e integração." />
      <section className="section"><div className="container card-grid">{activities.map(([title, text, Icon]) => {
        const ActivityIcon = Icon as typeof Medal;
        return <article className="card" key={title as string}><span className="card-icon"><ActivityIcon /></span><h3>{title as string}</h3><p>{text as string}</p></article>;
      })}</div></section>
    </>
  );
}
