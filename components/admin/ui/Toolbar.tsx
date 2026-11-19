"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";

/** Barra acima de listas: filtros à esquerda, informações e ações à direita. */
export function Toolbar({ filters, meta }: { filters?: ReactNode; meta?: ReactNode }) {
  return <div className="admin-toolbar">
    {filters && <div className="admin-toolbar-filters">{filters}</div>}
    {meta && <div className="admin-toolbar-meta">{meta}</div>}
  </div>;
}

export function SearchField({ value, onChange, placeholder, label = "Buscar" }: { value: string; onChange: (value: string) => void; placeholder?: string; label?: string }) {
  return <label className="admin-search"><span className="sr-only">{label}</span><Search aria-hidden="true" /><input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

export type ChipOption<V extends string> = { value: V; label: string; count?: number };

/** Filtro exclusivo em forma de chips (uma opção sempre ativa). */
export function FilterChips<V extends string>({ value, options, onChange, label }: { value: V; options: ChipOption<V>[]; onChange: (value: V) => void; label: string }) {
  return <div className="filter-chips" role="group" aria-label={label}>
    {options.map((option) => <button
      key={option.value}
      type="button"
      className={`filter-chip${option.value === value ? " is-active" : ""}`}
      aria-pressed={option.value === value}
      onClick={() => onChange(option.value)}
    >{option.label}{option.count !== undefined && <span className="filter-chip-count">{option.count}</span>}</button>)}
  </div>;
}
