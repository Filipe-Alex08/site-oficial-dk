"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Backpack, BookOpen, Clapperboard, Crown, Goal, Map as MapIcon, Maximize2, ShieldAlert, Split, X, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { RefObject } from "react";
import { createPortal } from "react-dom";
import type { Game } from "@/lib/types";

const gamesPath = "/atividades/jogos";
const noopSubscribe = () => () => {};
type GameView = "details" | "map";

/**
 * O modal é controlado pela URL: /atividades/jogos/<slug> abre o jogo.
 * Clicar no cartão troca a URL sem navegar; voltar/avançar do navegador
 * abre e fecha o modal sozinho.
 */
export default function GameCard({ game, category, hidden }: { game: Game; category: string; hidden: boolean }) {
  const pathname = usePathname();
  const gamePath = `${gamesPath}/${game.slug}`;
  const open = pathname === gamePath;
  // O modal vai para o <body>, que não existe no servidor.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [closing, setClosing] = useState(false);
  const [initialView, setInitialView] = useState<GameView>("details");
  const openerRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // A URL já voltou para a lista: encerra o estado de animação.
  if (!open && closing) setClosing(false);

  const openModal = (view: GameView, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    setInitialView(view);
    setClosing(false);
    window.history.pushState({ dkGameCatalog: game.slug }, "", gamePath);
  };
  const closeModal = () => setClosing(true);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setClosing(true);
      if (event.key === "Tab") {
        const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], video[controls], [tabindex="0"]');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const trigger = openerRef.current ?? triggerRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      trigger?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!closing) return;
    const timeout = window.setTimeout(() => {
      // Se abrimos pelo clique, desfaz a entrada no histórico; se o visitante
      // chegou direto pelo link do jogo, só troca para a lista.
      if (window.history.state?.dkGameCatalog === game.slug) {
        window.history.back();
      } else {
        window.history.replaceState(null, "", gamesPath);
      }
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [closing, game.slug]);

  return (
    <article className="game-card" hidden={hidden}>
      {game.fieldMap && (
        <button
          className="game-map-preview"
          type="button"
          aria-label={`Ampliar mapa de ${game.name}`}
          aria-haspopup="dialog"
          onClick={(event) => openModal("map", event.currentTarget)}
        >
          <Image
            src={game.fieldMap.src}
            alt=""
            width={game.fieldMap.width}
            height={game.fieldMap.height}
            sizes="(max-width: 680px) 100vw, (max-width: 1020px) 50vw, 380px"
          />
          <span><Maximize2 size={15} aria-hidden="true" /> Ampliar mapa</span>
        </button>
      )}
      <div className="game-summary">
        <p className="game-category">{category}</p>
        <h3>{game.name}</h3>
        <p className="game-description">{game.summary}</p>
        <button
          ref={triggerRef}
          className="game-link"
          type="button"
          aria-label={`Ver regras de ${game.name}`}
          aria-haspopup="dialog"
          onClick={(event) => openModal("details", event.currentTarget)}
        >
          Ver regras <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </div>

      {mounted && open && (
        createPortal(<div
          className={`game-modal-backdrop${closing ? " is-closing" : ""}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <GameDialog game={game} initialView={initialView} dialogRef={dialogRef} closeModal={closeModal} />
        </div>, document.body)
      )}
    </article>
  );
}

function GameDialog({ game, initialView, dialogRef, closeModal }: {
  game: Game;
  initialView: GameView;
  dialogRef: RefObject<HTMLElement | null>;
  closeModal: () => void;
}) {
  const [view, setView] = useState(initialView);
  const [zoomed, setZoomed] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const mapViewport = useRef<HTMLDivElement>(null);
  const fieldMap = game.fieldMap;

  function switchView(nextView: GameView) {
    setZoomed(false);
    setView(nextView);
    closeRef.current?.focus({ preventScroll: true });
  }

  function toggleZoom() {
    setZoomed(!zoomed);
    mapViewport.current?.scrollTo(0, 0);
  }

  return (
    <section
      ref={dialogRef}
      className={`game-modal${view === "map" ? " game-modal-map" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={`game-title-${game.id}`}
      aria-describedby={view === "details" ? `game-summary-${game.id}` : undefined}
    >
      <header className="game-modal-header">
        <div>
          {view === "map" && <span className="eyebrow">Mapa do campo</span>}
          <h2 id={`game-title-${game.id}`}>{game.name}</h2>
          {view === "details" && <p id={`game-summary-${game.id}`}>{game.summary}</p>}
        </div>
        <button ref={closeRef} className="game-modal-close" type="button" onClick={closeModal} aria-label="Fechar" autoFocus>
          <X size={22} aria-hidden="true" />
        </button>
      </header>
      {view === "map" && fieldMap ? (
        <div className="game-modal-content" key="map">
          <div className="game-map-controls">
            <button className="button button-ghost button-small" type="button" onClick={() => switchView("details")}>
              <BookOpen size={16} aria-hidden="true" /> Ver regras
            </button>
            <button className="button button-ghost button-small" type="button" onClick={toggleZoom} aria-pressed={zoomed}>
              {zoomed ? <ZoomOut size={16} aria-hidden="true" /> : <ZoomIn size={16} aria-hidden="true" />}
              {zoomed ? "Reduzir zoom" : "Aumentar zoom"}
            </button>
          </div>
          <div
            ref={mapViewport}
            className={`game-field-map-frame game-map-viewport${zoomed ? " is-zoomed" : ""}`}
            role="region"
            aria-label="Área do mapa"
            tabIndex={zoomed ? 0 : undefined}
          >
            <Image
              src={fieldMap.src}
              alt={fieldMap.alt}
              width={fieldMap.width}
              height={fieldMap.height}
              sizes={zoomed ? `${fieldMap.width}px` : "(max-width: 1200px) 100vw, 1120px"}
            />
          </div>
        </div>
      ) : (
        <div className="game-modal-content" key="details">
          <section className="game-objective"><span className="game-section-icon"><Goal /></span><div><h3>Objetivo do jogo</h3><p>{game.objective}</p></div></section>
          {game.fieldMap && <section className="game-field-map" aria-labelledby={`game-map-title-${game.id}`}>
            <div className="game-section-heading">
              <MapIcon aria-hidden="true" />
              <h3 id={`game-map-title-${game.id}`}>Mapa do campo</h3>
              <button className="button button-ghost button-small" type="button" onClick={() => switchView("map")}>
                <Maximize2 size={15} aria-hidden="true" /> Ampliar mapa
              </button>
            </div>
            <div className="game-field-map-frame">
              <Image
                src={game.fieldMap.src}
                alt={game.fieldMap.alt}
                width={game.fieldMap.width}
                height={game.fieldMap.height}
                sizes="(max-width: 420px) calc(100vw - 52px), (max-width: 760px) calc(100vw - 72px), 956px"
              />
            </div>
          </section>}
          <div className="game-modal-columns">
            <div className="game-modal-main">
              <section className="game-rules">
                <div className="game-section-heading"><BookOpen /><h3>Como jogar</h3></div>
                <ol>{game.rules.map((rule, index) => <li key={`${index}-${rule}`}><span className="game-rule-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{rule}</p></li>)}</ol>
              </section>
              <section className="game-safety"><ShieldAlert /><div><h3>Segurança em primeiro lugar</h3><p>{game.safety}</p></div></section>
            </div>
            <aside className="game-modal-sidebar" aria-label="Informações complementares do jogo">
              <div className="game-facts">
                <section className="game-detail"><Split /><div><h3>Formação das equipes</h3><p>{game.teamFormation}</p></div></section>
                <section className="game-detail"><Crown /><div><h3>Condição de vitória</h3><p>{game.victory}</p></div></section>
                <section className="game-detail"><Backpack /><div><h3>Equipamentos permitidos</h3><p>{game.equipment}</p></div></section>
              </div>
              {game.media?.length ? <section className="game-media" aria-label="Fotos e vídeos do jogo">
                <div className="game-section-heading"><Clapperboard /><h3>Fotos e vídeos</h3></div>
                <div className="game-media-gallery">{game.media.map((media, index) => <figure key={`${media.url}-${index}`}>
                  {media.type === "image"
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={media.url} alt={media.caption || `Registro de ${game.name}`} loading="lazy" />
                    : <video src={media.url} poster={media.poster} controls playsInline preload="metadata" aria-label={media.caption || `Vídeo de ${game.name}`} />}
                  {media.caption && <figcaption>{media.caption}</figcaption>}
                </figure>)}</div>
              </section> : null}
            </aside>
          </div>
        </div>
      )}
    </section>
  );
}
