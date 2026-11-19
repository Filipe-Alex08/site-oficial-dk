"use client";

import { useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { Check, ChevronDown, ChevronRight, Copy, RefreshCw } from "lucide-react";
import AdminTitle from "@/components/admin/AdminTitle";
import { useToast } from "@/components/admin/ToastProvider";
import DataTable from "@/components/admin/ui/DataTable";
import Panel from "@/components/admin/ui/Panel";
import { onTabListKeyDown } from "@/components/admin/ui/tabKeys";
import { FilterChips } from "@/components/admin/ui/Toolbar";
import Select from "@/components/ui/Select";

type LogItem = {
  uid: string;
  occurred_at: string;
  level: "info" | "aviso" | "erro";
  source: "evento" | "servidor" | "auditoria";
  category: string;
  action: string | null;
  message: string;
  actor_id: string | null;
  actor_name: string | null;
  ip: string | null;
  path: string | null;
  details: Record<string, unknown> | null;
};
type LogPage = { items: LogItem[]; hasMore: boolean };
type Section = "servidor" | "auditoria";

const sections: { value: Section; label: string }[] = [
  { value: "servidor", label: "Servidor e eventos" },
  { value: "auditoria", label: "Auditoria" },
];

const periodOptions = [
  { value: "24h", label: "Últimas 24 horas" },
  { value: "3d", label: "Últimos 3 dias" },
  { value: "7d", label: "Últimos 7 dias" },
];
const levelOptions = [
  { value: "", label: "Todos" },
  { value: "info", label: "Informação" },
  { value: "aviso", label: "Aviso" },
  { value: "erro", label: "Erro" },
];
const sourceOptions = [
  { value: "", label: "Eventos e servidor" },
  { value: "evento", label: "Só eventos do site" },
  { value: "servidor", label: "Só servidor" },
];
const serverCategoryOptions = [
  { value: "", label: "Todas as categorias" },
  { value: "auth", label: "Login" },
  { value: "cadastro", label: "Cadastro" },
  { value: "conta", label: "Conta" },
  { value: "permissao", label: "Permissões" },
  { value: "request", label: "Erros de requisição" },
  { value: "console", label: "Console do servidor" },
];
const auditCategoryOptions = [
  { value: "", label: "Todos os registros" },
  { value: "user_admin_roles", label: "Cargos de administrador" },
  { value: "invites", label: "Convites" },
  { value: "log_viewer_permissions", label: "Permissão Ver logs" },
  { value: "avaliacoes", label: "Avaliações" },
];
const auditCategoryLabel: Record<string, string> = Object.fromEntries(auditCategoryOptions.filter((o) => o.value).map((o) => [o.value, o.label]));

// Reaproveita as cores de selo que já existem no painel.
const levelBadge: Record<LogItem["level"], string> = { info: "aprovado", aviso: "pendente", erro: "suspenso" };
const levelLabel: Record<LogItem["level"], string> = { info: "Info", aviso: "Aviso", erro: "Erro" };
const sourceLabel: Record<LogItem["source"], string> = { evento: "Evento", servidor: "Servidor", auditoria: "Auditoria" };
const auditActionLabel: Record<string, string> = { INSERT: "Criado", UPDATE: "Alterado", DELETE: "Removido" };

async function readLogs(params: URLSearchParams, signal?: AbortSignal): Promise<LogPage> {
  const response = await fetch(`/api/admin/logs?${params}`, { signal, cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Não foi possível carregar os logs.");
  return data as LogPage;
}

export default function LogsViewer() {
  const [section, setSection] = useState<Section>("servidor");
  const [period, setPeriod] = useState("7d");
  const [level, setLevel] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [auto, setAuto] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>(null);
  const audit = section === "auditoria";

  // Espera o fim da digitação antes de consultar o servidor.
  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(0); }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params = new URLSearchParams({ secao: section, periodo: period, pagina: String(page) });
  if (!audit && level) params.set("nivel", level);
  if (!audit && source) params.set("origem", source);
  if (category) params.set("categoria", category);
  if (search) params.set("busca", search);

  const query = useQuery({
    queryKey: ["admin-logs", section, period, level, source, category, search, page],
    queryFn: ({ signal }) => readLogs(params, signal),
    placeholderData: keepPreviousData,
    refetchInterval: auto ? 30_000 : false,
    gcTime: 0,
  });

  const items = query.data?.items ?? [];
  function change(setter: (value: string) => void) {
    return (value: string) => { setter(value); setPage(0); setOpenRow(null); };
  }
  // Os filtros de cada seção são diferentes: ao trocar, volta ao começo sem herdar nenhum.
  function switchSection(next: Section) {
    if (next === section) return;
    setSection(next);
    setLevel("");
    setSource("");
    setCategory("");
    setSearchInput("");
    setSearch("");
    setPage(0);
    setOpenRow(null);
  }

  return <section>
    <AdminTitle eyebrow="Gestão" title="Logs" description="Mantidos por 7 dias." />

    <div className="admin-subtabs" role="tablist" aria-label="Tipo de log" onKeyDown={onTabListKeyDown}>
      {sections.map((item) => <button
        key={item.value}
        id={`log-tab-${item.value}`}
        type="button"
        role="tab"
        aria-selected={section === item.value}
        aria-controls="log-panel"
        tabIndex={section === item.value ? 0 : -1}
        className={section === item.value ? "active" : ""}
        onClick={() => switchSection(item.value)}
      >{item.label}</button>)}
    </div>

    <div id="log-panel" role="tabpanel" aria-labelledby={`log-tab-${section}`}>
      <Panel>
        <div className="log-filters">
          <div className="field"><label htmlFor="log-period">Período</label><Select id="log-period" value={period} options={periodOptions} onChange={change(setPeriod)} /></div>
          {!audit && <div className="field"><label htmlFor="log-source">Origem</label><Select id="log-source" value={source} options={sourceOptions} onChange={change(setSource)} /></div>}
          <div className="field"><label htmlFor="log-category">{audit ? "Registro" : "Categoria"}</label><Select id="log-category" value={category} options={audit ? auditCategoryOptions : serverCategoryOptions} onChange={change(setCategory)} /></div>
          <div className="field field-full"><label htmlFor="log-search">Buscar</label><input id="log-search" value={searchInput} maxLength={80} onChange={(event) => setSearchInput(event.target.value)} placeholder={audit ? "Ação ou identificador" : "Mensagem, ação ou caminho"} /></div>
        </div>
        {!audit && <FilterChips label="Nível" value={level} options={levelOptions} onChange={change(setLevel)} />}
        <div className="form-actions">
          <button className="icon-button" type="button" disabled={query.isFetching} onClick={() => void query.refetch()} title={query.isFetching ? "Atualizando…" : "Atualizar"} aria-label="Atualizar logs"><RefreshCw className={query.isFetching ? "spin" : ""} aria-hidden="true" /></button>
          <label className="check-field"><input type="checkbox" checked={auto} onChange={(event) => setAuto(event.target.checked)} /> Atualizar a cada 30 s</label>
        </div>
      </Panel>

      {query.isPending && <p className="table-empty" role="status">Carregando logs…</p>}
      {query.isError && <p className="table-empty" role="alert">{query.error.message} <button className="text-button" onClick={() => void query.refetch()}>Tentar novamente</button></p>}
      {query.data && !items.length && <p className="empty-state">{audit ? "Nenhuma alteração registrada para esses filtros." : "Nenhum log encontrado para esses filtros."}</p>}

      {items.length > 0 && !audit && <Panel flush><DataTable
        rows={items}
        rowKey={(item) => item.uid}
        empty=""
        caption="Logs do servidor e eventos"
        rowClassName={(item) => `log-row log-level-${item.level}${openRow === item.uid ? " is-open" : ""}`}
        columns={[
          { key: "toggle", header: "Detalhes", srOnlyHeader: true, className: "is-select", render: (item) => <ToggleButton expanded={openRow === item.uid} onClick={() => setOpenRow(openRow === item.uid ? null : item.uid)} /> },
          { key: "event", header: "Evento", hideLabel: true, className: "is-lead", render: (item) => <><strong>{item.action ?? item.category}</strong><small>{item.message}</small></> },
          { key: "date", header: "Data e hora", render: (item) => formatDate(item.occurred_at) },
          { key: "level", header: "Nível", render: (item) => <span className={`badge ${levelBadge[item.level]}`}>{levelLabel[item.level]}</span> },
          { key: "source", header: "Origem", render: (item) => sourceLabel[item.source] ?? item.source },
          { key: "user", header: "Usuário", render: (item) => item.actor_name ?? (item.actor_id ? "Usuário removido" : "—") },
          { key: "ip", header: "IP", render: (item) => item.ip ?? "—" },
        ]}
        rowExtra={(item, columnCount) => openRow === item.uid
          ? <tr className="log-details-row"><td colSpan={columnCount}>
            <dl className="log-details">
              <dt>Categoria</dt><dd>{item.category}</dd>
              {item.path && <><dt>Caminho</dt><dd>{item.path}</dd></>}
              <dt>Dados</dt><dd><JsonBlock value={item.details ?? {}} /></dd>
            </dl>
          </td></tr>
          : null}
      /></Panel>}

      {items.length > 0 && audit && <Panel flush><DataTable
        rows={items}
        rowKey={(item) => item.uid}
        empty=""
        caption="Auditoria de alterações"
        rowClassName={(item) => openRow === item.uid ? "log-row is-open" : "log-row"}
        columns={[
          { key: "toggle", header: "Detalhes", srOnlyHeader: true, className: "is-select", render: (item) => <ToggleButton expanded={openRow === item.uid} onClick={() => setOpenRow(openRow === item.uid ? null : item.uid)} /> },
          { key: "record", header: "Registro", hideLabel: true, className: "is-lead", render: (item) => <><strong>{auditCategoryLabel[item.category] ?? item.category}</strong>{item.category !== "avaliacoes" && <small>{item.message}</small>}</> },
          { key: "action", header: "Ação", render: (item) => <strong>{auditActionLabel[item.action ?? ""] ?? item.action ?? "—"}</strong> },
          { key: "date", header: "Data e hora", render: (item) => formatDate(item.occurred_at) },
          { key: "by", header: "Feito por", render: (item) => item.actor_name ?? (item.actor_id ? "Usuário removido" : "Sistema") },
        ]}
        rowExtra={(item, columnCount) => {
          if (openRow !== item.uid) return null;
          const details = item.details ?? {};
          const before = (details as { before?: unknown }).before;
          const after = (details as { after?: unknown }).after;
          const hasDiff = before !== undefined || after !== undefined;
          return <tr className="log-details-row"><td colSpan={columnCount}>
            <dl className="log-details">
              {hasDiff ? <>
                {before !== undefined && before !== null && <><dt>Antes</dt><dd><JsonBlock value={before} /></dd></>}
                {after !== undefined && after !== null && <><dt>Depois</dt><dd><JsonBlock value={after} /></dd></>}
              </> : <><dt>Dados</dt><dd><JsonBlock value={details} /></dd></>}
            </dl>
          </td></tr>;
        }}
      /></Panel>}

      {(page > 0 || query.data?.hasMore) && <nav className="attendance-pagination" aria-label="Páginas de logs">
        <span role="status">Página {page + 1}</span>
        <div>
          <button className="button button-ghost" disabled={page === 0 || query.isFetching} onClick={() => { setPage(page - 1); setOpenRow(null); }}>Anterior</button>
          <button className="button button-ghost" disabled={!query.data?.hasMore || query.isFetching} onClick={() => { setPage(page + 1); setOpenRow(null); }}>Próxima</button>
        </div>
      </nav>}
    </div>
  </section>;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

function JsonBlock({ value }: { value: unknown }) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const text = JSON.stringify(value, null, 2);
  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não foi possível copiar.");
    }
  }
  return <div className="json-block">
    <button type="button" className="json-copy" onClick={() => void copy()} title={copied ? "Copiado" : "Copiar JSON"} aria-label="Copiar JSON">{copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}</button>
    <pre>{text}</pre>
  </div>;
}

function ToggleButton({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return <button type="button" className="icon-button" aria-expanded={expanded} aria-label={expanded ? "Ocultar detalhes" : "Ver detalhes"} onClick={onClick}>{expanded ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}</button>;
}
