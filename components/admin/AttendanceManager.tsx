"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit3, RefreshCw, Save } from "lucide-react";
import Select from "@/components/ui/Select";
import { apiFetch, jsonApiFetch } from "@/lib/api-client";
import type { Activity, ActualAttendanceStatus, AttendanceResponse } from "@/lib/types";

type Member = { id: string; full_name: string; nickname: string; status: string; presences: number; absences: number; justified: number; intends_to_go: number; intends_not_to_go: number };
type Entry = { activity_id: string; response: AttendanceResponse; guest_count: number; note: string | null };
type Presence = { activity_id: string; actual_status: ActualAttendanceStatus; guest_count: number; note: string | null; validated_by: string | null; validated_at: string };
type History = { activities: Pick<Activity, "id" | "title" | "starts_at" | "status" | "attendance_open">[]; attendance: Entry[]; presence: Presence[] };
type Correction = { memberId: string; activityId: string; response: AttendanceResponse | null; guest_count: number; note: string; actual_status: ActualAttendanceStatus | null; actual_guest_count: number; validation_note: string };

async function readJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await apiFetch(url, { signal });
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
      const response = await jsonApiFetch("/api/admin/attendance", correction, { method: "PATCH" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar a correção.");
    },
    onMutate: () => setNotice(""),
    onSuccess: async (_, correction) => {
      setEditing(null);
      setNotice("Registro de intenção e comparecimento atualizado.");
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
  const presence = new Map(history.data?.presence.map((entry) => [entry.activity_id, entry]));
  const activities = history.data?.activities ?? [];
  const positive = activities.filter((activity) => entries.get(activity.id)?.response === "vai").length;
  const negative = activities.filter((activity) => entries.get(activity.id)?.response === "nao_vai").length;
  const attended = activities.filter((activity) => presence.get(activity.id)?.actual_status === "presente").length;
  const missed = activities.filter((activity) => presence.get(activity.id)?.actual_status === "ausente").length;
  const justified = activities.filter((activity) => presence.get(activity.id)?.actual_status === "justificado").length;

  return <section>
    <div className="admin-title"><div><h2>Presenças</h2></div></div>
    {!memberId ? <div className="admin-form">
      <div className="field"><label htmlFor="attendance-search">Buscar membro</label><input id="attendance-search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Nome ou apelido" /></div>
      {membersQuery.isPending && <p role="status">Carregando membros…</p>}
      {membersQuery.isError && <p role="alert">{membersQuery.error.message} <button className="text-button" onClick={() => void membersQuery.refetch()}>Tentar novamente</button></p>}
      {!membersQuery.isPending && !membersQuery.isError && !members.length && <p>Nenhum membro encontrado.</p>}
      {members.length > 0 && <>
                <div className="table-wrap attendance-member-list"><table><thead><tr><th>Membro</th><th>Situação</th><th>Marcou “Vou”</th><th>Comparecimentos</th><th>Ausências</th><th>Justificadas</th><th>Ação</th></tr></thead><tbody>
          {pageMembers.map((member) => <tr key={member.id}><td><strong>{member.nickname}</strong><small>{member.full_name}</small></td><td><span className={`badge ${member.status}`}>{member.status === "aprovado" ? "Aprovado" : member.status === "pendente" ? "Pendente" : member.status === "suspenso" ? "Suspenso" : member.status}</span></td><td>{member.intends_to_go}</td><td>{member.presences}</td><td>{member.absences}</td><td>{member.justified}</td><td className="row-actions"><button type="button" title="Corrigir presença" aria-label={`Corrigir presença de ${member.nickname}`} onClick={() => { setMemberId(member.id); setEditing(null); setNotice(""); }}><Edit3 size={16} aria-hidden="true" /></button></td></tr>)}
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
        <article className="metric-card"><strong>{positive}</strong><span>Vou</span></article>
        <article className="metric-card"><strong>{negative}</strong><span>Não vou</span></article>
        <article className="metric-card"><strong>{attended}</strong><span>Comparecimentos validados</span></article>
        <article className="metric-card"><strong>{missed}</strong><span>Ausências validadas</span></article>
        <article className="metric-card"><strong>{justified}</strong><span>Ausências justificadas</span></article>
      </div>
      <p className="attendance-admin-help">As respostas indicam intenção de participar e não comprovam comparecimento. Convidados não entram nos totais.</p>
      <button className="button button-ghost" disabled={history.isFetching || mutation.isPending} onClick={() => void history.refetch()}><RefreshCw size={17} /> {history.isFetching ? "Atualizando…" : "Atualizar histórico"}</button>
      {editing && <form ref={editorRef} className="admin-form attendance-correction" onSubmit={(event) => { event.preventDefault(); if (!mutation.isPending) mutation.mutate(editing); }}>
        <h3>Corrigir: {activities.find((activity) => activity.id === editing.activityId)?.title}</h3>
        <fieldset disabled={mutation.isPending}>
          <div className="form-grid">
            <div className="field"><label htmlFor="attendance-response">Resposta</label><Select id="attendance-response" value={editing.response ?? "none"} options={[{ value: "vai", label: "Vou" }, { value: "nao_vai", label: "Não vou" }, { value: "none", label: "Sem resposta" }]} onChange={(value) => setEditing({ ...editing, response: value === "none" ? null : value as AttendanceResponse })} /></div>
            <div className="field"><label htmlFor="attendance-guests">Convidados</label><input id="attendance-guests" type="number" min={0} max={30} required disabled={editing.response !== "vai"} value={editing.guest_count} onChange={(event) => setEditing({ ...editing, guest_count: Number(event.target.value) })} /></div>
            <div className="field field-full"><label htmlFor="attendance-note">Observação pública</label><input id="attendance-note" maxLength={180} disabled={editing.response === null} value={editing.note} onChange={(event) => setEditing({ ...editing, note: event.target.value })} /></div>
            <div className="field"><label htmlFor="actual-attendance">Comparecimento real</label><Select id="actual-attendance" value={editing.actual_status ?? "none"} options={[{ value: "none", label: "Ainda não validado" }, { value: "presente", label: "Compareceu" }, { value: "ausente", label: "Não compareceu" }, { value: "justificado", label: "Ausência justificada" }]} onChange={(value) => setEditing({ ...editing, actual_status: value === "none" ? null : value as ActualAttendanceStatus })} /></div>
            <div className="field"><label htmlFor="actual-guests">Convidados que compareceram</label><input id="actual-guests" type="number" min={0} max={30} required disabled={editing.actual_status !== "presente"} value={editing.actual_guest_count} onChange={(event) => setEditing({ ...editing, actual_guest_count: Number(event.target.value) })} /></div>
            <div className="field field-full"><label htmlFor="validation-note">Observação administrativa</label><input id="validation-note" maxLength={180} disabled={editing.actual_status === null} value={editing.validation_note} onChange={(event) => setEditing({ ...editing, validation_note: event.target.value })} /></div>
          </div>
          <div className="form-actions"><button className="button button-primary" type="submit"><Save size={17} /> {mutation.isPending ? "Salvando…" : "Salvar correção"}</button><button className="button button-ghost" type="button" onClick={() => setEditing(null)}>Cancelar</button></div>
        </fieldset>
      </form>}
      {activities.length ? <div className="table-wrap attendance-history"><table><thead><tr><th>Atividade</th><th>Data</th><th>Situação</th><th>Intenção</th><th>Presença real</th><th>Convidados previstos</th><th>Convidados presentes</th><th>Ação</th></tr></thead><tbody>
        {activities.map((activity) => { const entry = entries.get(activity.id); const actual = presence.get(activity.id); return <tr key={activity.id}>
          <td><strong>{activity.title}</strong>{entry?.note && <small>Intenção: {entry.note}</small>}{actual?.note && <small>Validação: {actual.note}</small>}</td>
          <td>{new Date(activity.starts_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</td>
          <td>{activity.status === "a_definir" ? "A definir" : activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}<small>Lista {activity.attendance_open ? "aberta" : "fechada"}</small></td>
          <td>{entry?.response === "vai" ? "Vou" : entry?.response === "nao_vai" ? "Não vou" : "Sem resposta"}</td><td>{actual?.actual_status === "presente" ? "Compareceu" : actual?.actual_status === "ausente" ? "Não compareceu" : actual?.actual_status === "justificado" ? "Justificada" : "Não validada"}{actual?.validated_at && <small>{new Date(actual.validated_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}</small>}</td><td>{entry?.response === "vai" ? entry.guest_count : 0}</td><td>{actual?.actual_status === "presente" ? actual.guest_count : 0}</td>
          <td className="row-actions"><button type="button" title="Corrigir presença" aria-label={`Corrigir presença em ${activity.title}`} disabled={mutation.isPending} onClick={() => { setNotice(""); setEditing({ memberId, activityId: activity.id, response: entry?.response ?? null, guest_count: entry?.guest_count ?? 0, note: entry?.note ?? "", actual_status: actual?.actual_status ?? null, actual_guest_count: actual?.guest_count ?? 0, validation_note: actual?.note ?? "" }); }}><Edit3 size={16} aria-hidden="true" /></button></td>
        </tr>; })}
      </tbody></table></div> : <p className="empty-state">Nenhuma atividade cadastrada.</p>}
    </>}
  </section>;
}
