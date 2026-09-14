import type { Metadata } from "next";
import { Flag, Handshake, Medal, Route, Swords, Users } from "lucide-react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = { title: "Tipos de Atividades" };

const activities = [
  [
    "Treinos técnicos",
    "Exercícios voltados ao aprendizado e aperfeiçoamento da movimentação, controle dos equipamentos, posicionamento, defesa, ataque e atuação em conjunto com outros participantes.",
    Medal,
  ],
  [
    "Duelos",
    "Combates individuais ou em pequenos grupos, como 1x1, 2x2 e 3x3, que ajudam a desenvolver percepção, tomada de decisão, tempo de resposta e adaptação ao estilo do adversário.",
    Swords,
  ],
  [
    "Batalhas em equipe",
    "Atividades coletivas em que os participantes precisam trabalhar comunicação, organização, posicionamento e cooperação para alcançar os objetivos propostos.",
    Users,
  ],
  [
    "Batalhas campais",
    "Confrontos com um número maior de participantes, utilizando formações, funções específicas e estratégias de campo. Podem envolver linha de frente, flancos, arquearia, lanceiros e outras funções.",
    Flag,
  ],
  [
    "Dinâmicas recreativas",
    "Jogos com regras e objetivos próprios, como captura de bandeira, Trollball e outras atividades desenvolvidas para estimular raciocínio rápido, adaptação, estratégia e diversão.",
    Route,
  ],
  [
    "Atividades de integração",
    "Dinâmicas voltadas à recepção de novos participantes e à aproximação entre os integrantes do DK, permitindo conhecer o grupo, experimentar diferentes equipamentos e fortalecer a convivência dentro e fora das batalhas.",
    Handshake,
  ],
];

export default function ActivityTypesPage() {
  return (
    <>
      <PageHero
        eyebrow="Atividades"
        title="Tipos de Atividades"
        description="No DK, as atividades são organizadas em diferentes formatos para desenvolver técnica, estratégia, comunicação, adaptação e trabalho em equipe, sempre respeitando as regras e os critérios de segurança do grupo."
        variant="training"
      />
      <section className="section">
        <div className="container card-grid">
          {activities.map(([title, text, Icon]) => {
            const ActivityIcon = Icon as typeof Medal;
            return (
              <article className="card" key={title as string}>
                <span className="card-icon">
                  <ActivityIcon />
                </span>
                <h3>{title as string}</h3>
                <p>{text as string}</p>
              </article>
            );
          })}
        </div>
      </section>
    </>
  );
}
