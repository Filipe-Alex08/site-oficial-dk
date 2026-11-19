"use client";

import { Check, ChevronDown, Lock, PenLine, Search, Send, UserRound, UsersRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, KeyboardEvent, useMemo, useState } from "react";
import { useToast } from "@/components/admin/ToastProvider";
import Avatar from "@/components/admin/ui/Avatar";
import { RankInsignia } from "@/components/member/Insignia";
import NoteSeal from "@/components/member/notes/NoteSeal";
import { jsonApiFetch } from "@/lib/api-client";
import { friendlyError } from "@/lib/friendly-error";
import { rankLabels } from "@/lib/member-access";
import { NOTE_MAX, noteDisplayName, noteSealsFor } from "@/lib/member-notes";
import type { NoteCounterpart } from "@/lib/types";

/** Minúsculas e sem acento: "joão" encontra "Joao". */
const fold = (value: string) => value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

/**
 * Formulário de nova anotação: lista de membros com foto (busca por nome ou apelido) ao lado do texto.
 * No celular a lista encolhe para o cartão do destinatário depois da escolha. A prévia do selo é só
 * um aviso: quem decide é o banco.
 */
export default function NoteComposer({ author, recipients, restriction = null, startOpen = false }: { author: NoteCounterpart; recipients: NoteCounterpart[]; restriction?: string | null; startOpen?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState(startOpen);
  const [recipientId, setRecipientId] = useState("");
  const [picking, setPicking] = useState(true);
  const [search, setSearch] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const recipient = recipients.find((member) => member.id === recipientId) ?? null;
  const seals = useMemo(() => (recipient ? noteSealsFor(author, recipient) : []), [author, recipient]);
  const isCommander = Boolean(author.commander_cavalaria || author.commander_arquearia);
  const length = body.trim().length;
  const used = Math.min(1, length / NOTE_MAX);
  const canSend = !sending && Boolean(recipientId) && length > 0;

  const visible = useMemo(() => {
    const term = fold(search.trim());
    return term ? recipients.filter((member) => fold(`${member.full_name} ${member.nickname}`).includes(term)) : recipients;
  }, [recipients, search]);

  function choose(id: string) {
    setRecipientId(id);
    setPicking(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSend) return;
    setSending(true);
    try {
      const response = await jsonApiFetch("/api/member/notes", { recipientId, body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar a anotação.");
      toast.success("Anotação enviada.");
      // Volta ao estado inicial e fecha: a anotação nova já aparece na lista abaixo.
      setBody("");
      setRecipientId("");
      setSearch("");
      setPicking(true);
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setSending(false);
    }
  }

  /** Ctrl/Cmd + Enter envia sem tirar a mão do teclado. */
  function submitShortcut(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && (event.ctrlKey || event.metaKey) && canSend) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  }

  return (
    <section className={`m-composer${open ? " is-open" : ""}`} aria-labelledby="note-composer-title">
      <button type="button" className="m-composer-toggle" aria-expanded={open} aria-controls="note-composer-body" onClick={() => setOpen((value) => !value)}>
        <span className="m-composer-icon" aria-hidden="true"><PenLine /></span>
        <span className="m-composer-heading">
          <strong id="note-composer-title">Nova anotação</strong>
          <small><Lock size={13} aria-hidden="true" /> Só você e o destinatário podem ler.</small>
        </span>
        <ChevronDown className="m-composer-chevron" aria-hidden="true" />
      </button>

      {open && (
        <form className="m-composer-body" id="note-composer-body" onSubmit={submit}>
          <div className={`m-picker${!picking && recipient ? " is-collapsed" : ""}`}>
            <div className="m-picker-head">
              <label className="admin-search">
                <span className="sr-only">Buscar membro por nome ou apelido</span>
                <Search aria-hidden="true" />
                <input id="note-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nome ou apelido" autoComplete="off" />
              </label>
              <p className="m-picker-count" role="status">{visible.length} {visible.length === 1 ? "membro" : "membros"}</p>
            </div>
            {visible.length > 0 ? (
              <ul className="m-picker-list" aria-label="Membros disponíveis">
                {visible.map((member) => {
                  const selected = member.id === recipientId;
                  return (
                    <li key={member.id}>
                      <button type="button" className={`m-picker-item${selected ? " is-selected" : ""}`} aria-pressed={selected} onClick={() => choose(member.id)}>
                        <Avatar name={noteDisplayName(member)} path={member.avatar_path} size={38} />
                        <span className="m-picker-text">
                          <strong>{noteDisplayName(member)}</strong>
                          <small><RankInsignia rank={member.rank} variant="icon" />{rankLabels[member.rank]}</small>
                        </span>
                        {selected && <Check className="m-picker-check" aria-hidden="true" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="m-picker-empty"><UsersRound aria-hidden="true" />{recipients.length ? "Nenhum membro encontrado." : "Nenhum membro disponível para você nas regras atuais."}</p>
            )}
            {restriction && <p className="field-hint">{restriction}</p>}
          </div>

          <div className="m-composer-write">
            {recipient ? (
              <div className="m-composer-to" role="status">
                <Avatar name={noteDisplayName(recipient)} path={recipient.avatar_path} size={44} />
                <div>
                  <small>Para</small>
                  <strong>{noteDisplayName(recipient)}</strong>
                  <span className="m-composer-to-rank"><RankInsignia rank={recipient.rank} variant="icon" />{rankLabels[recipient.rank]}</span>
                </div>
                <button type="button" className="button button-ghost button-small m-composer-change" onClick={() => setPicking(true)}>Trocar</button>
              </div>
            ) : (
              <p className="m-composer-to is-empty"><UserRound aria-hidden="true" />Escolha um membro na lista para escrever a anotação.</p>
            )}

            <div className="field">
              <label htmlFor="note-body">Anotação</label>
              <textarea id="note-body" value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={submitShortcut} maxLength={NOTE_MAX} required rows={7} placeholder="Escreva aqui…" />
              <div className="m-composer-count">
                <span className="m-composer-bar" aria-hidden="true"><span style={{ width: `${used * 100}%` }} data-near={used > 0.9 ? "true" : undefined} /></span>
                <span>{length}/{NOTE_MAX}</span>
              </div>
            </div>

            {recipient && (seals.length > 0
              ? <div className="m-memo-preview" role="status"><p>Esta anotação levará o selo:</p>{seals.map((seal) => <NoteSeal key={seal.track} seal={seal} />)}</div>
              : isCommander && <p className="field-hint" role="status">Sem selo: {noteDisplayName(recipient)} não tem graduação na trilha que você comanda.</p>)}

            <div className="m-composer-actions">
              <p className="m-composer-tip">Ctrl + Enter envia.</p>
              <button className="button button-primary" type="submit" disabled={!canSend}>
                <Send aria-hidden="true" /> {sending ? "Enviando…" : "Enviar"}
              </button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}
