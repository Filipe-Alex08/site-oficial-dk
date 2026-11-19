"use client";

import { Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useToast } from "@/components/admin/ToastProvider";
import Panel from "@/components/admin/ui/Panel";
import NoteSeal from "@/components/member/notes/NoteSeal";
import Select from "@/components/ui/Select";
import { jsonApiFetch } from "@/lib/api-client";
import { friendlyError } from "@/lib/friendly-error";
import { rankLabels } from "@/lib/member-access";
import { NOTE_MAX, noteDisplayName, noteSealsFor } from "@/lib/member-notes";
import type { NoteCounterpart } from "@/lib/types";

/** Formulário de nova anotação. A prévia do selo é só um aviso: quem decide é o banco. */
export default function NoteComposer({ author, recipients, restriction = null }: { author: NoteCounterpart; recipients: NoteCounterpart[]; restriction?: string | null }) {
  const router = useRouter();
  const toast = useToast();
  const [recipientId, setRecipientId] = useState("");
  const [search, setSearch] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const recipient = recipients.find((member) => member.id === recipientId) ?? null;
  const seals = useMemo(() => (recipient ? noteSealsFor(author, recipient) : []), [author, recipient]);
  const isCommander = Boolean(author.commander_cavalaria || author.commander_arquearia);

  const options = useMemo(() => {
    const term = search.trim().toLowerCase();
    return recipients
      .filter((member) => member.id === recipientId || !term || `${member.full_name} ${member.nickname}`.toLowerCase().includes(term))
      .map((member) => ({ value: member.id, label: `${noteDisplayName(member)} · ${rankLabels[member.rank]}` }));
  }, [recipients, recipientId, search]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    try {
      const response = await jsonApiFetch("/api/member/notes", { recipientId, body });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar a anotação.");
      toast.success("Anotação enviada.");
      setBody("");
      router.refresh();
    } catch (error) {
      toast.error(friendlyError(error));
    } finally {
      setSending(false);
    }
  }

  return (
    <Panel title="Nova anotação" description="Só você e o destinatário podem ler.">
      <form className="admin-form" onSubmit={submit}>
        <section className="form-section">
          <div className="form-section-body">
            <div className="field">
              <label htmlFor="note-search">Buscar membro<span className="opt">opcional</span></label>
              <input id="note-search" type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou apelido" autoComplete="off" />
            </div>
            <div className="field">
              <label htmlFor="note-recipient">Para quem</label>
              <Select id="note-recipient" value={recipientId} options={options} onChange={setRecipientId} />
              {restriction && <p className="field-hint">{restriction}</p>}
              {!options.length && <p className="field-hint">{recipients.length ? "Nenhum membro encontrado." : "Nenhum membro disponível para você nas regras atuais."}</p>}
            </div>
            <div className="field">
              <label htmlFor="note-body">Anotação</label>
              <textarea id="note-body" value={body} onChange={(event) => setBody(event.target.value)} maxLength={NOTE_MAX} required placeholder="Escreva aqui…" />
              <p className="field-hint">{body.trim().length}/{NOTE_MAX} caracteres</p>
            </div>
            {recipient && (seals.length > 0
              ? <div className="m-memo-preview" role="status"><p>Esta anotação levará o selo:</p>{seals.map((seal) => <NoteSeal key={seal.track} seal={seal} />)}</div>
              : isCommander && <p className="field-hint" role="status">Sem selo: {noteDisplayName(recipient)} não tem graduação na trilha que você comanda.</p>)}
          </div>
        </section>
        <div className="form-actions">
          <button className="button button-primary" type="submit" disabled={sending || !recipientId || !body.trim()}>
            <Send size={17} /> {sending ? "Enviando…" : "Enviar anotação"}
          </button>
        </div>
      </form>
    </Panel>
  );
}
