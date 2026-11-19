"use client";

import { ArrowLeft, BookOpenCheck, Check, FileQuestion, LoaderCircle, Search, Shuffle, Sparkles, X } from "lucide-react";
import { FormEvent, KeyboardEvent, ReactNode, useId, useMemo, useRef, useState } from "react";
import Select from "@/components/ui/Select";
import {
  assessmentDifficultyOptions,
  assessmentQuestionCountOptions,
  assessmentScopeOptions,
  assessmentTrackOptions,
} from "@/lib/assessments";
import { graduationLabels, graduationOptions, rankGroups, rankLabels } from "@/lib/member-access";
import type {
  AssessmentQuestion,
  AssessmentScopeType,
  AssessmentSelectionMode,
  AssessmentTrack,
  DkRank,
  GraduationLevel,
} from "@/lib/types";

export type AssessmentPayload = Record<string, unknown>;

type FormState = {
  title: string;
  description: string;
  target_type: AssessmentScopeType;
  target_rank: DkRank;
  target_graduation: GraduationLevel;
  track: AssessmentTrack;
  question_count: number;
  passing_score: number;
  duration_minutes: string;
  content_type: AssessmentScopeType;
  content_ranks: DkRank[];
  content_graduations: GraduationLevel[];
  selection_mode: AssessmentSelectionMode;
};

const emptyForm: FormState = {
  title: "",
  description: "",
  target_type: "patente",
  target_rank: "primeiro_sargento",
  target_graduation: "bronze",
  track: "geral",
  question_count: 10,
  passing_score: 70,
  duration_minutes: "",
  content_type: "patente",
  content_ranks: ["terceiro_sargento", "segundo_sargento", "primeiro_sargento"],
  content_graduations: [],
  selection_mode: "sorteio_individual",
};

const STEP_TITLES = ["Identificação", "Conteúdo e regras", "Montagem"] as const;

const normalize = (value: string) => value.toLocaleLowerCase("pt-BR");

export default function AssessmentCreateForm({ questions, busy, onPublish, onCancel }: {
  questions: AssessmentQuestion[];
  busy: boolean;
  onPublish: (body: AssessmentPayload) => Promise<boolean>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [hint, setHint] = useState<number | null>(null);
  const stepRefs = useRef<Array<HTMLElement | null>>([]);
  const targetSelectId = useId();
  const titleId = useId();
  const descriptionId = useId();
  const passingId = useId();
  const durationId = useId();

  const patch = (changes: Partial<FormState>) => setForm((current) => ({ ...current, ...changes }));

  // Questões que cabem nos conteúdos e na área escolhidos (mesma regra do servidor).
  const eligible = useMemo(() => questions.filter((question) => {
    if (!question.active || question.scope_type !== form.content_type) return false;
    if (form.selection_mode === "sorteio_individual" && question.question_type !== "objetiva") return false;
    const scopeMatches = question.scope_type === "patente"
      ? question.rank_scopes.some((rank) => form.content_ranks.includes(rank))
      : question.graduation_scopes.some((level) => form.content_graduations.includes(level));
    const trackMatches = form.track === "geral"
      ? question.track === "geral"
      : question.track === "geral" || question.track === form.track;
    return scopeMatches && trackMatches;
  }), [questions, form.content_type, form.content_ranks, form.content_graduations, form.track, form.selection_mode]);

  // A seleção manual preserva o que continua válido quando os filtros mudam.
  const chosen = useMemo(() => {
    const eligibleIds = new Set(eligible.map((question) => question.id));
    return selected.filter((id) => eligibleIds.has(id)).slice(0, form.question_count);
  }, [selected, eligible, form.question_count]);
  const chosenSet = useMemo(() => new Set(chosen), [chosen]);

  const manual = form.selection_mode === "manual";
  const pool = manual ? chosen.length : eligible.length;

  const visibleQuestions = useMemo(() => {
    const term = normalize(search.trim());
    if (!term) return eligible;
    return eligible.filter((question) => normalize(`${question.prompt} ${question.manual_title} ${question.source_chapter ?? ""}`).includes(term));
  }, [eligible, search]);

  const scopes: string[] = form.content_type === "patente" ? form.content_ranks : form.content_graduations;
  const durationValid = form.duration_minutes === "" || (Number.isInteger(Number(form.duration_minutes)) && Number(form.duration_minutes) >= 5 && Number(form.duration_minutes) <= 360);
  const passingValid = Number.isFinite(form.passing_score) && form.passing_score >= 0 && form.passing_score <= 100;

  const done = [
    form.title.trim().length >= 3,
    scopes.length > 0 && durationValid && passingValid,
    pool >= form.question_count,
  ];
  const firstPending = done.indexOf(false);
  const complete = firstPending === -1;

  function setScopes(next: string[]) {
    if (form.content_type === "patente") patch({ content_ranks: next as DkRank[] });
    else patch({ content_graduations: next as GraduationLevel[] });
  }

  function changeTargetType(type: AssessmentScopeType) {
    if (type === form.target_type && type === form.content_type) return;
    patch({
      target_type: type,
      content_type: type,
      content_ranks: type === "patente" ? ["terceiro_sargento"] : [],
      content_graduations: type === "graduacao" ? ["bronze"] : [],
    });
  }

  function changeContentType(type: AssessmentScopeType) {
    if (type === form.content_type) return;
    patch({
      content_type: type,
      content_ranks: type === "patente" ? ["terceiro_sargento"] : [],
      content_graduations: type === "graduacao" ? ["bronze"] : [],
    });
  }

  const groups = form.content_type === "patente"
    ? rankGroups.map((group) => ({ key: group.category, label: group.category, items: group.ranks.map((rank) => ({ value: rank.value as string, label: rank.label })) }))
    : [{ key: "graduacoes", label: "", items: graduationOptions.filter((item) => item.value !== "sem_graduacao").map((item) => ({ value: item.value as string, label: item.label })) }];

  function toggleScope(value: string) {
    setScopes(scopes.includes(value) ? scopes.filter((item) => item !== value) : [...scopes, value]);
  }

  function toggleGroup(values: string[]) {
    const all = values.every((value) => scopes.includes(value));
    setScopes(all ? scopes.filter((value) => !values.includes(value)) : [...scopes, ...values.filter((value) => !scopes.includes(value))]);
  }

  function toggleQuestion(id: string) {
    setSelected((current) => {
      const base = current.filter((item) => chosenSet.has(item));
      return base.includes(id) ? base.filter((item) => item !== id) : base.length >= form.question_count ? base : [...base, id];
    });
  }

  function fillQuestions() {
    const missing = form.question_count - chosen.length;
    if (missing <= 0) return;
    const rest = eligible.filter((question) => !chosenSet.has(question.id)).sort(() => Math.random() - 0.5).slice(0, missing);
    setSelected([...chosen, ...rest.map((question) => question.id)]);
  }

  function goToPending() {
    const index = firstPending === -1 ? 0 : firstPending;
    setHint(index);
    stepRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!complete) {
      goToPending();
      return;
    }
    await onPublish({
      title: form.title,
      description: form.description,
      target_type: form.target_type,
      target_rank: form.target_type === "patente" ? form.target_rank : null,
      target_graduation: form.target_type === "graduacao" ? form.target_graduation : null,
      content_type: form.content_type,
      content_rank_scopes: form.content_type === "patente" ? form.content_ranks : [],
      content_graduation_scopes: form.content_type === "graduacao" ? form.content_graduations : [],
      track: form.track,
      question_count: form.question_count,
      selection_mode: form.selection_mode,
      passing_score: form.passing_score,
      duration_minutes: form.duration_minutes,
      question_ids: manual ? chosen : [],
    });
  }

  const targetLabel = form.target_type === "patente" ? rankLabels[form.target_rank] : graduationLabels[form.target_graduation];
  const trackLabel = assessmentTrackOptions.find((item) => item.value === form.track)?.label;
  const stepClass = (index: number) => `assessment-create-step${done[index] ? " is-done" : ""}${firstPending === index ? " is-current" : ""}${hint === index ? " is-hinted" : ""}`;

  return <form className="assessment-create" onSubmit={submit} noValidate>
    <header className="assessment-create-head">
      <button className="icon-button" type="button" onClick={onCancel} aria-label="Voltar para as avaliações" title="Voltar"><ArrowLeft aria-hidden="true" /></button>
      <h3>Nova avaliação</h3>
    </header>

    <div className="assessment-create-main">
      <section className={stepClass(0)} ref={(node) => { stepRefs.current[0] = node; }} onAnimationEnd={() => setHint(null)}>
        <StepHeader index={0} done={done[0]} />
        <div className="create-grid">
          <Field label="Título" htmlFor={titleId} wide>
            <input id={titleId} value={form.title} onChange={(event) => patch({ title: event.target.value })} maxLength={180} autoComplete="off" />
          </Field>
          <Field label="Descrição" htmlFor={descriptionId} wide>
            <textarea id={descriptionId} rows={3} value={form.description} onChange={(event) => patch({ description: event.target.value })} />
          </Field>
          <Field label="Objetivo" wide>
            <div className="create-inline">
              <Segmented label="Tipo do objetivo" value={form.target_type} options={assessmentScopeOptions} onChange={changeTargetType} />
              <div className="create-inline-select">
                {form.target_type === "patente"
                  ? <Select id={targetSelectId} value={form.target_rank} options={rankGroups.flatMap((group) => group.ranks.map((rank) => ({ value: rank.value, label: rank.label, group: group.category })))} onChange={(value) => patch({ target_rank: value as DkRank })} />
                  : <Select id={targetSelectId} value={form.target_graduation} options={graduationOptions.filter((item) => item.value !== "sem_graduacao").map((item) => ({ value: item.value, label: item.label }))} onChange={(value) => patch({ target_graduation: value as GraduationLevel })} />}
              </div>
            </div>
          </Field>
          <Field label="Área" wide>
            <Segmented label="Área" value={form.track} options={assessmentTrackOptions} onChange={(value) => patch({ track: value as AssessmentTrack })} />
          </Field>
        </div>
      </section>

      <section className={stepClass(1)} ref={(node) => { stepRefs.current[1] = node; }} onAnimationEnd={() => setHint(null)}>
        <StepHeader index={1} done={done[1]} />
        <div className="create-grid">
          <Field label="Conteúdo" wide>
            <Segmented label="Tipo do conteúdo" value={form.content_type} options={assessmentScopeOptions} onChange={changeContentType} />
            <div className="create-chip-groups">
              {groups.map((group) => {
                const values = group.items.map((item) => item.value);
                const count = values.filter((value) => scopes.includes(value)).length;
                return <div className="create-chip-group" key={group.key}>
                  {group.label && <button className="create-chip-group-head" type="button" aria-pressed={count === values.length} onClick={() => toggleGroup(values)}><span>{group.label}</span><small>{count}/{values.length}</small></button>}
                  <div className="create-chips">{group.items.map((item) => <button className="create-chip" type="button" key={item.value} aria-pressed={scopes.includes(item.value)} onClick={() => toggleScope(item.value)}>{scopes.includes(item.value) && <Check aria-hidden="true" />}{item.label}</button>)}</div>
                </div>;
              })}
            </div>
          </Field>
          <Field label="Questões" wide>
            <Segmented
              label="Quantidade de questões"
              value={form.question_count}
              options={assessmentQuestionCountOptions.map((count) => ({ value: count, label: String(count), dim: eligible.length < count }))}
              onChange={(value) => patch({ question_count: Number(value) })}
            />
          </Field>
          <Field label="Aprovação" htmlFor={passingId}>
            <div className="create-affix">
              <input id={passingId} type="number" inputMode="numeric" min={0} max={100} value={Number.isFinite(form.passing_score) ? form.passing_score : ""} onChange={(event) => patch({ passing_score: event.target.value === "" ? Number.NaN : Number(event.target.value) })} aria-invalid={!passingValid} />
              <span aria-hidden="true">%</span>
            </div>
          </Field>
          <Field label="Tempo" htmlFor={durationId}>
            <div className="create-affix">
              <input id={durationId} type="number" inputMode="numeric" min={5} max={360} value={form.duration_minutes} onChange={(event) => patch({ duration_minutes: event.target.value })} placeholder="∞" aria-invalid={!durationValid} />
              <span aria-hidden="true">min</span>
            </div>
          </Field>
        </div>
      </section>

      <section className={stepClass(2)} ref={(node) => { stepRefs.current[2] = node; }} onAnimationEnd={() => setHint(null)}>
        <StepHeader index={2} done={done[2]} />
        <div className="create-modes" role="radiogroup" aria-label="Forma de montagem">
          <ModeCard checked={!manual} icon={<Shuffle aria-hidden="true" />} label="Sorteio individual" onSelect={() => patch({ selection_mode: "sorteio_individual" })} />
          <ModeCard checked={manual} icon={<BookOpenCheck aria-hidden="true" />} label="Seleção manual" onSelect={() => patch({ selection_mode: "manual" })} />
        </div>

        {manual
          ? <>
            <div className="create-pick-bar">
              <BankMeter value={chosen.length} total={form.question_count} label="Questões selecionadas" />
              <label className="create-search"><Search aria-hidden="true" /><input value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Buscar questões" /></label>
              <button className="icon-button" type="button" onClick={fillQuestions} disabled={chosen.length >= form.question_count || !eligible.length} aria-label="Completar com questões aleatórias" title="Completar automaticamente"><Sparkles aria-hidden="true" /></button>
              <button className="icon-button" type="button" onClick={() => setSelected([])} disabled={!chosen.length} aria-label="Limpar seleção" title="Limpar seleção"><X aria-hidden="true" /></button>
            </div>
            {visibleQuestions.length
              ? <div className="create-questions">{visibleQuestions.map((question) => {
                const checked = chosenSet.has(question.id);
                const locked = !checked && chosen.length >= form.question_count;
                return <label className={`create-question${checked ? " is-selected" : ""}${locked ? " is-locked" : ""}`} key={question.id}>
                  <input type="checkbox" checked={checked} disabled={locked} onChange={() => toggleQuestion(question.id)} />
                  <i className="create-check" aria-hidden="true"><Check /></i>
                  <span>
                    <strong>{question.prompt}</strong>
                    <span className="create-tags">
                      <small>{question.manual_title}</small>
                      <small>{question.question_type === "objetiva" ? "Objetiva" : "Aberta"}</small>
                      <small>{assessmentDifficultyOptions.find((item) => item.value === question.difficulty)?.label}</small>
                    </span>
                  </span>
                </label>;
              })}</div>
              : <div className="create-empty"><FileQuestion aria-hidden="true" /><strong>Nenhuma questão compatível</strong></div>}
          </>
          : <div className="create-pool">
            <BankMeter value={eligible.length} total={form.question_count} label="Questões objetivas no banco" large />
          </div>}
      </section>
    </div>

    <aside className="assessment-create-summary" aria-label="Resumo da avaliação">
      <div className="create-summary-card">
        <div className="create-summary-top">
          {manual ? <BookOpenCheck aria-hidden="true" /> : <Shuffle aria-hidden="true" />}
          <span>{form.question_count} questões</span>
        </div>
        <h4 className={form.title.trim() ? "" : "is-empty"}>{form.title.trim() || "Nova avaliação"}</h4>
        <p className="create-summary-target">{targetLabel}</p>
        <dl>
          <div><dt>Aprovação</dt><dd>{Number.isFinite(form.passing_score) ? `${form.passing_score}%` : "—"}</dd></div>
          <div><dt>Tempo</dt><dd>{form.duration_minutes ? `${form.duration_minutes} min` : "∞"}</dd></div>
          <div><dt>Área</dt><dd>{trackLabel}</dd></div>
          <div><dt>Montagem</dt><dd>{manual ? "Manual" : "Sorteio"}</dd></div>
        </dl>
        <BankMeter value={pool} total={form.question_count} label={manual ? "Questões selecionadas" : "Questões objetivas no banco"} />
      </div>
      <div className="create-summary-actions">
        <button className="button button-ghost" type="button" onClick={onCancel} disabled={busy}>Cancelar</button>
        <button
          className={`button button-primary${complete ? "" : " is-pending"}`}
          type="submit"
          aria-disabled={!complete || busy}
          onMouseEnter={() => { if (!complete) setHint(firstPending); }}
          onFocus={() => { if (!complete) setHint(firstPending); }}
        >{busy ? <LoaderCircle className="spin" aria-hidden="true" /> : <BookOpenCheck aria-hidden="true" />} Publicar</button>
      </div>
    </aside>
  </form>;
}

function StepHeader({ index, done }: { index: number; done: boolean }) {
  return <header className="assessment-create-step-head">
    <span className="assessment-create-badge" aria-hidden="true">{done ? <Check /> : index + 1}</span>
    <h4>{STEP_TITLES[index]}</h4>
    <span className="sr-only">{done ? "Concluída" : "Pendente"}</span>
  </header>;
}

function Field({ label, htmlFor, wide = false, children }: { label: string; htmlFor?: string; wide?: boolean; children: ReactNode }) {
  return <div className={`create-field${wide ? " is-wide" : ""}`}>
    {htmlFor ? <label className="create-label" htmlFor={htmlFor}>{label}</label> : <span className="create-label">{label}</span>}
    {children}
  </div>;
}

type SegmentedOption<T extends string | number> = { value: T; label: string; dim?: boolean };

function Segmented<T extends string | number>({ label, value, options, onChange }: {
  label: string;
  value: T;
  options: ReadonlyArray<SegmentedOption<T>>;
  onChange: (value: T) => void;
}) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
    if (!keys.includes(event.key)) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="radio"]'));
    const current = options.findIndex((option) => option.value === value);
    let next = current;
    if (event.key === "Home") next = 0;
    else if (event.key === "End") next = options.length - 1;
    else next = (current + (event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1) + options.length) % options.length;
    event.preventDefault();
    onChange(options[next].value);
    buttons[next]?.focus();
  }
  return <div className="segmented" role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
    {options.map((option) => {
      const active = option.value === value;
      return <button type="button" role="radio" key={option.value} aria-checked={active} tabIndex={active ? 0 : -1} className={option.dim ? "is-dim" : undefined} onClick={() => onChange(option.value)}>{option.label}</button>;
    })}
  </div>;
}

function ModeCard({ checked, icon, label, onSelect }: { checked: boolean; icon: ReactNode; label: string; onSelect: () => void }) {
  return <label className={`create-mode${checked ? " is-selected" : ""}`}>
    <input type="radio" name="assessment-selection-mode" checked={checked} onChange={onSelect} />
    {icon}
    <strong>{label}</strong>
    <i className="create-mode-dot" aria-hidden="true" />
  </label>;
}

function BankMeter({ value, total, label, large = false }: { value: number; total: number; label: string; large?: boolean }) {
  const enough = value >= total;
  return <div className={`bank-meter${enough ? " is-ok" : " is-short"}${large ? " is-large" : ""}`} role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={total} aria-valuenow={Math.min(value, total)}>
    <div className="bank-meter-track"><i style={{ width: `${total ? Math.min(100, (value / total) * 100) : 0}%` }} /></div>
    <strong>{value}<span> / {total}</span></strong>
  </div>;
}
