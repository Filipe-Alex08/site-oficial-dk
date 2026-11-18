"use client";

import { Fragment, useEffect, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronRight, RefreshCw } from "lucide-react";
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

const sections: { value: Section; label: string; hint: string }[] = [
  { value: "servidor", label: "Servidor e eventos", hint: "O que o site fez: logins, cadastros, erros e mensagens do servidor." },
  { value: "auditoria", label: "Auditoria", hint: "Quem alterou o quê: cargos, convites, permissões e avaliações." },
];

const periodOptions = [
  { value: "24h", label: "Últimas 24 horas" },
  { value: "3d", label: "Últimos 3 dias" },
  { value: "7d", label: "Últimos 7 dias" },
];
const levelOptions = [
  { value: "", label: "Todos os níveis" },
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
    <div className="admin-title"><div><h2>Logs</h2><p>Registros dos últimos 7 dias. Logs com mais de 7 dias são apagados automaticamente.</p></div></div>

    <div className="log-tabs" role="tablist" aria-label="Tipo de log">
      {sections.map((item) => <button
        key={item.value}
        id={`log-tab-${item.value}`}
        type="button"
        role="tab"
        aria-selected={section === item.value}
        aria-controls="log-panel"
        className={section === item.value ? "active" : ""}
        onClick={() => switchSection(item.value)}
      >{item.label}</button>)}
    </div>

    <div id="log-panel" role="tabpanel" aria-labelledby={`log-tab-${section}`}>
      <p className="admin-hint">{sections.find((item) => item.value === section)?.hint}</p>
      <div className="admin-form">
        <div className="form-grid">
          <div className="field"><label htmlFor="log-period">Período</label><Select id="log-period" value={period} options={periodOptions} onChange={change(setPeriod)} /></div>
          {!audit && <div className="field"><label htmlFor="log-level">Nível</label><Select id="log-level" value={level} options={levelOptions} onChange={change(setLevel)} /></div>}
          {!audit && <div className="field"><label htmlFor="log-source">Origem</label><Select id="log-source" value={source} options={sourceOptions} onChange={change(setSource)} /></div>}
          <div className="field"><label htmlFor="log-category">{audit ? "Registro" : "Categoria"}</label><Select id="log-category" value={category} options={audit ? auditCategoryOptions : serverCategoryOptions} onChange={change(setCategory)} /></div>
          <div className="field field-full"><label htmlFor="log-search">Buscar</label><input id="log-search" value={searchInput} maxLength={80} onChange={(event) => setSearchInput(event.target.value)} placeholder={audit ? "Ação ou identificador" : "Mensagem, ação ou caminho"} /></div>
        </div>
        <div className="form-actions">
          <button className="button button-ghost" type="button" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw size={17} /> {query.isFetching ? "Atualizando…" : "Atualizar"}</button>
          <label className="check-field"><input type="checkbox" checked={auto} onChange={(event) => setAuto(event.target.checked)} /> Atualizar a cada 30 s</label>
        </div>
      </div>

      {query.isPending && <p role="status">Carregando logs…</p>}
      {query.isError && <p role="alert">{query.error.message} <button className="text-button" onClick={() => void query.refetch()}>Tentar novamente</button></p>}
      {query.data && !items.length && <p className="empty-state">{audit ? "Nenhuma alteração registrada para esses filtros." : "Nenhum log encontrado para esses filtros."}</p>}

      {items.length > 0 && !audit && <div className="table-wrap log-table"><table>
        <thead><tr><th aria-label="Detalhes" /><th>Data e hora</th><th>Nível</th><th>Origem</th><th>Evento</th><th>Usuário</th><th>IP</th></tr></thead>
        <tbody>{items.map((item) => {
          const expanded = openRow === item.uid;
          return <Fragment key={item.uid}>
            <tr className={expanded ? "log-row is-open" : "log-row"}>
              <td><ToggleButton expanded={expanded} onClick={() => setOpenRow(expanded ? null : item.uid)} /></td>
              <td>{formatDate(item.occurred_at)}</td>
              <td><span className={`badge ${levelBadge[item.level]}`}>{levelLabel[item.level]}</span></td>
              <td>{sourceLabel[item.source] ?? item.source}</td>
              <td><strong>{item.action ?? item.category}</strong><small>{item.message}</small></td>
              <td>{item.actor_name ?? (item.actor_id ? "Usuário removido" : "—")}</td>
              <td>{item.ip ?? "—"}</td>
            </tr>
            {expanded && <tr className="log-details-row"><td colSpan={7}>
              <dl className="log-details">
                <dt>Categoria</dt><dd>{item.category}</dd>
                {item.path && <><dt>Caminho</dt><dd>{item.path}</dd></>}
                <dt>Dados</dt><dd><pre>{JSON.stringify(item.details ?? {}, null, 2)}</pre></dd>
              </dl>
            </td></tr>}
          </Fragment>;
        })}</tbody>
      </table></div>}

      {items.length > 0 && audit && <div className="table-wrap log-table"><table>
        <thead><tr><th aria-label="Detalhes" /><th>Data e hora</th><th>Ação</th><th>Registro</th><th>Feito por</th></tr></thead>
        <tbody>{items.map((item) => {
          const expanded = openRow === item.uid;
          const details = item.details ?? {};
          const before = (details as { before?: unknown }).before;
          const after = (details as { after?: unknown }).after;
          const hasDiff = before !== undefined || after !== undefined;
          return <Fragment key={item.uid}>
            <tr className={expanded ? "log-row is-open" : "log-row"}>
              <td><ToggleButton expanded={expanded} onClick={() => setOpenRow(expanded ? null : item.uid)} /></td>
              <td>{formatDate(item.occurred_at)}</td>
              <td><strong>{auditActionLabel[item.action ?? ""] ?? item.action ?? "—"}</strong></td>
              <td><strong>{auditCategoryLabel[item.category] ?? item.category}</strong>{item.category !== "avaliacoes" && <small>{item.message}</small>}</td>
              <td>{item.actor_name ?? (item.actor_id ? "Usuário removido" : "Sistema")}</td>
            </tr>
            {expanded && <tr className="log-details-row"><td colSpan={5}>
              <dl className="log-details">
                {hasDiff ? <>
                  {before !== undefined && before !== null && <><dt>Antes</dt><dd><pre>{JSON.stringify(before, null, 2)}</pre></dd></>}
                  {after !== undefined && after !== null && <><dt>Depois</dt><dd><pre>{JSON.stringify(after, null, 2)}</pre></dd></>}
                </> : <><dt>Dados</dt><dd><pre>{JSON.stringify(details, null, 2)}</pre></dd></>}
              </dl>
            </td></tr>}
          </Fragment>;
        })}</tbody>
      </table></div>}

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

function ToggleButton({ expanded, onClick }: { expanded: boolean; onClick: () => void }) {
  return <button type="button" className="text-button" aria-expanded={expanded} aria-label={expanded ? "Ocultar detalhes" : "Ver detalhes"} onClick={onClick}>{expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button>;
}
