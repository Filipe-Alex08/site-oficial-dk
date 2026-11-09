import { pageMetadata } from "@/lib/seo";
import GameCard from "@/components/GameCard";
import PageHero from "@/components/PageHero";
import { games } from "@/lib/content";
import { gameFieldMaps } from "@/lib/game-maps";


export const metadata = pageMetadata("Jogos de Swordplay: regras e objetivos", "Veja como jogar Trollball, Captura da Bandeira, Archery Tag e outros jogos de Swordplay do DK. Consulte regras, equipes, equipamentos e segurança.", "/atividades/jogos");

export default function GamesPage() {
  return (
    <>
      <PageHero
        title="Jogos de Swordplay"
        description="Objetivos, regras e equipamentos de cada jogo."
        variant="training"
      />
      <section className="section">
        <div className="container games-list">
          {games.map((game) => (
            <GameCard key={game.id} game={{ ...game, fieldMap: gameFieldMaps[game.id] }} />
          ))}
        </div>
      </section>
    </>
  );
}
