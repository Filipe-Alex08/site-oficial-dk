"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarPlus, CalendarSync, Clock, Pencil, Plus, TicketPlus, Trophy, UserX } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdminData } from "@/components/admin/AdminDataContext";
import AdminTitle from "@/components/admin/AdminTitle";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import { useToast } from "@/components/admin/ToastProvider";
import TournamentForm from "@/components/admin/TournamentForm";
import TournamentMatchDialog from "@/components/admin/TournamentMatchDialog";
import DataTable from "@/components/admin/ui/DataTable";
import Panel from "@/components/admin/ui/Panel";
import RowMenu from "@/components/admin/ui/RowMenu";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import { SearchField, Toolbar } from "@/components/admin/ui/Toolbar";
import TournamentBoard, { formatTournamentDate, tournamentMatchName, TournamentStatusBadge } from "@/components/TournamentBoard";
import Select from "@/components/ui/Select";
import { apiFetch, jsonApiFetch } from "@/lib/api-client";
import {
  isAcceptingInvites, isTournamentActivityAvailable, isUpcomingTournamentActivity, tournamentFormatLabels, tournamentMatchIsReady, tournamentStatusLabels,
  type TournamentAdminAction, type TournamentMatch, type TournamentMember, type TournamentRecord, type TournamentSettings, type TournamentSummary,
} from "@/lib/tournaments";

const endpoint = "/api/admin/tournaments";
type Detail = { tournament: TournamentRecord; members: TournamentMember[] };
type Action = TournamentAdminAction | { action: "create"; settings: TournamentSettings };

async function readResponse<T>(response: Response): Promise<T> {
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || "Não foi possível acessar os torneios.");
  return body as T;
}

export default function TournamentSection({ active }: { active: boolean }) {
  const { currentUserId, activities, setSection } = useAdminData();
  const queryClient = useQueryClient();
  const toast = useToast();
  const confirm = useConfirm();
  const [selection, setSelection] = useState("");
  const [form, setForm] = useState<"create" | "settings" | null>(null);
  // Trocar a chave descarta o rascunho do torneio novo (ao cancelar ou depois de criar).
  const [draft, setDraft] = useState(0);
  const [calendarId, setCalendarId] = useState("");
  const [matchDialog, setMatchDialog] = useState<{ id: string; mode: "schedule" | "result"; basis: string } | null>(null);
  // Retrato do que estava na tela ao abrir a edição: a consulta se atualiza sozinha
  // e a revisão enviada passa a ser a nova, mas os campos continuam os antigos.
  const [settingsBasis, setSettingsBasis] = useState("");
  const key = ["admin-tournaments", currentUserId];
  const list = useQuery({
    queryKey: key, enabled: active,
    queryFn: async ({ signal }) => readResponse<{ tournaments: TournamentSummary[] }>(await apiFetch(endpoint, { signal })),
  });
  const choices = list.data?.tournaments ?? [];
  const selectedId = selection || choices[0]?.id || "";
  const detailKey = [...key, selectedId];
  const detail = useQuery({
    queryKey: detailKey, enabled: active && Boolean(selectedId),
    queryFn: async ({ signal }) => readResponse<Detail>(await apiFetch(`${endpoint}?id=${selectedId}`, { signal })),
    refetchInterval: active ? 30_000 : false,
  });
  const record = detail.data?.tournament;
  const state = record?.state;
  const { options, upcomingOptions } = useMemo(() => {
    const entries = activities.filter(isTournamentActivityAvailable).map((activity) => {
      const upcoming = isUpcomingTournamentActivity(activity);
      const label = `${activity.title} · ${formatTournamentDate(activity.starts_at)}${upcoming ? "" : " · já realizada"}`;
      return { value: activity.id, label, upcoming };
    });
    return { options: entries, upcomingOptions: entries.filter((entry) => entry.upcoming) };
  }, [activities]);
  const settingsOptions = options.filter((option) => option.upcoming || option.value === state?.settings.firstActivityId);

  const mutation = useMutation({
    mutationFn: async (action: Action) => {
      if (action.action === "create") {
        return readResponse<{ tournament: TournamentRecord; message: string }>(await jsonApiFetch(endpoint, action.settings));
      }
      if (!record) throw new Error("Selecione o torneio.");
      return readResponse<{ tournament: TournamentRecord; message: string }>(
        await jsonApiFetch(endpoint, { ...action, id: record.id, revision: record.revision }, { method: "PATCH" }),
      );
    },
    onSuccess: async ({ tournament, message }, action) => {
      queryClient.setQueryData<Detail>([...key, tournament.id], (previous) => previous ? { ...previous, tournament } : undefined);
      setSelection(tournament.id);
      if (action.action === "create" || action.action === "settings") setForm(null);
      if (action.action === "create") setDraft((current) => current + 1);
      toast.success(message);
      await queryClient.invalidateQueries({ queryKey: key });
    },
    onError: async (error) => {
      toast.error(error.message);
      if (record) await detail.refetch();
    },
  });

  async function run(action: Action) {
    try {
      await mutation.mutateAsync(action);
      return true;
    } catch {
      return false;
    }
  }

  function changedSince(basis: string, current: unknown) {
    if (JSON.stringify(current) === basis) return false;
    toast.error("Outro ADM alterou estes dados. Cancele e abra novamente para conferir.");
    return true;
  }

  function openMatchDialog(match: TournamentMatch, mode: "schedule" | "result") {
    setMatchDialog({ id: match.id, mode, basis: JSON.stringify(match) });
  }

  async function closeRegistration() {
    if (await confirm({
      title: "Encerrar inscrições e sortear?",
      message: "O sorteio usa os inscritos aprovados e define as ligas ou a chave. Depois disso, a lista de participantes fica fechada.",
      confirmLabel: "Encerrar e sortear",
    })) void run({ action: "close" });
  }

  function matchActions(match: TournamentMatch) {
    if (!state || !tournamentMatchIsReady(state, match)) return null;
    const activity = activities.find((item) => item.id === match.activityId);
    const canRecord = activity && activity.status !== "cancelado" && activity.status !== "adiado";
    return <RowMenu label={`Ações de ${tournamentMatchName(state, match)}`} items={[
      { label: "Registrar resultado", icon: <Pencil />, hidden: !canRecord, disabled: mutation.isPending, onSelect: () => openMatchDialog(match, "result") },
      { label: match.activityId ? "Reagendar" : "Agendar", icon: match.activityId ? <CalendarSync /> : <CalendarPlus />, disabled: mutation.isPending || !options.length, onSelect: () => openMatchDialog(match, "schedule") },
      { label: "Adiar", icon: <Clock />, hidden: !match.activityId, disabled: mutation.isPending, onSelect: () => void run({ action: "postpone", matchId: match.id }) },
    ]} />;
  }

  const editingMatch = state?.matches.find((item) => item.id === matchDialog?.id);
  const busy = mutation.isPending;

  return <div>
    <AdminTitle eyebrow="Atividades" title="Torneio" action={<button className="button button-primary" type="button" onClick={() => setForm("create")} disabled={busy}><Plus aria-hidden="true" /> Novo torneio</button>} />
    {list.isPending && <p className="empty-state" role="status">Carregando torneios…</p>}
    {list.isError && <p className="empty-state" role="alert">{list.error.message} <button type="button" className="text-button" onClick={() => void list.refetch()}>Tentar novamente</button></p>}
    {list.isSuccess && choices.length === 0 && <div className="empty-state"><Trophy aria-hidden="true" /><h3>Nenhum torneio cadastrado</h3></div>}
    {choices.length > 0 && <Toolbar filters={<div className="tournament-picker">
      <label className="sr-only" htmlFor="admin-tournament-selection">Torneio</label>
      <Select id="admin-tournament-selection" value={selectedId} options={choices.map((item) => ({ value: item.id, label: `${item.title} · ${tournamentStatusLabels[item.status]}` }))}
        onChange={(id) => { setSelection(id); setForm(null); setCalendarId(""); setMatchDialog(null); }} disabled={busy} />
    </div>} />}
    {selectedId && detail.isPending && <p className="empty-state" role="status">Carregando o torneio…</p>}
    {selectedId && detail.isError && <p className="empty-state" role="alert">{detail.error.message} <button type="button" className="text-button" onClick={() => void detail.refetch()}>Tentar novamente</button></p>}
    {state && <div className="tournament-stack">
      <Panel title={state.settings.title} description={tournamentFormatLabels[state.settings.format]} flush
        actions={<>
          <TournamentStatusBadge status={state.status} />
          {isAcceptingInvites(state) && <button type="button" className="button button-ghost" onClick={() => { setSettingsBasis(JSON.stringify(state.settings)); setForm("settings"); }} disabled={busy}><Pencil aria-hidden="true" /> Editar configuração</button>}
          {state.status === "rascunho" && <button type="button" className="button button-primary" disabled={busy} onClick={() => void run({ action: "open" })}>Abrir inscrições</button>}
          {state.status === "inscricoes" && <button type="button" className="button button-primary" disabled={busy} onClick={() => void closeRegistration()}>Encerrar inscrições e sortear</button>}
        </>}>
        {state.settings.description && <p className="tournament-intro tournament-copy">{state.settings.description}</p>}
        <dl className="stat-list tournament-facts">
          <div><dt>Limite de lutas por integrante em cada atividade</dt><dd>{state.settings.fightsPerActivity}</dd></div>
          {state.settings.opensAt && <div><dt>Abertura das inscrições</dt><dd>{formatTournamentDate(state.settings.opensAt)}</dd></div>}
          {state.settings.closesAt && <div><dt>Prazo de inscrição</dt><dd>{formatTournamentDate(state.settings.closesAt)}</dd></div>}
        </dl>
      </Panel>
      {state.settings.rules && <Panel title="Regulamento"><p className="tournament-copy">{state.settings.rules}</p></Panel>}
      {isAcceptingInvites(state) && detail.data && <TournamentInvitations key={selectedId} candidates={detail.data.members} entries={state.entries} busy={busy} onAction={run} />}
      {state.status === "em_andamento" && <Panel title="Distribuir lutas no calendário">
        {upcomingOptions.length ? <div className="tournament-controls">
          <div className="field">
            <label htmlFor="tournament-distribute-activity">Atividade do calendário</label>
            <Select id="tournament-distribute-activity" value={calendarId} options={[{ value: "", label: "Selecione uma atividade" }, ...upcomingOptions]} onChange={setCalendarId} disabled={busy} />
          </div>
          <button type="button" className="button button-primary" disabled={busy || !upcomingOptions.some((option) => option.value === calendarId)} onClick={() => void run({ action: "distribute", activityId: calendarId })}>Distribuir lutas disponíveis</button>
        </div> : <button className="button button-ghost" type="button" onClick={() => setSection("calendario")}><CalendarPlus aria-hidden="true" /> Cadastrar uma atividade no calendário</button>}
      </Panel>}
      <TournamentBoard state={state} activities={activities} actions={state.status === "em_andamento" ? matchActions : undefined} />
    </div>}
    <TournamentForm key={draft} activityOptions={upcomingOptions} open={active && form === "create"} busy={busy}
      onSave={(settings) => void run({ action: "create", settings })}
      onClose={() => setForm(null)}
      onCancel={() => { setForm(null); setDraft((current) => current + 1); }} />
    {state && form === "settings" && <TournamentForm key={selectedId} initial={state.settings} activityOptions={settingsOptions} open={active} busy={busy}
      onSave={(settings) => { if (!changedSince(settingsBasis, state.settings)) void run({ action: "settings", settings }); }}
      onClose={() => setForm(null)} onCancel={() => setForm(null)} />}
    {state && active && matchDialog && editingMatch && <TournamentMatchDialog key={editingMatch.id} mode={matchDialog.mode} match={editingMatch} state={state} activityOptions={options} busy={busy} onAction={async (action) => !changedSince(matchDialog.basis, editingMatch) && run(action)} onClose={() => setMatchDialog(null)} />}
  </div>;
}

function TournamentInvitations({ candidates, entries, busy, onAction }: {
  candidates: TournamentMember[];
  entries: TournamentRecord["state"]["entries"];
  busy: boolean;
  onAction: (action: TournamentAdminAction) => Promise<boolean>;
}) {
  const confirm = useConfirm();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const existing = new Set(entries.map((entry) => entry.id));
  const available = candidates.filter((candidate) => !existing.has(candidate.id));
  const eligible = new Set(available.map((member) => member.id));
  const selection = selected.filter((id) => eligible.has(id));
  const matches = available.filter((candidate) => candidate.nickname.toLocaleLowerCase("pt-BR").includes(search.trim().toLocaleLowerCase("pt-BR")));
  const registered = entries.filter((entry) => entry.registered).length;

  async function remove(member: TournamentMember) {
    if (await confirm({ title: "Retirar convite?", message: `O convite e a inscrição de ${member.nickname}, se confirmada, serão retirados.`, confirmLabel: "Retirar convite" })) {
      await onAction({ action: "remove_invite", memberId: member.id });
    }
  }

  const confirmed = `${registered} ${registered === 1 ? "confirmado" : "confirmados"} de ${entries.length} ${entries.length === 1 ? "convidado" : "convidados"}`;

  return <>
    <Panel title="Convites do torneio" description={confirmed} flush
      footer={available.length > 0 && <button className="button button-primary" type="button" disabled={busy || !selection.length} onClick={async () => {
        if (await onAction({ action: "invite", memberIds: selection })) setSelected([]);
      }}><TicketPlus aria-hidden="true" /> Convidar {selection.length || ""}</button>}>
      {available.length > 0 ? <>
        <div className="tournament-invite-search"><SearchField value={search} onChange={setSearch} placeholder="Buscar por apelido" label="Buscar integrante aprovado" /></div>
        {matches.length > 0 ? <ul className="tournament-invite-list" aria-label="Integrantes disponíveis">
          {matches.map((member) => <li key={member.id}><label>
            <input type="checkbox" checked={selection.includes(member.id)} disabled={busy}
              onChange={(event) => setSelected(event.target.checked ? [...selection, member.id] : selection.filter((id) => id !== member.id))} />
            {member.nickname}
          </label></li>)}
        </ul> : <p className="table-empty">Nenhum integrante encontrado.</p>}
      </> : <p className="table-empty">Nenhum integrante aprovado disponível para convidar.</p>}
    </Panel>
    {entries.length > 0 && <Panel title="Participantes convidados" flush>
      <DataTable
        rows={entries}
        rowKey={(entry) => entry.id}
        empty="Nenhum participante convidado."
        caption="Participantes convidados"
        columns={[
          { key: "nickname", header: "Apelido", hideLabel: true, className: "is-lead", render: (entry) => <strong>{entry.nickname}</strong> },
          { key: "registration", header: "Inscrição", render: (entry) => entry.registered ? <StatusBadge status="aprovado" label="Confirmada" /> : <StatusBadge status="pendente" label="Aguardando confirmação" /> },
          {
            key: "actions", header: "Ações", srOnlyHeader: true, className: "row-actions",
            render: (entry) => <RowMenu label={`Ações de ${entry.nickname}`} items={[
              { label: "Retirar convite", icon: <UserX />, danger: true, disabled: busy, onSelect: () => void remove(entry) },
            ]} />,
          },
        ]}
      />
    </Panel>}
  </>;
}
