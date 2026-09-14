import type { Metadata } from "next";
import { Award, PartyPopper, Shield, Swords, Users } from "lucide-react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = { title: "Eventos Internos" };

const items = [
  ["Treinos especiais", "Atividades com propostas diferentes dos treinos regulares, podendo incluir desafios específicos, novas dinâmicas, convidados ou programações temáticas.", Swords],
  ["Confraternizações", "Momentos para reunir os membros fora do ritmo das batalhas, fortalecer amizades, integrar novos participantes e aproximar ainda mais a comunidade do DK.", PartyPopper],
  ["Exames", "Avaliações voltadas ao desenvolvimento dos integrantes, considerando conhecimentos, habilidades e evolução dentro do sistema de graduações do DK.", Award],
  ["Torneios", "Disputas internas organizadas em diferentes formatos, criadas para testar habilidades, estratégias e proporcionar novos desafios entre os participantes.", Shield],
  ["Atividades entre divisões", "Encontros que reúnem integrantes de diferentes regiões do DK, promovendo integração, troca de experiências e atividades em conjunto entre as divisões.", Users],
];

export default function InternalEventsPage() {
  return <><PageHero eyebrow="Eventos" title="Eventos Internos" description="Atividades organizadas pelo DK para integrar, desenvolver e reunir seus membros." /><section className="section"><div className="container card-grid">{items.map(([title,text,Icon]) => { const ItemIcon=Icon as typeof Swords; return <article className="card" key={title as string}><span className="card-icon"><ItemIcon /></span><h3>{title as string}</h3><p>{text as string}</p></article>; })}</div></section></>;
}
