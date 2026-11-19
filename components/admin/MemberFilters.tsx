"use client";

import { ChevronDown, CircleDashed, Crown, RotateCcw, SlidersHorizontal, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { FilterChips, SearchField, type ChipOption } from "@/components/admin/ui/Toolbar";
import { GraduationInsignia, RankInsignia } from "@/components/member/Insignia";
import { rankGroups } from "@/lib/member-access";
import { graduationFilterOptions, rankFilterOptions, trackFilterOptions, type GraduationFilter, type RankFilter, type TrackFilter } from "@/lib/member-filters";
import type { GraduationLevel } from "@/lib/types";

type Props<S extends string> = {
  search: string;
  onSearch: (value: string) => void;
  status: S;
  statusOptions: ChipOption<S>[];
  onStatus: (value: S) => void;
  /** Valor de "sem filtro" da situação (ex.: "todos"). */
  statusAll: S;
  rank: RankFilter;
  onRank: (value: RankFilter) => void;
  graduation: GraduationFilter;
  onGraduation: (value: GraduationFilter) => void;
  track: TrackFilter;
  onTrack: (value: TrackFilter) => void;
  commanderOnly: boolean;
  onCommanderOnly: (value: boolean) => void;
  shown: number;
  total: number;
  filtersActive: boolean;
  onClear: () => void;
};

const optionLabel = (options: Array<{ value: string; label: string }>, value: string) => options.find((option) => option.value === value)?.label ?? value;

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" className={`filter-chip mf-chip${active ? " is-active" : ""}`} aria-pressed={active} onClick={onClick}>{children}</button>;
}

/** Medalha de graduação desenhada só como enfeite: o texto do botão já diz o nível. */
function Medal({ level }: { level: GraduationLevel }) {
  return <span className="mf-medal" aria-hidden="true"><GraduationInsignia level={level} track="cavalaria" variant="icon" /></span>;
}

export default function MemberFilters<S extends string>({
  search, onSearch, status, statusOptions, onStatus, statusAll, rank, onRank, graduation, onGraduation, track, onTrack, commanderOnly, onCommanderOnly, shown, total, filtersActive, onClear,
}: Props<S>) {
  const detailCount = (status !== statusAll ? 1 : 0) + (rank !== "todas" ? 1 : 0) + (graduation !== "todas" ? 1 : 0) + (commanderOnly ? 1 : 0);
  // Aberto de saída quando já há patente/graduação filtrada (ex.: ao voltar para a aba).
  const [open, setOpen] = useState(detailCount > 0);
  const trackEnabled = graduation !== "todas" || commanderOnly;

  // A trilha só existe junto de uma graduação ou do comando: sem os dois, volta ao padrão.
  function changeGraduation(next: GraduationFilter, commander = commanderOnly) {
    onGraduation(next);
    if (next === "todas" && !commander) onTrack("qualquer");
  }
  function changeCommander(next: boolean) {
    onCommanderOnly(next);
    if (!next && graduation === "todas") onTrack("qualquer");
  }

  const pills: Array<{ key: string; label: string; clear: () => void }> = [];
  if (status !== statusAll) pills.push({ key: "status", label: optionLabel(statusOptions, status), clear: () => onStatus(statusAll) });
  if (rank !== "todas") pills.push({ key: "rank", label: optionLabel(rankFilterOptions, rank), clear: () => onRank("todas") });
  if (graduation !== "todas") pills.push({ key: "graduation", label: optionLabel(graduationFilterOptions, graduation), clear: () => changeGraduation("todas") });
  if (commanderOnly) pills.push({ key: "commander", label: "Comandante", clear: () => changeCommander(false) });
  if (trackEnabled && track !== "qualquer") pills.push({ key: "track", label: optionLabel(trackFilterOptions, track), clear: () => onTrack("qualquer") });

  return <section className="member-filters" aria-label="Filtros de membros">
    <div className="member-filters-bar">
      <div className="mf-search">
        <SearchField value={search} onChange={onSearch} placeholder="Buscar por apelido, nome, e-mail ou patente" label="Buscar membro" />
        <button type="button" className={`mf-toggle${open ? " is-open" : ""}${detailCount ? " has-filters" : ""}`} aria-expanded={open} aria-controls="member-filters-panel" onClick={() => setOpen((value) => !value)}>
          <SlidersHorizontal aria-hidden="true" />
          <span>Filtros</span>
          {detailCount > 0 && <span className="mf-toggle-count" aria-label={`${detailCount} ${detailCount === 1 ? "filtro ativo" : "filtros ativos"}`}>{detailCount}</span>}
          <ChevronDown className="mf-toggle-chevron" aria-hidden="true" />
        </button>
      </div>
    </div>

    {open && <div className="member-filters-panel" id="member-filters-panel">
      <fieldset className="mf-section">
        <legend>Situação</legend>
        <FilterChips label="Situação" value={status} options={statusOptions} onChange={onStatus} />
      </fieldset>

      <fieldset className="mf-section">
        <legend>Patente</legend>
        <div className="mf-groups">
          {rankGroups.map((group) => {
            const groupValue: RankFilter = `grupo:${group.category}`;
            return <div className="mf-group" key={group.category} role="group" aria-label={group.category}>
              <span className="mf-group-label">{group.category}</span>
              <div className="mf-chips">
                {group.ranks.length > 1 && <Chip active={rank === groupValue} onClick={() => onRank(rank === groupValue ? "todas" : groupValue)}>Todos</Chip>}
                {group.ranks.map((item) => <Chip key={item.value} active={rank === item.value} onClick={() => onRank(rank === item.value ? "todas" : item.value)}>
                  <span className="mf-rank-art" aria-hidden="true"><RankInsignia rank={item.value} variant="icon" /></span>{item.label}
                </Chip>)}
              </div>
            </div>;
          })}
        </div>
      </fieldset>

      <fieldset className="mf-section">
        <legend>Graduação</legend>
        <div className="mf-chips">
          {graduationFilterOptions.filter((option) => option.value !== "todas").map((option) => {
            const value = option.value as GraduationFilter;
            return <Chip key={option.value} active={graduation === value} onClick={() => changeGraduation(graduation === value ? "todas" : value)}>
              {value === "sem_graduacao" ? <CircleDashed aria-hidden="true" /> : <Medal level={value as GraduationLevel} />}{option.label}
            </Chip>;
          })}
          {/* Fora da lista de níveis: liga junto de qualquer nível ("Ouro" + "Comandante"). */}
          <span className="mf-divider" aria-hidden="true" />
          <Chip active={commanderOnly} onClick={() => changeCommander(!commanderOnly)}><Crown aria-hidden="true" />Comandante</Chip>
        </div>
        <div className="mf-track">
          <span className="mf-track-label" id="member-filter-track-label">Em qual trilha?</span>
          <div className="mf-segment" role="group" aria-labelledby="member-filter-track-label">
            {trackFilterOptions.map((option) => <button key={option.value} type="button" className={track === option.value ? "is-active" : ""} aria-pressed={track === option.value} disabled={!trackEnabled} onClick={() => onTrack(option.value as TrackFilter)}>{option.label}</button>)}
          </div>
          {!trackEnabled && <small>Escolha uma graduação ou comandante para filtrar por trilha.</small>}
        </div>
      </fieldset>
    </div>}

    <div className="member-filters-summary">
      <span className="mf-result" role="status" aria-live="polite"><strong>{shown}</strong> {filtersActive && total !== shown ? `de ${total} ` : ""}{shown === 1 ? "membro" : "membros"}</span>
      {pills.map((pill) => <span className="mf-pill" key={pill.key}>{pill.label}<button type="button" aria-label={`Remover filtro ${pill.label}`} onClick={pill.clear}><X aria-hidden="true" /></button></span>)}
      {filtersActive && <button type="button" className="mf-clear" onClick={onClear}><RotateCcw aria-hidden="true" /> Limpar</button>}
    </div>
  </section>;
}
