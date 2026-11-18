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
  { value: "", label: "Todas as origens" },
  { value: "evento", label: "Eventos do site" },
  { value: "servidor", label: "Servidor" },
  { value: "auditoria", label: "Auditoria" },
];
const categoryOptions = [
  { value: "", label: "Todas as categorias" },
  { value: "auth", label: "Login" },
  { value: "cadastro", label: "Cadastro" },
  { value: "conta", label: "Conta" },
  { value: "permissao", label: "Permissões" },
  { value: "request", label: "Erros de requisição" },
  { value: "console", label: "Console do servidor" },
  { value: "avaliacoes", label: "Avaliações" },
  { value: "user_admin_roles", label: "Cargos (auditoria)" },
  { value: "invites", label: "Convites (auditoria)" },
  { value: "log_viewer_permissions", label: "Ver logs (auditoria)" },
];
// Reaproveita as cores de selo que já existem no painel.
const levelBadge: Record<LogItem["level"], string> = { info: "aprovado", aviso: "pendente", erro: "suspenso" };
const levelLabel: Record<LogItem["level"], string> = { info: "Info", aviso: "Aviso", erro: "Erro" };
const sourceLabel: Record<LogItem["source"], string> = { evento: "Evento", servidor: "Servidor", auditoria: "Auditoria" };
const actionLabel: Record<string, string> = { INSERT: "Criado", UPDATE: "Alterado", DELETE: "Removido" };

async function readLogs(params: URLSearchParams, signal?: AbortSignal): Promise<LogPage> {
  const response = await fetch(`/api/admin/logs?${params}`, { signal, cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Não foi possível carregar os logs.");
  return data as LogPage;
}

export default function LogsViewer() {
  const [period, setPeriod] = useState("7d");
  const [level, setLevel] = useState("");
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [auto, setAuto] = useState(false);
  const [openRow, setOpenRow] = useState<string | null>(null);

  // Espera o fim da digitação antes de consultar o servidor.
  useEffect(() => {
    const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(0); }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  const params = new URLSearchParams({ periodo: period, pagina: String(page) });
  if (level) params.set("nivel", level);
  if (source) params.set("origem", source);
  if (category) params.set("categoria", category);
  if (search) params.set("busca", search);

  const query = useQuery({
    queryKey: ["admin-logs", period, level, source, category, search, page],
    queryFn: ({ signal }) => readLogs(params, signal),
    placeholderData: keepPreviousData,
    refetchInterval: auto ? 30_000 : false,
    gcTime: 0,
  });

  const items = query.data?.items ?? [];
  function change(setter: (value: string) => void) {
    return (value: string) => { setter(value); setPage(0); setOpenRow(null); };
  }

  return <section>
    <div className="admin-title"><div><h2>Logs</h2><p>Registros dos últimos 7 dias. Logs com mais de 7 dias são apagados automaticamente.</p></div></div>
    <div className="admin-form">
      <div className="form-grid">
        <div className="field"><label htmlFor="log-period">Período</label><Select id="log-period" value={period} options={periodOptions} onChange={change(setPeriod)} /></div>
        <div className="field"><label htmlFor="log-level">Nível</label><Select id="log-level" value={level} options={levelOptions} onChange={change(setLevel)} /></div>
        <div className="field"><label htmlFor="log-source">Origem</label><Select id="log-source" value={source} options={sourceOptions} onChange={change(setSource)} /></div>
        <div className="field"><label htmlFor="log-category">Categoria</label><Select id="log-category" value={category} options={categoryOptions} onChange={change(setCategory)} /></div>
        <div className="field field-full"><label htmlFor="log-search">Buscar</label><input id="log-search" value={searchInput} maxLength={80} onChange={(event) => setSearchInput(event.target.value)} placeholder="Mensagem, ação ou caminho" /></div>
      </div>
      <div className="form-actions">
        <button className="button button-ghost" type="button" disabled={query.isFetching} onClick={() => void query.refetch()}><RefreshCw size={17} /> {query.isFetching ? "Atualizando…" : "Atualizar"}</button>
        <label className="check-field"><input type="checkbox" checked={auto} onChange={(event) => setAuto(event.target.checked)} /> Atualizar a cada 30 s</label>
      </div>
    </div>

    {query.isPending && <p role="status">Carregando logs…</p>}
    {query.isError && <p role="alert">{query.error.message} <button className="text-button" onClick={() => void query.refetch()}>Tentar novamente</button></p>}
    {query.data && !items.length && <p className="empty-state">Nenhum log encontrado para esses filtros.</p>}
    {items.length > 0 && <div className="table-wrap log-table"><table>
      <thead><tr><th aria-label="Detalhes" /><th>Data e hora</th><th>Nível</th><th>Origem</th><th>Evento</th><th>Usuário</th><th>IP</th></tr></thead>
      <tbody>{items.map((item) => {
        const expanded = openRow === item.uid;
        return <Fragment key={item.uid}>
          <tr className={expanded ? "log-row is-open" : "log-row"}>
            <td><button type="button" className="text-button" aria-expanded={expanded} aria-label={expanded ? "Ocultar detalhes" : "Ver detalhes"} onClick={() => setOpenRow(expanded ? null : item.uid)}>{expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button></td>
            <td>{new Date(item.occurred_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</td>
            <td><span className={`badge ${levelBadge[item.level]}`}>{levelLabel[item.level]}</span></td>
            <td>{sourceLabel[item.source] ?? item.source}</td>
            <td><strong>{actionLabel[item.action ?? ""] ?? item.action ?? item.category}</strong><small>{item.message}</small></td>
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

    {(page > 0 || query.data?.hasMore) && <nav className="attendance-pagination" aria-label="Páginas de logs">
      <span role="status">Página {page + 1}</span>
      <div>
        <button className="button button-ghost" disabled={page === 0 || query.isFetching} onClick={() => { setPage(page - 1); setOpenRow(null); }}>Anterior</button>
        <button className="button button-ghost" disabled={!query.data?.hasMore || query.isFetching} onClick={() => { setPage(page + 1); setOpenRow(null); }}>Próxima</button>
      </div>
    </nav>}
  </section>;
}
