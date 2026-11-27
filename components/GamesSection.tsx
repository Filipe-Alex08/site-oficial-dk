"use client";

import { Search } from "lucide-react";
import { useRef, useState } from "react";
import GameCard from "@/components/GameCard";
import { games } from "@/lib/content";
import { gameCategories, gameCategoryLabels, type GameCategory } from "@/lib/game-catalog";
import { gameFieldMaps } from "@/lib/game-maps";
import { normalizeSearch } from "@/lib/search";

const filterLabels: Record<"todos" | GameCategory, string> = { todos: "Todas", ...gameCategoryLabels };

type Filter = keyof typeof filterLabels;

const catalog = games.map((game) => {
  const categories = gameCategories[game.id];
  if (!categories) throw new Error(`Jogo sem categoria no catálogo: ${game.id}`);
  return {
    game: { ...game, fieldMap: gameFieldMaps[game.id] },
    categories,
    searchText: normalizeSearch(`${game.name} ${game.summary}`),
  };
});

export default function GamesSection() {
  const [category, setCategory] = useState<Filter>("todos");
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const terms = normalizeSearch(search).split(" ").filter(Boolean);
  const visibility = catalog.map(({ categories, searchText }) =>
    (category === "todos" || categories.includes(category))
    && terms.every((term) => searchText.includes(term))
  );
  const count = visibility.filter(Boolean).length;

  function clearFilters() {
    setCategory("todos");
    setSearch("");
    searchRef.current?.focus();
  }

  return (
    <section className="section" aria-labelledby="games-catalog-title">
      <div className="container">
        <div className="catalog-head">
          <div>
            <h2 id="games-catalog-title">Modalidades</h2>
            <span className="rule rule--start" aria-hidden="true" />
          </div>
          <p className="catalog-count" role="status">{count} {count === 1 ? "modalidade" : "modalidades"}</p>
        </div>
        <div className="catalog-controls">
          <div className="chip-group" role="group" aria-label="Filtrar modalidades">
            {(Object.keys(filterLabels) as Filter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                className="chip"
                aria-pressed={filter === category}
                onClick={() => setCategory(filter)}
              >
                {filterLabels[filter]}
              </button>
            ))}
          </div>
          <label className="catalog-search">
            <Search size={16} aria-hidden="true" />
            <input
              ref={searchRef}
              type="search"
              aria-label="Buscar modalidade"
              placeholder="Buscar modalidade"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>
        </div>
        <div className="games-list">
          {catalog.map(({ game, categories }, index) => (
            <GameCard
              key={game.id}
              game={game}
              category={filterLabels[categories[0]]}
              hidden={!visibility[index]}
            />
          ))}
        </div>
        {count === 0 && (
          <div className="catalog-empty">
            <p>Nenhuma modalidade encontrada.</p>
            <button className="button button-ghost button-small" type="button" onClick={clearFilters}>
              Limpar filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
