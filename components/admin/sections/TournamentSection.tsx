"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trophy } from "lucide-react";
import { useMemo, useState } from "react";
import { useAdminData } from "@/components/admin/AdminDataContext";
import AdminTitle from "@/components/admin/AdminTitle";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import { useToast } from "@/components/admin/ToastProvider";
import TournamentForm from "@/components/admin/TournamentForm";
import TournamentMatchDialog from "@/components/admin/TournamentMatchDialog";
import Panel from "@/components/admin/ui/Panel";
import TournamentBoard, { formatTournamentDate } from "@/components/TournamentBoard";
import Select from "@/components/ui/Select";
import { apiFetch, jsonApiFetch } from "@/lib/api-client";
import {
  isAcceptingInvites, isTournamentActivityAvailable, tournamentFormatLabels, tournamentMatchIsReady, tournamentStatusLabels,
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
  const [calendarId, setCalendarId] = useState("");
  const [matchDialog, setMatchDialog] = useState<{ id: string; mode: "schedule" | "result" } | null>(null);
  const key = ["admin-tournaments", currentUserId];
  const list = useQuery({
    queryKey: key, enabled: active,
    queryFn: async ({ signal }) => readResponse<{ tournaments: TournamentSummary[] }>(await apiFetch(endpoint, { signal })),
  });
  const choices = list.data?.tournaments ?? [];
  const selectedId = selection || choices[0]?.id || "";
  const detailKey = [...key, selectedId];
  const detail = useQuery({
    queryKey: detailKey, enabled: active && Boolean(selectedId) && form !== "create",
    queryFn: async ({ signal }) => readResponse<Detail>(await apiFetch(`${endpoint}?id=${selectedId}`, { signal })),
    refetchInterval: active ? 30_000 : false,
  });
  const record = detail.data?.tournament;
  const state = record?.state;
  const options = useMemo(() => activities.filter(isTournamentActivityAvailable).map((activity) => ({
    value: activity.id, label: `${activity.title} · ${formatTournamentDate(activity.starts_at)}`,
  })), [activities]);

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
    return <div className="tournament-row-actions">
      <button className="text-button" type="button" disabled={mutation.isPending || !options.length} onClick={() => setMatchDialog({ id: match.id, mode: "schedule" })}>{match.activityId ? "Reagendar" : "Agendar"}</button>
      {match.activityId && <button className="text-button" type="button" disabled={mutation.isPending} onClick={() => void run({ action: "postpone", matchId: match.id })}>Adiar</button>}
      {canRecord && <button className="text-button" type="button" disabled={mutation.isPending} onClick={() => setMatchDialog({ id: match.id, mode: "result" })}>Registrar resultado</button>}
    </div>;
  }

  const editingMatch = state?.matches.find((item) => item.id === matchDialog?.id);
  const busy = mutation.isPending;

  return <div className="tournament-stack">
    <AdminTitle eyebrow="Atividades" title="Torneio" action={!form && <button className="button button-primary" type="button" onClick={() => setForm("create")} disabled={busy}><Plus aria-hidden="true" /> Novo torneio</button>} />
    {form === "create" ? <TournamentForm activityOptions={options} busy={busy} onSave={(settings) => void run({ action: "create", settings })} onCancel={() => setForm(null)} />
      : <>
        {list.isPending && <p role="status">Carregando torneios…</p>}
        {list.isError && <p role="alert">{list.error.message} <button type="button" className="text-button" onClick={() => void list.refetch()}>Tentar novamente</button></p>}
        {list.isSuccess && choices.length === 0 && <div className="empty-state"><Trophy aria-hidden="true" /><h3>Nenhum torneio cadastrado</h3><p>Use Novo torneio para definir o formato e convidar integrantes.</p></div>}
        {choices.length > 0 && <div className="tournament-controls">
          <div className="field">
            <label htmlFor="admin-tournament-selection">Torneio</label>
            <Select id="admin-tournament-selection" value={selectedId} options={choices.map((item) => ({ value: item.id, label: `${item.title} · ${tournamentStatusLabels[item.status]}` }))}
              onChange={(id) => { setSelection(id); setForm(null); setCalendarId(""); setMatchDialog(null); }} disabled={busy} />
          </div>
        </div>}
        {selectedId && detail.isPending && <p role="status">Carregando o torneio…</p>}
        {selectedId && detail.isError && <p role="alert">{detail.error.message} <button type="button" className="text-button" onClick={() => void detail.refetch()}>Tentar novamente</button></p>}
        {state && form === "settings" && <TournamentForm key={selectedId} initial={state.settings} activityOptions={options} busy={busy} onSave={(settings) => void run({ action: "settings", settings })} onCancel={() => setForm(null)} />}
        {state && form !== "settings" && <>
          <Panel title={state.settings.title} description={`${tournamentFormatLabels[state.settings.format]} · ${tournamentStatusLabels[state.status]}`}
            actions={isAcceptingInvites(state) && <button type="button" className="button button-ghost" onClick={() => setForm("settings")} disabled={busy}>Editar configuração</button>}>
            <div className="tournament-stack">
              {state.settings.description && <p className="tournament-copy">{state.settings.description}</p>}
              <p>Até {state.settings.fightsPerActivity} {state.settings.fightsPerActivity === 1 ? "luta" : "lutas"} por integrante em cada atividade.</p>
              {state.settings.opensAt && <p>Abertura em {formatTournamentDate(state.settings.opensAt)}.</p>}
              {state.settings.closesAt && <p>Prazo de inscrição em {formatTournamentDate(state.settings.closesAt)}.</p>}
              {state.status === "rascunho" && <div><button type="button" className="button button-primary" disabled={busy} onClick={() => void run({ action: "open" })}>Abrir inscrições</button></div>}
              {state.status === "inscricoes" && <div><button type="button" className="button button-primary" disabled={busy} onClick={() => void closeRegistration()}>Encerrar inscrições e sortear</button></div>}
            </div>
          </Panel>
          {state.settings.rules && <Panel title="Regulamento"><p className="tournament-copy">{state.settings.rules}</p></Panel>}
          {isAcceptingInvites(state) && detail.data && <TournamentInvitations key={selectedId} candidates={detail.data.members} entries={state.entries} busy={busy} onAction={run} />}
          {state.status === "em_andamento" && <Panel title="Distribuir lutas no calendário">
            {options.length ? <div className="tournament-controls">
              <div className="field">
                <label htmlFor="tournament-distribute-activity">Atividade do calendário</label>
                <Select id="tournament-distribute-activity" value={calendarId} options={[{ value: "", label: "Selecione uma atividade" }, ...options]} onChange={setCalendarId} disabled={busy} />
              </div>
              <button type="button" className="button button-primary" disabled={busy || !options.some((option) => option.value === calendarId)} onClick={() => void run({ action: "distribute", activityId: calendarId })}>Distribuir lutas disponíveis</button>
            </div> : <button className="button button-ghost" type="button" onClick={() => setSection("calendario")}>Cadastrar uma atividade no calendário</button>}
          </Panel>}
          <TournamentBoard state={state} activities={activities} actions={state.status === "em_andamento" ? matchActions : undefined} />
          {active && matchDialog && editingMatch && <TournamentMatchDialog key={editingMatch.id} mode={matchDialog.mode} match={editingMatch} state={state} activityOptions={options} busy={busy} onAction={run} onClose={() => setMatchDialog(null)} />}
        </>}
      </>}
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

  return <div className="tournament-stack">
    <Panel title="Convites do torneio" description={`${registered} confirmado(s) de ${entries.length} convidado(s)`}>
      <div className="tournament-stack">
        {available.length > 0 && <>
          <label className="field">Buscar integrante aprovado<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} /></label>
          <ul className="tournament-invite-list" aria-label="Integrantes disponíveis">
            {matches.map((member) => <li key={member.id}><label className="check-field">
              <input type="checkbox" checked={selection.includes(member.id)} disabled={busy}
                onChange={(event) => setSelected(event.target.checked ? [...selection, member.id] : selection.filter((id) => id !== member.id))} />
              {member.nickname}
            </label></li>)}
          </ul>
          {matches.length === 0 && <p>Nenhum integrante encontrado.</p>}
          <div><button className="button button-primary" type="button" disabled={busy || !selection.length} onClick={async () => {
            if (await onAction({ action: "invite", memberIds: selection })) setSelected([]);
          }}>Convidar {selection.length || ""}</button></div>
        </>}
        {available.length === 0 && <p>Nenhum integrante aprovado disponível para convidar.</p>}
      </div>
    </Panel>
    {entries.length > 0 && <Panel title="Participantes convidados" flush>
      <div className="table-wrap tournament-standing"><table>
        <thead><tr><th scope="col">Apelido</th><th scope="col">Inscrição</th><th scope="col">Ações</th></tr></thead>
        <tbody>{entries.map((entry) => <tr key={entry.id}>
          <td>{entry.nickname}</td><td>{entry.registered ? "Confirmada" : "Aguardando confirmação"}</td>
          <td><button type="button" className="text-button" disabled={busy} onClick={() => void remove(entry)}>Retirar convite</button></td>
        </tr>)}</tbody>
      </table></div>
    </Panel>}
  </div>;
}
