"use client";

import { Search } from "lucide-react";
import { useRef, useState } from "react";
import GameCard from "@/components/GameCard";
import { games } from "@/lib/content";
import { gameCatalogMetadata } from "@/lib/game-catalog";
import { gameFieldMaps } from "@/lib/game-maps";
import type { GameCategory } from "@/lib/types";

const categories = {
  todos: "Todas",
  objetivos: "Objetivos",
  batalhas: "Batalhas",
  arquearia: "Arquearia",
  duelos: "Duelos",
} satisfies Record<"todos" | GameCategory, string>;

type Filter = keyof typeof categories;

function normalizeSearch(text: string) {
  return text.toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const catalog = games.map((game) => {
  const metadata = gameCatalogMetadata[game.id];
  if (!metadata) throw new Error(`Jogo sem metadados de catálogo: ${game.id}`);
  const catalogGame = { ...game, ...metadata.overrides, fieldMap: gameFieldMaps[game.id] };
  return {
    game: catalogGame,
    gameCategories: metadata.categories,
    searchText: normalizeSearch(`${catalogGame.name} ${catalogGame.summary}`),
  };
});

export default function GamesSection() {
  const [category, setCategory] = useState<Filter>("todos");
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const terms = normalizeSearch(search).split(" ").filter(Boolean);
  const visibility = catalog.map(({ gameCategories, searchText }) =>
    (category === "todos" || gameCategories.includes(category))
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
        <div className="games-catalog-heading">
          <h2 id="games-catalog-title">Modalidades</h2>
          <p role="status">{count} {count === 1 ? "modalidade" : "modalidades"}</p>
        </div>
        <div className="games-controls">
          <div className="games-filters" role="group" aria-label="Filtrar modalidades">
            {(Object.keys(categories) as Filter[]).map((filter) => (
              <button
                key={filter}
                type="button"
                className={`button button-small ${filter === category ? "button-primary" : "button-ghost"}`}
                aria-pressed={filter === category}
                onClick={() => setCategory(filter)}
              >
                {categories[filter]}
              </button>
            ))}
          </div>
          <label className="games-search">
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
          {catalog.map(({ game, gameCategories }, index) => (
            <GameCard
              key={game.id}
              game={game}
              category={categories[gameCategories[0]]}
              hidden={!visibility[index]}
            />
          ))}
        </div>
        {count === 0 && (
          <div className="games-empty">
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
