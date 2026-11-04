"use client";

import { ArrowUpRight, Camera, Film, ShieldCheck, Swords, Target, Trophy, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { Game } from "@/lib/types";

export default function GameCard({ game }: { game: Game }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const dialogRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const closeModal = () => setClosing(true);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
      if (event.key === "Tab") {
        const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), a[href], video[controls], [tabindex="0"]');
        if (!controls?.length) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
      triggerRef.current?.focus({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!closing) return;
    const timeout = window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [closing]);

  return (
    <article className="game-card">
      <button ref={triggerRef} className="game-summary" type="button" onClick={() => { setClosing(false); setOpen(true); }} aria-haspopup="dialog">
        <span className="game-number">{game.name.slice(0, 2).toUpperCase()}</span>
        <span className="game-title">
          <strong>{game.name}</strong>
          <small>{game.summary}</small>
        </span>
        <span className="game-link">Ver detalhes <ArrowUpRight size={16} /></span>
      </button>

      {open && (
        createPortal(<div
          className={`game-modal-backdrop${closing ? " is-closing" : ""}`}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section ref={dialogRef} className="game-modal" role="dialog" aria-modal="true" aria-labelledby={`game-title-${game.id}`} aria-describedby={`game-summary-${game.id}`}>
            <header className="game-modal-header">
              <div>
                <span className="eyebrow">Jogo de Swordplay</span>
                <h2 id={`game-title-${game.id}`}>{game.name}</h2>
                <p id={`game-summary-${game.id}`}>{game.summary}</p>
              </div>
              <button className="game-modal-close" type="button" onClick={closeModal} aria-label="Fechar detalhes" autoFocus>
                <X size={22} />
              </button>
            </header>
            <div className="game-modal-content">
              <section className="game-objective"><span className="game-section-icon"><Target /></span><div><h3>Objetivo do jogo</h3><p>{game.objective}</p></div></section>
              <div className="game-modal-columns">
                <div className="game-modal-main">
                  <section className="game-rules">
                    <div className="game-section-heading"><Swords /><h3>Como jogar</h3><span>{game.rules.length} regras</span></div>
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
                  <section className="game-media" aria-label="Fotos e vídeos do jogo">
                    <div className="game-section-heading"><Camera /><h3>Fotos e vídeos</h3></div>
                    {game.media?.length ? <div className="game-media-gallery">{game.media.map((media, index) => <figure key={`${media.url}-${index}`}>
                      {media.type === "image"
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={media.url} alt={media.caption || `Registro de ${game.name}`} loading="lazy" />
                        : <video src={media.url} poster={media.poster} controls playsInline preload="metadata" aria-label={media.caption || `Vídeo de ${game.name}`} />}
                      {media.caption && <figcaption>{media.caption}</figcaption>}
                    </figure>)}</div> : <div className="game-media-empty"><span aria-hidden="true"><Camera /><Film /></span><p>O jogo em ação</p><small>Fotos e vídeos aparecerão aqui assim que forem adicionados.</small></div>}
                  </section>
                </aside>
              </div>
            </div>
          </section>
        </div>, document.body)
      )}
    </article>
  );
}
