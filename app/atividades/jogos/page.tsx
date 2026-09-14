import type { Metadata } from "next";
import GameCard from "@/components/GameCard";
import PageHero from "@/components/PageHero";
import { games } from "@/lib/content";

export const metadata: Metadata = { title: "Jogos" };

export default function GamesPage() {
  return (
    <>
      <PageHero eyebrow="Atividades" title="Jogos do DK" description="Conheça os objetivos, regras e equipamentos de cada jogo em uma única página." />
      <section className="section">
        <div className="container games-list">
          {games.map((game) => <GameCard key={game.id} game={game} />)}
        </div>
      </section>
    </>
  );
}
