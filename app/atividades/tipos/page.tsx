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
    text: "É onde a base se constrói: movimentação, controle da arma, posicionamento, ataque, defesa e como lutar junto com os outros.",
    Icon: Footprints,
  },
  {
    title: "Duelos",
    text: "1x1, 2x2, 3x3. Ótimos para afiar reflexo, tomada de decisão e a leitura do estilo de cada adversário.",
    Icon: Swords,
  },
  {
    title: "Batalhas em equipe",
    text: "Aqui ninguém vence sozinho. Para cumprir o objetivo, o time precisa conversar, se organizar, se posicionar bem e cooperar.",
    Icon: Users,
  },
  {
    title: "Batalhas campais",
    text: "As grandes. Muita gente em campo, formações e estratégia, com linha de frente, flancos, lanceiros e arqueiros, cada um na sua função.",
    Icon: Flag,
  },
  {
    title: "Dinâmicas recreativas",
    text: "Captura da Bandeira, Trollball e outros jogos com regras próprias, que pedem raciocínio rápido, adaptação e estratégia. E divertem muito.",
    Icon: Dices,
  },
  {
    title: "Atividades de integração",
    text: "Pensadas para quem está chegando: conhecer a turma, experimentar equipamentos diferentes e se sentir parte do grupo dentro e fora do campo.",
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
        description="Do treino de base à batalha campal, tem espaço para todo nível."
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
