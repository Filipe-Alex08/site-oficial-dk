import type { Metadata } from "next";
import GameCard from "@/components/GameCard";
import PageHero from "@/components/PageHero";
import { games } from "@/lib/content";

export const metadata: Metadata = { title: "Jogos" };

export default function GamesPage() {
  return (
    <>
      <PageHero
        eyebrow="Atividades"
        title="Jogos de Swordplay"
        description="Conheça os objetivos, as regras, as dinâmicas e os equipamentos de cada jogo."
      />
      <section className="section">
        <div className="container games-list">
          {games.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </>
  );
}
