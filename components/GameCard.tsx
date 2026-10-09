"use client";

import { ArrowUpRight, ShieldCheck, Swords, Target, Trophy, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Game } from "@/lib/types";

export default function GameCard({ game }: { game: Game }) {
  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);

  const closeModal = () => setClosing(true);

  useEffect(() => {
    if (!open) return;

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
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
      <button className="game-summary" type="button" onClick={() => { setClosing(false); setOpen(true); }} aria-haspopup="dialog">
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
          <section className="game-modal" role="dialog" aria-modal="true" aria-labelledby={`game-title-${game.id}`}>
            <header className="game-modal-header">
              <div>
                <span className="eyebrow">Jogo de Swordplay</span>
                <h2 id={`game-title-${game.id}`}>{game.name}</h2>
                <p>{game.summary}</p>
              </div>
              <button className="game-modal-close" type="button" onClick={closeModal} aria-label="Fechar detalhes" autoFocus>
                <X size={22} />
              </button>
            </header>
            <div className="game-modal-content">
              <div className="game-detail"><Target /><div><strong>Objetivo</strong><p>{game.objective}</p></div></div>
              <div className="game-detail"><Users /><div><strong>Formação das equipes</strong><p>{game.teamFormation}</p></div></div>
              <div className="game-detail game-rules"><Swords /><div><strong>Regras</strong><ul>{game.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul></div></div>
              <div className="game-detail"><Trophy /><div><strong>Condição de vitória</strong><p>{game.victory}</p></div></div>
              <div className="game-detail"><Swords /><div><strong>Equipamentos permitidos</strong><p>{game.equipment}</p></div></div>
              <div className="game-detail"><ShieldCheck /><div><strong>Segurança</strong><p>{game.safety}</p></div></div>
            </div>
          </section>
        </div>, document.body)
      )}
    </article>
  );
}
