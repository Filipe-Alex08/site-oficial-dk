"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, CircleHelp, Edit3, RefreshCw, Save, UserRound, XCircle } from "lucide-react";
import AdminTitle from "@/components/admin/AdminTitle";
import { useToast } from "@/components/admin/ToastProvider";
import { useRealtimeTables } from "@/components/RealtimeProvider";
import DataTable from "@/components/admin/ui/DataTable";
import Panel from "@/components/admin/ui/Panel";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { SearchField } from "@/components/admin/ui/Toolbar";
import Select from "@/components/ui/Select";
import type { Activity, AttendanceResponse } from "@/lib/types";

type Member = { id: string; nickname: string; status: string; presences: number; absences: number };
type Entry = { activity_id: string; response: AttendanceResponse; guest_count: number; note: string | null };
type ActivityRow = Pick<Activity, "id" | "title" | "starts_at" | "status" | "attendance_open">;
type History = { activities: ActivityRow[]; attendance: Entry[] };
type Correction = { memberId: string; activityId: string; response: AttendanceResponse | null; guest_count: number; note: string };

async function readJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, cache: "no-store" });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Não foi possível carregar os dados.");
  return data as T;
}

const TIME_ZONE = "America/Sao_Paulo";

export default function AttendanceManager() {
  const client = useQueryClient();
  const toast = useToast();
  const [memberId, setMemberId] = useState("");
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Correction | null>(null);
  const membersQuery = useQuery({ queryKey: ["admin-attendance-members"], gcTime: 0, queryFn: ({ signal }) => readJson<{ members: Member[] }>("/api/admin/attendance", signal) });
  const history = useQuery({ queryKey: ["admin-attendance", memberId], gcTime: 0, enabled: Boolean(memberId), queryFn: ({ signal }) => readJson<History>(`/api/admin/attendance?memberId=${memberId}`, signal) });
  const mutation = useMutation({
    mutationFn: async (correction: Correction) => {
      const response = await fetch("/api/admin/attendance", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(correction) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar a correção.");
    },
    onSuccess: async (_, correction) => {
      setEditing(null);
      toast.success(correction.response === null ? "Resposta removida." : "Presença corrigida.");
      await Promise.all([
        client.invalidateQueries({ queryKey: ["admin-attendance", correction.memberId] }),
        client.invalidateQueries({ queryKey: ["admin-attendance-members"] }),
        client.invalidateQueries({ queryKey: ["attendance"] }),
      ]);
    },
    onError: (error: Error) => toast.error(error.message),
  });
  // Alguém respondeu presença ou uma atividade mudou: recarrega a lista e o histórico aberto.
  useRealtimeTables(["activity_attendance", "activities", "profiles"], () => {
    void client.invalidateQueries({ queryKey: ["admin-attendance-members"] });
    void client.invalidateQueries({ queryKey: ["admin-attendance"] });
  });

  const term = search.trim().toLocaleLowerCase("pt-BR");
  const members = (membersQuery.data?.members ?? [])
    .filter((member) => member.nickname.toLocaleLowerCase("pt-BR").includes(term))
    .sort((a, b) => a.nickname.localeCompare(b.nickname, "pt-BR") || a.id.localeCompare(b.id));
  const selectedMember = membersQuery.data?.members.find((member) => member.id === memberId);
  const entries = new Map(history.data?.attendance.map((entry) => [entry.activity_id, entry]));
  const activities = history.data?.activities ?? [];
  const positive = activities.filter((activity) => entries.get(activity.id)?.response === "vai").length;
  const negative = activities.filter((activity) => entries.get(activity.id)?.response === "nao_vai").length;

  function pick(id: string) {
    setMemberId(id);
    setEditing(null);
  }

  function startEdit(activity: ActivityRow) {
    const entry = entries.get(activity.id);
    setEditing({ memberId, activityId: activity.id, response: entry?.response ?? "vai", guest_count: entry?.guest_count ?? 0, note: entry?.note ?? "" });
  }

  return <section>
    <AdminTitle eyebrow="Pessoas" title="Presenças" description="Consulte e corrija as respostas de presença de cada membro." />
    <div className="attendance-layout">
      <Panel title="Membros" description="Escolha um membro para ver o histórico." flush>
        <div className="attendance-search"><SearchField value={search} onChange={setSearch} placeholder="Buscar por apelido" label="Buscar membro" /></div>
        {membersQuery.isPending && <p className="table-empty" role="status">Carregando membros…</p>}
        {membersQuery.isError && <p className="table-empty" role="alert">{membersQuery.error.message} <button className="text-button" type="button" onClick={() => void membersQuery.refetch()}>Tentar novamente</button></p>}
        {!membersQuery.isPending && !membersQuery.isError && !members.length && <p className="table-empty">Nenhum membro encontrado.</p>}
        {members.length > 0 && <ul className="attendance-pick">{members.map((member) => <li key={member.id}>
          <button type="button" className={member.id === memberId ? "is-active" : ""} aria-pressed={member.id === memberId} onClick={() => pick(member.id)}>
            <span className="attendance-pick-text"><strong>{member.nickname}</strong><small>{member.presences} {member.presences === 1 ? "presença" : "presenças"} · {member.absences} {member.absences === 1 ? "ausência" : "ausências"}</small></span>
            <StatusBadge status={member.status} />
          </button>
        </li>)}</ul>}
      </Panel>

      <div className="attendance-detail">
        {!memberId && <div className="attendance-empty-detail"><UserRound aria-hidden="true" /><strong>Nenhum membro selecionado</strong><span>Escolha alguém na lista para ver e corrigir as respostas.</span></div>}
        {memberId && <>
          <Panel
            title={selectedMember?.nickname ?? "Membro"}
            description="As respostas indicam intenção de participar e não comprovam comparecimento. Convidados não entram nos totais."
            actions={<button className="button button-ghost button-small" type="button" disabled={history.isFetching || mutation.isPending} onClick={() => void history.refetch()}><RefreshCw size={16} className={history.isFetching ? "spin" : ""} /> {history.isFetching ? "Atualizando…" : "Atualizar"}</button>}
          >
            {history.isPending && <p role="status">Carregando histórico…</p>}
            {history.isError && <p role="alert">{history.error.message} <button className="text-button" type="button" onClick={() => void history.refetch()}>Tentar novamente</button></p>}
            {history.data && <div className="kpi-strip">
              <div className="kpi"><span className="kpi-label"><span aria-hidden="true"><CheckCircle2 /></span>Vou</span><strong>{positive}</strong></div>
              <div className="kpi"><span className="kpi-label"><span aria-hidden="true"><XCircle /></span>Não vou</span><strong>{negative}</strong></div>
              <div className="kpi"><span className="kpi-label"><span aria-hidden="true"><CircleHelp /></span>Sem resposta</span><strong>{activities.length - positive - negative}</strong></div>
            </div>}
          </Panel>

          {history.data && <Panel title="Histórico" description={`${activities.length} ${activities.length === 1 ? "atividade" : "atividades"}`} flush>
            <DataTable
              rows={activities}
              rowKey={(activity) => activity.id}
              empty="Nenhuma atividade cadastrada."
              caption="Respostas de presença por atividade"
              columns={[
                { key: "activity", header: "Atividade", hideLabel: true, render: (activity) => <><strong>{activity.title}</strong>{entries.get(activity.id)?.note && <small>{entries.get(activity.id)?.note}</small>}</> },
                { key: "date", header: "Data", render: (activity) => new Date(activity.starts_at).toLocaleString("pt-BR", { timeZone: TIME_ZONE }) },
                { key: "status", header: "Situação", render: (activity) => <><StatusBadge status={activity.status} /><small>Lista {activity.attendance_open ? "aberta" : "fechada"}</small></> },
                {
                  key: "response", header: "Resposta",
                  render: (activity) => {
                    const response = entries.get(activity.id)?.response;
                    return response === "vai" ? <StatusBadge status="aprovado" label="Vou" /> : response === "nao_vai" ? <StatusBadge status="suspenso" label="Não vou" /> : <span className="muted-text">Sem resposta</span>;
                  },
                },
                { key: "guests", header: "Convidados", render: (activity) => entries.get(activity.id)?.guest_count ?? 0 },
                {
                  key: "actions", header: "Ação", srOnlyHeader: true, className: "row-actions",
                  render: (activity) => <button type="button" title="Corrigir presença" aria-label={`Corrigir presença em ${activity.title}`} disabled={mutation.isPending} onClick={() => startEdit(activity)}><Edit3 size={16} aria-hidden="true" /></button>,
                },
              ]}
              rowClassName={(activity) => editing?.activityId === activity.id ? "is-selected" : undefined}
              rowExtra={(activity, columnCount) => editing?.activityId === activity.id
                ? <tr className="attendance-edit-row"><td colSpan={columnCount}>
                  <form onSubmit={(event) => { event.preventDefault(); if (!mutation.isPending) mutation.mutate(editing); }}>
                    <fieldset disabled={mutation.isPending} className="attendance-fieldset">
                      <legend className="attendance-legend">Corrigir: {activity.title}</legend>
                      <div className="attendance-inline">
                        <div className="field"><label htmlFor="attendance-response">Resposta</label><Select id="attendance-response" value={editing.response ?? "none"} options={[{ value: "vai", label: "Vou" }, { value: "nao_vai", label: "Não vou" }, { value: "none", label: "Sem resposta" }]} onChange={(value) => setEditing({ ...editing, response: value === "none" ? null : value as AttendanceResponse })} /></div>
                        <div className="field"><label htmlFor="attendance-guests">Convidados</label><input id="attendance-guests" type="number" min={0} max={30} required disabled={editing.response !== "vai"} value={editing.guest_count} onChange={(event) => setEditing({ ...editing, guest_count: Number(event.target.value) })} /></div>
                        <div className="field is-full"><label htmlFor="attendance-note">Observação pública<span className="opt">opcional</span></label><input id="attendance-note" maxLength={180} disabled={editing.response === null} value={editing.note} onChange={(event) => setEditing({ ...editing, note: event.target.value })} /></div>
                      </div>
                      <div className="form-actions"><button className="button button-primary" type="submit"><Save size={17} /> {mutation.isPending ? "Salvando…" : "Salvar correção"}</button><button className="button button-ghost" type="button" onClick={() => setEditing(null)}>Cancelar</button></div>
                    </fieldset>
                  </form>
                </td></tr>
                : null}
            />
          </Panel>}
        </>}
      </div>
    </div>
  </section>;
}
