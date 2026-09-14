"use client";

import { ChevronDown, ShieldCheck, Swords, Target, Trophy, Users } from "lucide-react";
import { useState } from "react";
import type { Game } from "@/lib/types";

export default function GameCard({ game }: { game: Game }) {
  const [open, setOpen] = useState(false);

  return (
    <article className={"game-card " + (open ? "is-open" : "")}>
      <button className="game-summary" type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span className="game-number">{game.name.slice(0, 2).toUpperCase()}</span>
        <span className="game-title">
          <strong>{game.name}</strong>
          <small>{game.summary}</small>
        </span>
        <ChevronDown className="game-chevron" />
      </button>

      <div className="game-details">
        <div className="game-detail"><Target /><div><strong>Objetivo</strong><p>{game.objective}</p></div></div>
        <div className="game-detail"><Users /><div><strong>Formação das equipes</strong><p>{game.teamFormation}</p></div></div>
        <div className="game-detail game-rules"><Swords /><div><strong>Regras</strong><ul>{game.rules.map((rule) => <li key={rule}>{rule}</li>)}</ul></div></div>
        <div className="game-detail"><Trophy /><div><strong>Condição de vitória</strong><p>{game.victory}</p></div></div>
        <div className="game-detail"><Swords /><div><strong>Equipamentos permitidos</strong><p>{game.equipment}</p></div></div>
        <div className="game-detail"><ShieldCheck /><div><strong>Segurança</strong><p>{game.safety}</p></div></div>
      </div>
    </article>
  );
}
