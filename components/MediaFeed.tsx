"use client";

import { Image as ImageIcon, Search } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import MediaCard from "@/components/MediaCard";
import type { MediaCardData } from "@/lib/media-posts";
import { normalizeSearch } from "@/lib/search";

const PAGE_SIZE = 12;
const ALL = "todas";

/**
 * Lista pública de publicações: destaque, filtro por categoria, busca e "carregar mais".
 * Recebe tudo pronto do servidor (a página segue estática); o filtro é só estado local.
 */
export default function MediaFeed({ posts }: { posts: MediaCardData[] }) {
  const [category, setCategory] = useState(ALL);
  const [search, setSearch] = useState("");
  const [shown, setShown] = useState(PAGE_SIZE);
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // Índice do primeiro cartão que acabou de entrar: recebe o foco para quem navega por teclado.
  const focusIndex = useRef<number | null>(null);

  const categories = useMemo(() => Array.from(new Set(posts.map((post) => post.category))), [posts]);
  const indexed = useMemo(() => posts.map((post) => ({ post, text: normalizeSearch(`${post.title} ${post.summary} ${post.category}`) })), [posts]);
  const terms = normalizeSearch(search).split(" ").filter(Boolean);
  const filtered = indexed
    .filter(({ post, text }) => (category === ALL || post.category === category) && terms.every((term) => text.includes(term)))
    .map(({ post }) => post);
  const unfiltered = category === ALL && terms.length === 0;
  // O destaque é a publicação mais recente e só aparece na lista sem filtros.
  const featured = unfiltered ? filtered[0] : undefined;
  const rest = featured ? filtered.slice(1) : filtered;
  const visible = rest.slice(0, shown);
  const remaining = rest.length - visible.length;

  useEffect(() => {
    if (focusIndex.current === null) return;
    gridRef.current?.querySelectorAll<HTMLAnchorElement>("a.media-link")[focusIndex.current]?.focus();
    focusIndex.current = null;
  }, [shown]);

  function chooseCategory(next: string) {
    setCategory(next);
    setShown(PAGE_SIZE);
  }

  function clearFilters() {
    setCategory(ALL);
    setSearch("");
    setShown(PAGE_SIZE);
    searchRef.current?.focus();
  }

  function showMore() {
    focusIndex.current = visible.length;
    setShown(shown + PAGE_SIZE);
  }

  if (!posts.length) {
    return <div className="empty-state">
      <ImageIcon />
      <h2>Nenhuma publicação disponível</h2>
    </div>;
  }

  return <div className="media-feed">
    <div className="games-catalog-heading">
      <h2 id="media-feed-title">Publicações</h2>
      <p role="status">{filtered.length} {filtered.length === 1 ? "publicação" : "publicações"}</p>
    </div>

    {posts.length > 3 && <div className="games-controls">
      {categories.length > 1 && <div className="games-filters" role="group" aria-label="Filtrar por categoria">
        {[ALL, ...categories].map((value) => <button
          key={value}
          type="button"
          className={`button button-small ${value === category ? "button-primary" : "button-ghost"}`}
          aria-pressed={value === category}
          onClick={() => chooseCategory(value)}
        >{value === ALL ? "Todas" : value}</button>)}
      </div>}
      <label className="games-search">
        <Search size={16} aria-hidden="true" />
        <input
          ref={searchRef}
          type="search"
          aria-label="Buscar publicação"
          placeholder="Buscar publicação"
          value={search}
          onChange={(event) => { setSearch(event.target.value); setShown(PAGE_SIZE); }}
        />
      </label>
    </div>}

    {featured && <MediaCard post={featured} featured />}

    {visible.length > 0 && <div className="media-grid" ref={gridRef}>
      {visible.map((post) => <MediaCard key={post.id} post={post} />)}
    </div>}

    {filtered.length === 0 && <div className="games-empty">
      <p>Nenhuma publicação encontrada.</p>
      <button className="button button-ghost button-small" type="button" onClick={clearFilters}>Limpar filtros</button>
    </div>}

    {remaining > 0 && <div className="media-more-wrap">
      <button className="button button-ghost" type="button" onClick={showMore}>Carregar mais publicações</button>
      <small>Mostrando {visible.length + (featured ? 1 : 0)} de {filtered.length}</small>
    </div>}
  </div>;
}
