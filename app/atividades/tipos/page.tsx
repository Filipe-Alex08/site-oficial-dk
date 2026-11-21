import { pageMetadata } from "@/lib/seo";
import { Dices, Flag, Footprints, Handshake, Swords, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageHero from "@/components/PageHero";
import PageTrail from "@/components/site/PageTrail";
import SubNav from "@/components/site/SubNav";

type ActivityType = { title: string; text: string; Icon: LucideIcon };

const activities: ActivityType[] = [
  {
    title: "Treinos técnicos",
    text: "Exercícios voltados ao aprendizado e aperfeiçoamento da movimentação, controle dos equipamentos, posicionamento, defesa, ataque e atuação em conjunto com outros participantes.",
    Icon: Footprints,
  },
  {
    title: "Duelos",
    text: "Combates individuais ou em pequenos grupos, como 1x1, 2x2 e 3x3, que ajudam a desenvolver percepção, tomada de decisão, tempo de resposta e adaptação ao estilo do adversário.",
    Icon: Swords,
  },
  {
    title: "Batalhas em equipe",
    text: "Atividades coletivas em que os participantes precisam trabalhar comunicação, organização, posicionamento e cooperação para alcançar os objetivos propostos.",
    Icon: Users,
  },
  {
    title: "Batalhas campais",
    text: "Confrontos com um número maior de participantes, utilizando formações, funções específicas e estratégias de campo. Podem envolver linha de frente, flancos, arquearia, lanceiros e outras funções.",
    Icon: Flag,
  },
  {
    title: "Dinâmicas recreativas",
    text: "Jogos com regras e objetivos próprios, como captura de bandeira, Trollball e outras atividades desenvolvidas para estimular raciocínio rápido, adaptação, estratégia e diversão.",
    Icon: Dices,
  },
  {
    title: "Atividades de integração",
    text: "Dinâmicas voltadas à recepção de novos participantes e à aproximação entre os integrantes do DK, permitindo conhecer o grupo, experimentar diferentes equipamentos e fortalecer a convivência dentro e fora das batalhas.",
    Icon: Handshake,
  },
];

export const metadata = pageMetadata("Atividades de Swordplay do DK", "Conheça os tipos de atividades do DK: treinos e experiências de Swordplay para desenvolver técnica, estratégia e trabalho em equipe.", "/atividades/tipos");

export default function ActivityTypesPage() {
  return (
    <>
      <PageHero
        eyebrow="Atividades"
        title="Tipos de atividades"
        description="Do treino técnico à batalha campal: formatos para todos os níveis."
        variant="training"
      />
      <SubNav kind="activities" />
      <section className="section">
        <div className="container plate-grid numbered">
          {activities.map(({ title, text, Icon }) => (
            <article className="plate reveal" key={title}>
              <span className="numeral" aria-hidden="true" />
              <span className="glyph"><Icon /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <PageTrail href="/atividades/tipos" />
    </>
  );
}
