"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Camera, Map as MapIcon, ShieldCheck, Swords, Target, Trophy, Users, X } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import type { Game } from "@/lib/types";

const gamesPath = "/atividades/jogos";
const noopSubscribe = () => () => {};

/**
 * O modal é controlado pela URL: /atividades/jogos/<slug> abre o jogo.
 * Clicar no cartão troca a URL sem navegar; voltar/avançar do navegador
 * abre e fecha o modal sozinho.
 */
export default function GameCard({ game }: { game: Game }) {
  const pathname = usePathname();
  const gamePath = `${gamesPath}/${game.slug}`;
  const open = pathname === gamePath;
  // O modal vai para o <body>, que não existe no servidor.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const [closing, setClosing] = useState(false);
  const pushedRef = useRef(false);
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // A URL já voltou para a lista: encerra o estado de animação.
  if (!open && closing) setClosing(false);

  const openModal = () => {
    setClosing(false);
    window.history.pushState(null, "", gamePath);
    pushedRef.current = true;
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
    const trigger = triggerRef.current;
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
      if (pushedRef.current) {
        pushedRef.current = false;
        window.history.back();
      } else {
        window.history.replaceState(null, "", gamesPath);
      }
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [closing]);

  return (
    <article className="game-card">
      <button ref={triggerRef} className="game-summary" type="button" onClick={openModal} aria-haspopup="dialog">
        <span className="game-number">{game.name.slice(0, 2).toUpperCase()}</span>
        <span className="game-title">
          <strong>{game.name}</strong>
          <small>{game.summary}</small>
        </span>
        <span className="game-link">Ver detalhes <ArrowUpRight size={16} /></span>
      </button>

      {mounted && open && (
        createPortal(<div
          className={`game-modal-backdrop${closing ? " is-closing" : ""}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section ref={dialogRef} className="game-modal" role="dialog" aria-modal="true" aria-labelledby={`game-title-${game.id}`} aria-describedby={`game-summary-${game.id}`}>
            <header className="game-modal-header">
              <div>
                <h2 id={`game-title-${game.id}`}>{game.name}</h2>
                <p id={`game-summary-${game.id}`}>{game.summary}</p>
              </div>
              <button className="game-modal-close" type="button" onClick={closeModal} aria-label="Fechar detalhes" autoFocus>
                <X size={22} />
              </button>
            </header>
            <div className="game-modal-content">
              <section className="game-objective"><span className="game-section-icon"><Target /></span><div><h3>Objetivo do jogo</h3><p>{game.objective}</p></div></section>
              {game.fieldMap && <section className="game-field-map" aria-labelledby={`game-map-title-${game.id}`}>
                <div className="game-section-heading"><MapIcon /><h3 id={`game-map-title-${game.id}`}>Mapa do campo</h3></div>
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
                    <div className="game-section-heading"><Swords /><h3>Como jogar</h3></div>
                    <ol>{game.rules.map((rule, index) => <li key={`${index}-${rule}`}><span className="game-rule-number" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{rule}</p></li>)}</ol>
                  </section>
                  <section className="game-safety"><ShieldCheck /><div><h3>Segurança em primeiro lugar</h3><p>{game.safety}</p></div></section>
                </div>
                <aside className="game-modal-sidebar" aria-label="Informações complementares do jogo">
                  <div className="game-facts">
                    <section className="game-detail"><Users /><div><h3>Formação das equipes</h3><p>{game.teamFormation}</p></div></section>
                    <section className="game-detail"><Trophy /><div><h3>Condição de vitória</h3><p>{game.victory}</p></div></section>
                    <section className="game-detail"><Swords /><div><h3>Equipamentos permitidos</h3><p>{game.equipment}</p></div></section>
                  </div>
                  {game.media?.length ? <section className="game-media" aria-label="Fotos e vídeos do jogo">
                    <div className="game-section-heading"><Camera /><h3>Fotos e vídeos</h3></div>
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
          </section>
        </div>, document.body)
      )}
    </article>
  );
}
