import GameCard from "@/components/GameCard";
import { games } from "@/lib/content";
import { gameFieldMaps } from "@/lib/game-maps";

export default function GamesSection() {
  return (
    <section className="section">
      <div className="container games-list">
        {games.map((game) => (
          <GameCard key={game.id} game={{ ...game, fieldMap: gameFieldMaps[game.id] }} />
        ))}
      </div>
    </section>
  );
}
