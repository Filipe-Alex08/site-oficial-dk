"use client";

import { CornerDownLeft, Search, UserRound } from "lucide-react";
import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { AdminNavItem } from "@/components/admin/AdminDataContext";
import { useDialogBehavior } from "@/components/admin/ui/useDialogBehavior";
import type { MemberProfile } from "@/lib/types";

type Result =
  | { key: string; kind: "section"; label: string; hint: string; item: AdminNavItem }
  | { key: string; kind: "member"; label: string; hint: string; member: MemberProfile };

const normalize = (value: string) => value.toLocaleLowerCase("pt-BR").normalize("NFD").replace(/[̀-ͯ]/g, "");

/** Paleta de comandos (Ctrl/⌘+K): ir para uma seção ou achar um membro pelo apelido. */
export default function CommandPalette({ nav, members, onGoToSection, onGoToMember, onClose }: {
  nav: AdminNavItem[];
  members: MemberProfile[];
  onGoToSection: (item: AdminNavItem) => void;
  onGoToMember: (member: MemberProfile) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();
  useDialogBehavior(ref, onClose, "input");

  const results = useMemo<Result[]>(() => {
    const term = normalize(query.trim());
    const sections: Result[] = nav
      .filter((item) => !term || normalize(item.label).includes(term) || normalize(item.group).includes(term))
      .map((item) => ({ key: `s-${item.id}`, kind: "section", label: item.label, hint: item.group, item }));
    const people: Result[] = term
      ? members
        .filter((member) => [member.nickname, member.full_name, member.email ?? ""].some((value) => normalize(value).includes(term)))
        .slice(0, 6)
        .map((member) => ({ key: `m-${member.id}`, kind: "member", label: member.nickname, hint: member.full_name, member }))
      : [];
    return [...sections, ...people];
  }, [query, nav, members]);
  const current = Math.min(active, Math.max(0, results.length - 1));

  function choose(result: Result | undefined) {
    if (!result) return;
    if (result.kind === "section") onGoToSection(result.item); else onGoToMember(result.member);
  }

  function onKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!results.length) return;
      setActive((index) => (Math.min(index, results.length - 1) + (event.key === "ArrowDown" ? 1 : -1) + results.length) % results.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(results[current]);
    }
  }

  return <div className="palette-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div ref={ref} className="palette" role="dialog" aria-modal="true" aria-label="Buscar ou ir para" onKeyDown={onKeyDown}>
      <label className="palette-input">
        <Search aria-hidden="true" />
        <span className="sr-only">Buscar seção ou membro</span>
        <input
          value={query}
          onChange={(event) => { setQuery(event.target.value); setActive(0); }}
          placeholder="Ir para uma seção ou buscar um membro…"
          role="combobox"
          aria-expanded="true"
          aria-controls={listId}
          aria-activedescendant={results.length ? `${listId}-${current}` : undefined}
          autoComplete="off"
        />
        <kbd>Esc</kbd>
      </label>
      <ul className="palette-list" id={listId} role="listbox">
        {results.map((result, index) => <li key={result.key} id={`${listId}-${index}`} role="option" aria-selected={index === current}>
          <button type="button" tabIndex={-1} className={index === current ? "is-active" : ""} onMouseEnter={() => setActive(index)} onClick={() => choose(result)}>
            <span className="palette-icon" aria-hidden="true">{result.kind === "section" ? result.item.icon : <UserRound />}</span>
            <span className="palette-text"><strong>{result.label}</strong><small>{result.kind === "member" ? result.hint : `Seção · ${result.hint}`}</small></span>
            {index === current && <CornerDownLeft className="palette-enter" aria-hidden="true" />}
          </button>
        </li>)}
        {!results.length && <li className="palette-empty" role="presentation">Nada encontrado para «{query}».</li>}
      </ul>
    </div>
  </div>;
}
