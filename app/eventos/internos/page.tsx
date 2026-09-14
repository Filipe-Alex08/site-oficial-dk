import type { Metadata } from "next";
import { Award, PartyPopper, Shield, Swords, Users } from "lucide-react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = { title: "Eventos Internos" };

const items = [
  ["Treinos especiais", "Atividades temáticas ou com programação diferenciada.", Swords],
  ["Confraternizações", "Encontros para fortalecer a convivência entre os membros.", PartyPopper],
  ["Exames", "Momentos de avaliação relacionados ao desenvolvimento e às graduações.", Award],
  ["Torneios", "Disputas internas organizadas em diferentes formatos.", Shield],
  ["Atividades entre divisões", "Encontros que aproximam participantes de diferentes regiões do DK.", Users],
];

export default function InternalEventsPage() {
  return <><PageHero eyebrow="Eventos" title="Eventos Internos" description="Atividades organizadas pelo DK para integrar, desenvolver e reunir seus membros." /><section className="section"><div className="container card-grid">{items.map(([title,text,Icon]) => { const ItemIcon=Icon as typeof Swords; return <article className="card" key={title as string}><span className="card-icon"><ItemIcon /></span><h3>{title as string}</h3><p>{text as string}</p></article>; })}</div></section></>;
}
