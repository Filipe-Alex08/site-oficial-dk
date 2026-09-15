"use client";

import { Download, FileText, Trash2, Upload } from "lucide-react";
import { FormEvent, useCallback, useMemo, useRef, useState, useEffect } from "react";
import { documentAudienceOptions, graduationLabels, graduationOptions, rankGroups, rankLabels } from "@/lib/member-access";
import { createClient } from "@/lib/supabase/client";
import type { DocumentAudience, GraduationLevel, InternalDocument, DkRank } from "@/lib/types";

function accessLabel(document: InternalDocument) {
  if (document.audience === "todos") return "Todos os membros";
  if (document.audience === "oficiais") return `Oficiais — ${rankLabels[document.minimum_rank!]} ou superior`;
  return `${graduationLabels[document.minimum_graduation!]} ou superior`;
}

export default function DocumentManager() {
  const supabase = useMemo(() => createClient(), []);
  const formRef = useRef<HTMLFormElement>(null);
  const [documents, setDocuments] = useState<InternalDocument[]>([]);
  const [audience, setAudience] = useState<DocumentAudience>("todos");
  const [minimumRank, setMinimumRank] = useState<DkRank>("recruta");
  const [minimumGraduation, setMinimumGraduation] = useState<GraduationLevel>("bronze");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
    setDocuments((data ?? []) as InternalDocument[]);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.from("documents").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      if (active) setDocuments((data ?? []) as InternalDocument[]);
    });
    return () => { active = false; };
  }, [supabase]);

  function show(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3500);
  }

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    const formData = new FormData(event.currentTarget);
    formData.set("audience", audience);
    if (audience === "oficiais") formData.set("minimum_rank", minimumRank);
    if (audience === "graduacao") formData.set("minimum_graduation", minimumGraduation);

    const response = await fetch("/api/admin/documents", { method: "POST", body: formData });
    const result = await response.json();
    if (!response.ok) show(result.error || "Não foi possível enviar o documento.");
    else {
      show("Documento enviado e protegido.");
      formRef.current?.reset();
      setAudience("todos");
      await load();
    }
    setBusy(false);
  }

  async function remove(id: string) {
    if (!window.confirm("Excluir permanentemente este documento?")) return;
    const response = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
    const result = await response.json();
    show(response.ok ? "Documento excluído." : result.error);
    if (response.ok) await load();
  }

  return (
    <div>
      {notice && <div className="admin-notice">{notice}</div>}
      <div className="admin-title"><div><h2>Documentos internos</h2><p>Envie PDFs e defina quem poderá acessá-los.</p></div></div>
      <form className="admin-form" onSubmit={upload} ref={formRef}>
        <div className="form-grid">
          <div className="field"><label>Título</label><input name="title" required /></div>
          <div className="field"><label>Arquivo PDF</label><input name="file" type="file" accept="application/pdf,.pdf" required /></div>
          <div className="field field-full"><label>Descrição</label><textarea name="description" /></div>
          <div className="field"><label>Público</label><select value={audience} onChange={(event) => setAudience(event.target.value as DocumentAudience)}>{documentAudienceOptions.map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></div>
          {audience === "oficiais" && <div className="field"><label>Patente mínima</label><select value={minimumRank} onChange={(event) => setMinimumRank(event.target.value as DkRank)}>{rankGroups.map((group) => <optgroup label={group.category} key={group.category}>{group.ranks.map((rank) => <option value={rank.value} key={rank.value}>{rank.label}</option>)}</optgroup>)}</select></div>}
          {audience === "graduacao" && <div className="field"><label>Graduação mínima</label><select value={minimumGraduation} onChange={(event) => setMinimumGraduation(event.target.value as GraduationLevel)}>{graduationOptions.filter((item) => item.value !== "sem_graduacao").map((item) => <option value={item.value} key={item.value}>{item.label}</option>)}</select></div>}
        </div>
        <button className="button button-primary" type="submit" disabled={busy}><Upload size={17} /> {busy ? "Enviando..." : "Enviar PDF"}</button>
        <p className="admin-help">O arquivo ficará em armazenamento privado. Limite: 20 MB.</p>
      </form>

      {documents.length ? (
        <div className="document-admin-list">
          {documents.map((document) => (
            <article key={document.id}><FileText /><div><strong>{document.title}</strong><span>{accessLabel(document)}</span><small>{document.file_name}</small></div><a href={`/api/documents/${document.id}/download`} target="_blank" rel="noreferrer" title="Abrir"><Download /></a><button onClick={() => remove(document.id)} title="Excluir"><Trash2 /></button></article>
          ))}
        </div>
      ) : <div className="empty-state"><FileText /><h3>Nenhum documento cadastrado</h3><p>Envie o primeiro PDF usando o formulário acima.</p></div>}
    </div>
  );
}
