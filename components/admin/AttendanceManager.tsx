"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, RefreshCw, Save } from "lucide-react";
import Select from "@/components/ui/Select";
import type { Activity, AttendanceResponse } from "@/lib/types";

type Member = { id: string; full_name: string; nickname: string; status: string; presences: number; absences: number };
type Entry = { activity_id: string; response: AttendanceResponse; guest_count: number; note: string | null };
type History = { activities: Pick<Activity, "id" | "title" | "starts_at" | "status" | "attendance_open">[]; attendance: Entry[] };
type Correction = { memberId: string; activityId: string; response: AttendanceResponse | null; guest_count: number; note: string };

async function readJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Não foi possível carregar os dados.");
  return data as T;
}

export default function AttendanceManager() {
  const client = useQueryClient();
  const [memberId, setMemberId] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Correction | null>(null);
  const [notice, setNotice] = useState("");
  const editorRef = useRef<HTMLFormElement>(null);
  const editingActivityId = editing?.activityId;
  useEffect(() => {
    if (editingActivityId) editorRef.current?.scrollIntoView({ block: "center" });
  }, [editingActivityId]);
  const membersQuery = useQuery({ queryKey: ["admin-attendance-members"], gcTime: 0, queryFn: ({ signal }) => readJson<{ members: Member[] }>("/api/admin/attendance", signal) });
  const history = useQuery({ queryKey: ["admin-attendance", memberId], gcTime: 0, enabled: Boolean(memberId), queryFn: ({ signal }) => readJson<History>(`/api/admin/attendance?memberId=${memberId}`, signal) });
  const mutation = useMutation({
    mutationFn: async (correction: Correction) => {
      const response = await fetch("/api/admin/attendance", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(correction) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar a correção.");
    },
    onMutate: () => setNotice(""),
    onSuccess: async (_, correction) => {
      setEditing(null);
      setNotice(correction.response === null ? "Resposta removida. O membro ficou sem resposta nesta atividade." : "Presença corrigida.");
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin-attendance", correction.memberId] }),
        client.invalidateQueries({ queryKey: ["admin-attendance-members"] }),
        client.invalidateQueries({ queryKey: ["attendance"] }),
      ]);
    },
    onError: (error: Error) => setNotice(error.message),
  });
  const members = (membersQuery.data?.members ?? []).filter((member) => `${member.nickname} ${member.full_name}`.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR"))).sort((a, b) => a.nickname.localeCompare(b.nickname, "pt-BR") || a.full_name.localeCompare(b.full_name, "pt-BR") || a.id.localeCompare(b.id));
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(members.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageMembers = members.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const selectedMember = membersQuery.data?.members.find((member) => member.id === memberId);
  const entries = new Map(history.data?.attendance.map((entry) => [entry.activity_id, entry]));
  const activities = history.data?.activities ?? [];
  const positive = activities.filter((activity) => entries.get(activity.id)?.response === "vai").length;
  const negative = activities.filter((activity) => entries.get(activity.id)?.response === "nao_vai").length;

  return <section>
    <div className="admin-title"><div><h2>Presenças</h2><p>Consulte o histórico de um membro e corrija suas respostas, inclusive em listas encerradas.</p></div></div>
    {!memberId ? <div className="admin-form">
      <div className="field"><label htmlFor="attendance-search">Buscar membro</label><input id="attendance-search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Nome ou apelido" /></div>
      {membersQuery.isPending && <p role="status">Carregando membros…</p>}
      {membersQuery.isError && <p role="alert">{membersQuery.error.message} <button className="text-button" onClick={() => void membersQuery.refetch()}>Tentar novamente</button></p>}
      {!membersQuery.isPending && !membersQuery.isError && !members.length && <p>Nenhum membro encontrado.</p>}
      {members.length > 0 && <>
        <p className="attendance-admin-help">Presenças e ausências correspondem às respostas “Vou” e “Não vou” em todas as atividades, inclusive futuras e canceladas. Convidados não entram nos totais.</p>
        <div className="table-wrap attendance-member-list"><table><thead><tr><th>Membro</th><th>Situação</th><th>Presenças</th><th>Ausências</th><th>Ação</th></tr></thead><tbody>
          {pageMembers.map((member) => <tr key={member.id}><td><strong>{member.nickname}</strong><small>{member.full_name}</small></td><td><span className={`badge ${member.status}`}>{member.status}</span></td><td>{member.presences}</td><td>{member.absences}</td><td className="row-actions"><button type="button" title="Corrigir presença" aria-label={`Corrigir presença de ${member.nickname}`} onClick={() => { setMemberId(member.id); setEditing(null); setNotice(""); }}><Edit3 size={16} aria-hidden="true" /></button></td></tr>)}
        </tbody></table></div>
        <nav className="attendance-pagination" aria-label="Páginas de membros">
          <span role="status">{(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, members.length)} de {members.length} membros · Página {currentPage} de {pageCount}</span>
          <div><button className="button button-ghost" disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</button><button className="button button-ghost" disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>Próxima</button></div>
        </nav>
      </>}
    </div> : <div className="admin-title attendance-selected-member"><div><h3>{selectedMember?.nickname}</h3><p>{selectedMember?.full_name}</p></div><button className="button button-ghost" disabled={mutation.isPending} onClick={() => { setMemberId(""); setEditing(null); setNotice(""); }}>Voltar aos membros</button></div>}
    {notice && <p className={`form-message ${mutation.isError ? "error" : "success"}`} role="status">{notice}</p>}
    {memberId && history.isPending && <p role="status">Carregando histórico…</p>}
    {memberId && history.isError && <p role="alert">{history.error.message} <button className="text-button" onClick={() => void history.refetch()}>Tentar novamente</button></p>}
    {memberId && history.data && <>
      <div className="metric-grid attendance-metrics">
        <article className="metric-card"><strong>{positive}</strong><span>Presenças confirmadas · Vou</span></article>
        <article className="metric-card"><strong>{negative}</strong><span>Ausências informadas · Não vou</span></article>
        <article className="metric-card"><strong>{activities.length - positive - negative}</strong><span>Atividades sem resposta</span></article>
      </div>
      <p className="attendance-admin-help">Totais de todas as atividades cadastradas, passadas e futuras, incluindo canceladas. As respostas indicam intenção de participar, não comprovam comparecimento. Convidados não entram nos totais.</p>
      <button className="button button-ghost" disabled={history.isFetching || mutation.isPending} onClick={() => void history.refetch()}><RefreshCw size={17} /> {history.isFetching ? "Atualizando…" : "Atualizar histórico"}</button>
      {editing && <form ref={editorRef} className="admin-form attendance-correction" onSubmit={(event) => { event.preventDefault(); if (!mutation.isPending) mutation.mutate(editing); }}>
        <h3>Corrigir: {activities.find((activity) => activity.id === editing.activityId)?.title}</h3>
        <fieldset disabled={mutation.isPending}>
          <div className="form-grid">
            <div className="field"><label htmlFor="attendance-response">Resposta</label><Select id="attendance-response" value={editing.response ?? "none"} options={[{ value: "vai", label: "Vou" }, { value: "nao_vai", label: "Não vou" }, { value: "none", label: "Sem resposta (remover registro)" }]} onChange={(value) => setEditing({ ...editing, response: value === "none" ? null : value as AttendanceResponse })} /></div>
            <div className="field"><label htmlFor="attendance-guests">Convidados</label><input id="attendance-guests" type="number" min={0} max={30} required disabled={editing.response !== "vai"} value={editing.guest_count} onChange={(event) => setEditing({ ...editing, guest_count: Number(event.target.value) })} /></div>
            <div className="field field-full"><label htmlFor="attendance-note">Observação pública</label><input id="attendance-note" maxLength={180} disabled={editing.response === null} value={editing.note} onChange={(event) => setEditing({ ...editing, note: event.target.value })} /></div>
          </div>
          <div className="form-actions"><button className="button button-primary" type="submit"><Save size={17} /> {mutation.isPending ? "Salvando…" : "Salvar correção"}</button><button className="button button-ghost" type="button" onClick={() => setEditing(null)}>Cancelar</button></div>
        </fieldset>
      </form>}
      {activities.length ? <div className="table-wrap attendance-history"><table><thead><tr><th>Atividade</th><th>Data</th><th>Situação</th><th>Resposta</th><th>Convidados</th><th>Ação</th></tr></thead><tbody>
        {activities.map((activity) => { const entry = entries.get(activity.id); return <tr key={activity.id}>
          <td><strong>{activity.title}</strong>{entry?.note && <small>{entry.note}</small>}</td>
          <td>{new Date(activity.starts_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</td>
          <td>{activity.status.replace("_", " ")}<small>Lista {activity.attendance_open ? "aberta" : "fechada"}</small></td>
          <td>{entry?.response === "vai" ? "Vou" : entry?.response === "nao_vai" ? "Não vou" : "Sem resposta"}</td><td>{entry?.guest_count ?? 0}</td>
          <td className="row-actions"><button type="button" title="Corrigir presença" aria-label={`Corrigir presença em ${activity.title}`} disabled={mutation.isPending} onClick={() => { setNotice(""); setEditing({ memberId, activityId: activity.id, response: entry?.response ?? "vai", guest_count: entry?.guest_count ?? 0, note: entry?.note ?? "" }); }}><Edit3 size={16} aria-hidden="true" /></button></td>
        </tr>; })}
      </tbody></table></div> : <p className="empty-state">Nenhuma atividade cadastrada.</p>}
    </>}
  </section>;
}
