"use client";

import { CheckCheck, MailOpen, Pencil, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import AdminDialog from "@/components/admin/AdminDialog";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import { useToast } from "@/components/admin/ToastProvider";
import Avatar from "@/components/admin/ui/Avatar";
import Panel from "@/components/admin/ui/Panel";
import { RankInsignia } from "@/components/member/Insignia";
import NoteSeal from "@/components/member/notes/NoteSeal";
import { apiFetch, jsonApiFetch } from "@/lib/api-client";
import { friendlyError } from "@/lib/friendly-error";
import { rankLabels } from "@/lib/member-access";
import { NOTE_MAX, noteDisplayName, sealsOfNote } from "@/lib/member-notes";
import type { MemberNote, NoteCounterpart } from "@/lib/types";

export type NoteItem = { note: MemberNote; counterpart: NoteCounterpart | null };
type Tab = "recebidas" | "enviadas";

const formatDate = (iso: string) => new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" });

/** Chamada às rotas de anotação; devolve a mensagem de erro em português quando falha. */
async function call(request: Promise<Response>): Promise<void> {
  const response = await request;
  if (response.ok) return;
  const result = await response.json().catch(() => ({}));
  throw new Error(result.error || "Não foi possível concluir a ação.");
}

/** Anotações recebidas e enviadas. O servidor entrega tudo pronto; aqui ficam só as ações. */
export default function NoteList({ received, sent, canWrite, initialTab }: { received: NoteItem[]; sent: NoteItem[]; canWrite: boolean; initialTab: Tab }) {
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const showSent = canWrite || sent.length > 0;
  const [tab, setTab] = useState<Tab>(initialTab === "enviadas" && showSent ? "enviadas" : "recebidas");
  const [busy, setBusy] = useState<string | null>(null);
  const [editing, setEditing] = useState<NoteItem | null>(null);
  const [draft, setDraft] = useState("");

  const unread = received.filter((item) => !item.note.read_at).length;
  const items = tab === "recebidas" ? received : sent;

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
    if (!(await confirm({ title: "Apagar esta anotação?", message: `Ela deixa de aparecer para você e para ${to}. Não dá para desfazer.`, confirmLabel: "Apagar anotação", danger: true }))) return;
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

  return (
    <>
      {showSent && (
        <div className="m-filters" role="group" aria-label="Tipo de anotação">
          <button type="button" aria-pressed={tab === "recebidas"} onClick={() => selectTab("recebidas")}>Recebidas {unread > 0 && <span className="count-pill">{unread}</span>}</button>
          <button type="button" aria-pressed={tab === "enviadas"} onClick={() => selectTab("enviadas")}>Enviadas <span className="count-pill">{sent.length}</span></button>
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty-state">
          {tab === "recebidas" ? <MailOpen /> : <Send />}
          <h2>{tab === "recebidas" ? "Nenhuma anotação recebida" : "Você ainda não enviou anotações"}</h2>
          <p>{tab === "recebidas" ? "As anotações que comandantes e oficiais deixarem para você aparecem aqui." : "As anotações que você escrever aparecem aqui."}</p>
        </div>
      ) : (
        <Panel
          title={tab === "recebidas" ? "Anotações recebidas" : "Anotações enviadas"}
          description={`${items.length} ${items.length === 1 ? "anotação" : "anotações"}`}
          actions={tab === "recebidas" && unread > 0 ? <button className="button button-ghost button-small" type="button" disabled={busy !== null} onClick={() => void markAll()}><CheckCheck size={16} /> Marcar todas como lidas</button> : undefined}
          flush
        >
          <ul className="m-memos">
            {items.map((item) => {
              const { note, counterpart } = item;
              const seals = sealsOfNote(note);
              const unreadNote = tab === "recebidas" && !note.read_at;
              const name = counterpart ? noteDisplayName(counterpart) : "Membro removido";
              return (
                <li key={note.id} className={`m-memo${unreadNote ? " is-unread" : ""}${seals.length ? " is-sealed" : ""}`} data-tier={seals[0]?.level}>
                  <header className="m-memo-head">
                    <Avatar name={name} path={counterpart?.avatar_path} size={40} />
                    <div className="m-memo-who">
                      <strong>{tab === "recebidas" ? "De " : "Para "}{name}</strong>
                      <span>
                        {counterpart && <RankInsignia rank={counterpart.rank} variant="icon" />}
                        {counterpart ? rankLabels[counterpart.rank] : ""}
                        {counterpart ? " · " : ""}
                        <time dateTime={note.created_at}>{formatDate(note.created_at)}</time>
                        {note.updated_at > note.created_at && " · editada"}
                      </span>
                    </div>
                    {unreadNote && <span className="badge pendente">Nova</span>}
                  </header>
                  {seals.length > 0 && <div className="m-memo-seals">{seals.map((seal) => <NoteSeal key={seal.track} seal={seal} />)}</div>}
                  <p className="m-memo-body">{note.body}</p>
                  <footer className="m-memo-actions">
                    {tab === "recebidas" ? (
                      <button className="button button-ghost button-small" type="button" disabled={busy !== null} onClick={() => void setRead(item, !note.read_at)}>
                        <MailOpen size={16} /> {note.read_at ? "Marcar como não lida" : "Marcar como lida"}
                      </button>
                    ) : (
                      <>
                        {canWrite && <button className="button button-ghost button-small" type="button" disabled={busy !== null} onClick={() => startEdit(item)}><Pencil size={16} /> Editar</button>}
                        <button className="button button-ghost button-small" type="button" disabled={busy !== null} onClick={() => void remove(item)}><Trash2 size={16} /> Apagar</button>
                      </>
                    )}
                  </footer>
                </li>
              );
            })}
          </ul>
        </Panel>
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
