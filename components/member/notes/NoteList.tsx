"use client";

import { CheckCheck, Inbox, Mail, MailOpen, Pencil, SearchX, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState, type ReactNode } from "react";
import AdminDialog from "@/components/admin/AdminDialog";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import { useToast } from "@/components/admin/ToastProvider";
import Avatar from "@/components/admin/ui/Avatar";
import { SearchField } from "@/components/admin/ui/Toolbar";
import { RankInsignia } from "@/components/member/Insignia";
import NoteSeal from "@/components/member/notes/NoteSeal";
import { apiFetch, jsonApiFetch } from "@/lib/api-client";
import { friendlyError } from "@/lib/friendly-error";
import { rankLabels } from "@/lib/member-access";
import { NOTE_MAX, noteDisplayName, sealsOfNote } from "@/lib/member-notes";
import { calendarDaysBetween } from "@/lib/relative-day";
import type { MemberNote, NoteCounterpart } from "@/lib/types";

export type NoteItem = { note: MemberNote; counterpart: NoteCounterpart | null };
type Tab = "recebidas" | "enviadas";

const TIME_ZONE = "America/Sao_Paulo";

const formatDate = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: TIME_ZONE });

/** Rótulo do grupo da lista: hoje, ontem, últimos 7 dias ou o mês. */
function dayLabel(iso: string): string {
  const diff = calendarDaysBetween(iso);
  if (diff >= 0) return "Hoje";
  if (diff === -1) return "Ontem";
  if (diff >= -7) return "Esta semana";
  const month = new Date(iso).toLocaleDateString("pt-BR", { month: "long", year: "numeric", timeZone: TIME_ZONE });
  return month.charAt(0).toUpperCase() + month.slice(1);
}

/** Só a hora para hoje e ontem; dia e hora para o resto (o grupo já diz de que época é). */
function shortWhen(iso: string): string {
  const date = new Date(iso);
  const time = date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TIME_ZONE });
  if (calendarDaysBetween(iso) >= -1) return time;
  return `${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: TIME_ZONE })} · ${time}`;
}

/** Chamada às rotas de anotação; devolve a mensagem de erro em português quando falha. */
async function call(request: Promise<Response>): Promise<void> {
  const response = await request;
  if (response.ok) return;
  const result = await response.json().catch(() => ({}));
  throw new Error(result.error || "Não foi possível concluir a ação.");
}

/** Anotações recebidas e enviadas. O servidor entrega tudo pronto; aqui ficam as ações, a busca e o agrupamento por dia. */
export default function NoteList({ received, sent, canWrite, initialTab }: { received: NoteItem[]; sent: NoteItem[]; canWrite: boolean; initialTab: Tab }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const showSent = canWrite || sent.length > 0;
  const [tab, setTab] = useState<Tab>(initialTab === "enviadas" && showSent ? "enviadas" : "recebidas");
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<NoteItem | null>(null);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [onlyUnread, setOnlyUnread] = useState(false);
  const [open, setOpen] = useState<Set<string>>(new Set());

  const unread = received.filter((item) => !item.note.read_at).length;
  const items = tab === "recebidas" ? received : sent;
  const unreadOnly = onlyUnread && tab === "recebidas";

  function toggleOpen(id: string) {
    setOpen((current) => {
      const next = new Set(current);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  function selectTab(next: Tab) {
    setTab(next);
    window.history.replaceState(null, "", next === "recebidas" ? window.location.pathname : `${window.location.pathname}?aba=${next}`);
  }

  /** Executa uma ação com o botão travado; devolve se deu certo (a janela de edição só fecha nesse caso). */
  async function run(key: string, action: () => Promise<void>, success?: string): Promise<boolean> {
    if (busy) return false;
    setBusy(key);
    try {
      await action();
      if (success) toast.success(success);
      router.refresh();
      return true;
    } catch (error) {
      toast.error(friendlyError(error));
      return false;
    } finally {
      setBusy(null);
    }
  }

  const setRead = (item: NoteItem, read: boolean) =>
    run(item.note.id, () => call(jsonApiFetch(`/api/member/notes/${item.note.id}`, { read }, { method: "PATCH" })));
  const markAll = () => run("all", () => call(apiFetch("/api/member/notes/read-all", { method: "POST" })), "Anotações marcadas como lidas.");

  async function remove(item: NoteItem) {
    const to = item.counterpart ? noteDisplayName(item.counterpart) : "o destinatário";
    if (!(await confirm({ title: "Apagar esta anotação?", message: `Ela deixa de aparecer para você e para ${to}. Não dá para desfazer.`, confirmLabel: "Apagar", danger: true }))) return;
    await run(item.note.id, () => call(apiFetch(`/api/member/notes/${item.note.id}`, { method: "DELETE" })), "Anotação apagada.");
  }

  function startEdit(item: NoteItem) {
    setDraft(item.note.body);
    setEditing(item);
  }

  async function saveEdit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const saved = await run(editing.note.id, () => call(jsonApiFetch(`/api/member/notes/${editing.note.id}`, { body: draft }, { method: "PATCH" })), "Anotação atualizada.");
    if (saved) setEditing(null);
  }

  const term = query.trim().toLocaleLowerCase("pt-BR");
  const visible = items.filter(({ note, counterpart }) =>
    (!unreadOnly || !note.read_at)
    && (!term || note.body.toLocaleLowerCase("pt-BR").includes(term) || (counterpart ? `${counterpart.full_name} ${counterpart.nickname}`.toLocaleLowerCase("pt-BR").includes(term) : false)));

  // A lista já vem da mais nova para a mais antiga: basta abrir um grupo a cada mudança de rótulo.
  const groups = visible.reduce<Array<{ label: string; items: NoteItem[] }>>((list, item) => {
    const label = dayLabel(item.note.created_at);
    const last = list[list.length - 1];
    if (last?.label === label) last.items.push(item);
    else list.push({ label, items: [item] });
    return list;
  }, []);

  const tabs: Array<{ key: Tab; label: string; icon: ReactNode; total: number; hint: string }> = [
    { key: "recebidas", label: "Recebidas", icon: <Inbox />, total: received.length, hint: unread > 0 ? `${unread} ${unread === 1 ? "não lida" : "não lidas"}` : "Tudo lido" },
    { key: "enviadas", label: "Enviadas", icon: <Send />, total: sent.length, hint: sent.length === 1 ? "1 anotação escrita" : `${sent.length} anotações escritas` },
  ];

  return (
    <>
      {showSent && (
        <div className="m-notes-tabs" role="group" aria-label="Tipo de anotação">
          {tabs.map((item) => (
            <button key={item.key} type="button" className={`m-notes-tab${item.key === "recebidas" && unread > 0 ? " has-unread" : ""}`} aria-pressed={tab === item.key} onClick={() => selectTab(item.key)}>
              <span className="m-notes-tab-icon" aria-hidden="true">{item.icon}</span>
              <span className="m-notes-tab-text"><strong>{item.label}</strong><small>{item.hint}</small></span>
              <span className="m-notes-tab-total">{item.total}</span>
            </button>
          ))}
        </div>
      )}

      {items.length > 0 && (
        <div className="m-notes-toolbar">
          <SearchField value={query} onChange={setQuery} placeholder="Buscar por nome ou texto" label="Buscar anotações" />
          {tab === "recebidas" && unread > 0 && (
            <>
              <button type="button" className={`filter-chip${onlyUnread ? " is-active" : ""}`} aria-pressed={onlyUnread} onClick={() => setOnlyUnread((value) => !value)}>
                Só não lidas <span className="filter-chip-count">{unread}</span>
              </button>
              <button className="button button-ghost button-small m-notes-markall" type="button" disabled={busy !== null} onClick={() => void markAll()}><CheckCheck aria-hidden="true" /> Ler todas</button>
            </>
          )}
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          {tab === "recebidas" ? <MailOpen /> : <Send />}
          <h2>{tab === "recebidas" ? "Nenhuma anotação recebida" : "Você ainda não enviou anotações"}</h2>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <SearchX />
          <h2>Nenhuma anotação encontrada</h2>
          <button className="button button-ghost button-small" type="button" onClick={() => { setQuery(""); setOnlyUnread(false); }}>Limpar</button>
        </div>
      ) : (
        <div className="m-memo-feed">
          {groups.map((group) => (
            <section key={group.label} className="m-memo-group" aria-label={group.label}>
              <h2 className="m-memo-day"><span>{group.label}</span></h2>
              <ul className="m-memos">
                {group.items.map((item) => {
                  const { note, counterpart } = item;
                  const seals = sealsOfNote(note);
                  const unreadNote = tab === "recebidas" && !note.read_at;
                  const name = counterpart ? noteDisplayName(counterpart) : "Membro removido";
                  const long = note.body.length > 280 || note.body.split("\n").length > 5;
                  const expanded = open.has(note.id);
                  return (
                    <li key={note.id} className={`m-memo${unreadNote ? " is-unread" : ""}${seals.length ? " is-sealed" : ""}`} data-tier={seals[0]?.level}>
                      <header className="m-memo-head">
                        <span className="m-memo-avatar">
                          <Avatar name={name} path={counterpart?.avatar_path} size={44} />
                          {unreadNote && <span className="m-memo-dot" aria-hidden="true" />}
                        </span>
                        <div className="m-memo-who">
                          <span className="m-memo-dir">{tab === "recebidas" ? "De" : "Para"}</span>
                          <strong>{name}</strong>
                          {counterpart && <span className="m-memo-rank"><RankInsignia rank={counterpart.rank} variant="icon" />{rankLabels[counterpart.rank]}</span>}
                        </div>
                        <div className="m-memo-meta">
                          {unreadNote && <span className="m-memo-new">Nova</span>}
                          <time dateTime={note.created_at} title={formatDate(note.created_at)}>{shortWhen(note.created_at)}</time>
                          {note.updated_at > note.created_at && <span className="m-memo-edited">editada</span>}
                        </div>
                      </header>
                      {seals.length > 0 && <div className="m-memo-seals">{seals.map((seal) => <NoteSeal key={seal.track} seal={seal} />)}</div>}
                      <div className="m-memo-text">
                        <p className={`m-memo-body${long && !expanded ? " is-clamped" : ""}`}>{note.body}</p>
                        {long && <button type="button" className="m-memo-more" aria-expanded={expanded} onClick={() => toggleOpen(note.id)}>{expanded ? "Mostrar menos" : "Ler tudo"}</button>}
                      </div>
                      <footer className="m-memo-actions">
                        {tab === "recebidas" ? (
                          <button className="icon-button" type="button" disabled={busy !== null} onClick={() => void setRead(item, !note.read_at)} title={note.read_at ? "Marcar como não lida" : "Marcar como lida"} aria-label={note.read_at ? "Marcar como não lida" : "Marcar como lida"}>
                            {note.read_at ? <Mail aria-hidden="true" /> : <MailOpen aria-hidden="true" />}
                          </button>
                        ) : (
                          <>
                            {canWrite && <button className="icon-button" type="button" disabled={busy !== null} onClick={() => startEdit(item)} title="Editar" aria-label="Editar anotação"><Pencil aria-hidden="true" /></button>}
                            <button className="icon-button is-danger" type="button" disabled={busy !== null} onClick={() => void remove(item)} title="Apagar" aria-label="Apagar anotação"><Trash2 aria-hidden="true" /></button>
                          </>
                        )}
                      </footer>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}

      {editing && (
        <AdminDialog
          title="Editar anotação"
          description={editing.counterpart ? `Para ${noteDisplayName(editing.counterpart)}` : undefined}
          onClose={() => setEditing(null)}
          onSubmit={(event) => void saveEdit(event)}
          footer={<>
            <button className="button button-ghost" type="button" onClick={() => setEditing(null)}>Cancelar</button>
            <button className="button button-primary" type="submit" disabled={busy !== null || !draft.trim() || draft.trim() === editing.note.body}>Salvar</button>
          </>}
        >
          <div className="field">
            <label htmlFor="note-edit-body">Anotação</label>
            <textarea id="note-edit-body" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={NOTE_MAX} data-autofocus="" required />
            <p className="field-hint">{draft.trim().length}/{NOTE_MAX} caracteres</p>
          </div>
        </AdminDialog>
      )}
    </>
  );
}
