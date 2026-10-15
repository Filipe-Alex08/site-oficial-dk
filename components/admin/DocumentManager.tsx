"use client";

import { Award, CircleHelp, Download, FileText, FileUp, Pencil, Plus, Shield, Trash2, Upload, X } from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { graduationLabels, graduationOptions, rankGroups, rankLabels } from "@/lib/member-access";
import { createClient } from "@/lib/supabase/client";
import Select from "@/components/ui/Select";
import type { DocumentAccessRule, DocumentTrack, InternalDocument, DkRank, GraduationLevel } from "@/lib/types";

const newRule = (): DocumentAccessRule => ({ kind: "rank", minimum_rank: "recruta" });
function ruleLabel(rule: DocumentAccessRule) {
  return rule.kind === "rank" ? `${rankLabels[rule.minimum_rank]} ou superior` : `${rule.track === "cavalaria" ? "Cavalaria" : "Arquearia"} ${graduationLabels[rule.minimum_graduation]} ou superior`;
}
function accessLabel(document: InternalDocument) {
  const rules = document.access_rules ?? [];
  if (!rules.length) return "Todos os membros aprovados";
  return rules.map((rule, index) => `${index ? ((rule.join ?? document.access_logic ?? "or") === "and" ? "E" : "OU") + " " : ""}${ruleLabel(rule)}`).join(" ");
}

export default function DocumentManager() {
  const supabase = useMemo(() => createClient(), []);
  const formRef = useRef<HTMLFormElement>(null);
  const [rules, setRules] = useState<DocumentAccessRule[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [fileName, setFileName] = useState("");
  const queryClient = useQueryClient();
  const documentsQuery = useQuery({
    queryKey: ["admin-documents"],
    enabled: Boolean(supabase),
    queryFn: async () => {
      if (!supabase) throw new Error("Banco não configurado.");
      const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InternalDocument[];
    },
  });
  const documents = documentsQuery.data ?? [];
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch("/api/admin/documents", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar o documento.");
    },
    onSuccess: async () => {
      show("Documento enviado e protegido."); formRef.current?.reset(); setFileName(""); setRules([]);
      await queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
    },
    onError: (error: Error) => show(error.message),
  });
  const saveRulesMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/documents/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ access_logic: "or", access_rules: rules }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível atualizar as regras.");
    },
    onSuccess: async () => { show("Regras de acesso atualizadas."); setEditing(null); await queryClient.invalidateQueries({ queryKey: ["admin-documents"] }); },
    onError: (error: Error) => show(error.message),
  });
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/admin/documents/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível excluir o documento.");
    },
    onSuccess: async () => { show("Documento excluído."); await queryClient.invalidateQueries({ queryKey: ["admin-documents"] }); },
    onError: (error: Error) => show(error.message),
  });
  function show(message: string) { setNotice(message); window.setTimeout(() => setNotice(""), 3500); }
  function addRule() { setRules((current) => [...current, { ...newRule(), join: "and" }]); }
  function updateRule(index: number, rule: DocumentAccessRule) { setRules((current) => current.map((item, i) => i === index ? rule : item)); }
  function changeJoin(index: number, join: "and" | "or") { setRules((current) => current.map((item, i) => i === index ? { ...item, join } : item)); }
  function renderJoin(join: "and" | "or", onChange: (value: "and" | "or") => void, label: string) {
    return <div className="document-join-control"><div role="group" aria-label={label} className="document-join-toggle">
      {(["and", "or"] as const).map((value) => <button key={value} type="button" className={join === value ? "active" : ""} aria-pressed={join === value} onClick={() => onChange(value)}>{value === "and" ? "E" : "OU"}</button>)}
    </div></div>;
  }
  function renderRules() {
    return <div className="document-rules-editor">
      <div className="document-rules-heading"><strong>Requisitos de acesso</strong><details className="document-rules-help"><summary aria-label="Ajuda sobre requisitos de acesso" title="Como funcionam os requisitos"><CircleHelp size={18} /></summary><div className="document-rules-help-card"><strong>Como funcionam os requisitos</strong><p>Sem requisitos, qualquer membro aprovado pode acessar o documento.</p><ul><li>Patente mínima libera para essa patente e as superiores.</li><li>Graduação mínima vale para a modalidade escolhida e graduações superiores.</li><li><b>E</b> exige que a pessoa cumpra os dois requisitos conectados.</li><li><b>OU</b> libera quando a pessoa cumpre qualquer um dos requisitos conectados.</li></ul><p>Quando há mais de uma combinação, <b>E</b> é avaliado antes de <b>OU</b>. Exemplo: Major E Cavaleiro de Ouro OU General libera para Major com essa graduação ou para qualquer General.</p></div></details></div>
      {rules.map((rule, index) => <div className="document-rule-wrap" key={index}>
        {index > 0 && renderJoin(rule.join ?? "and", (value) => changeJoin(index, value), `Como combinar o requisito ${index + 1} com o anterior`)}
        <section className="document-rule-card">
          <header><span className="document-rule-icon">{rule.kind === "rank" ? <Shield size={19} /> : <Award size={19} />}</span><div><strong>Requisito {index + 1}</strong><small>{rule.kind === "rank" ? "Patente" : "Graduação"}</small></div><button className="document-rule-remove" type="button" onClick={() => setRules((current) => current.filter((_, i) => i !== index))} aria-label={`Remover requisito ${index + 1}`}><X size={17} /></button></header>
          <div className={`document-rule-fields ${rule.kind === "rank" ? "rank" : "graduation"}`}>
            <div className="field"><label htmlFor={`rule-kind-${index}`}>Tipo de requisito</label><Select id={`rule-kind-${index}`} value={rule.kind} options={[{ value: "rank", label: "Patente mínima" }, { value: "graduation", label: "Graduação mínima" }]} onChange={(value) => updateRule(index, value === "rank" ? { ...newRule(), join: rule.join } : { kind: "graduation", track: "cavalaria", minimum_graduation: "bronze", join: rule.join })} /></div>
            {rule.kind === "rank" ? <div className="field"><label htmlFor={`rule-rank-${index}`}>Patente mínima</label><Select id={`rule-rank-${index}`} value={rule.minimum_rank} options={rankGroups.flatMap((group) => group.ranks.map((item) => ({ value: item.value, label: item.label, group: group.category })))} onChange={(value) => updateRule(index, { ...rule, minimum_rank: value as DkRank })} /></div> : <>
              <div className="field"><label htmlFor={`rule-track-${index}`}>Modalidade</label><Select id={`rule-track-${index}`} value={rule.track} options={[{ value: "cavalaria", label: "Cavalaria" }, { value: "arquearia", label: "Arquearia" }]} onChange={(value) => updateRule(index, { ...rule, track: value as DocumentTrack })} /></div>
              <div className="field"><label htmlFor={`rule-graduation-${index}`}>Graduação mínima</label><Select id={`rule-graduation-${index}`} value={rule.minimum_graduation} options={graduationOptions.filter((item) => item.value !== "sem_graduacao").map((item) => ({ value: item.value, label: item.label }))} onChange={(value) => updateRule(index, { ...rule, minimum_graduation: value as GraduationLevel })} /></div>
            </>}
          </div>
        </section>
      </div>)}
      <button className="button button-ghost document-add-rule" type="button" onClick={addRule}><Plus size={16} /> Adicionar requisito</button>
    </div>;
  }
  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.set("access_logic", "or"); formData.set("access_rules", JSON.stringify(rules));
    uploadMutation.mutate(formData);
  }
  function saveRules(id: string) {
    saveRulesMutation.mutate(id);
  }
  function remove(id: string) {
    if (!window.confirm("Excluir permanentemente este documento?")) return;
    removeMutation.mutate(id);
  }
  return <div>
    {notice && <div className="admin-notice">{notice}</div>}
    <div className="admin-title"><div><h2>Documentos internos</h2><p>Envie PDFs e defina quem poderá acessá-los.</p></div></div>
    <form className="admin-form" onSubmit={upload} ref={formRef}>
      <div className="form-grid">
        <div className="field"><label htmlFor="document-title">Título</label><input id="document-title" name="title" placeholder="Ex.: Manual de combate" required /></div>
        <div className="field"><label htmlFor="document-file">Arquivo PDF</label><label className="document-upload-zone" htmlFor="document-file"><FileUp size={23} /><span><strong>{fileName || "Selecione um arquivo PDF"}</strong><small>{fileName ? "Arquivo pronto para envio" : "PDF • máximo de 20 MB"}</small></span><span className="document-upload-action">Escolher arquivo</span><input id="document-file" name="file" type="file" accept="application/pdf,.pdf" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} required /></label></div>
        <div className="field field-full"><label>Descrição</label><textarea name="description" /></div>
        <div className="field field-full">{renderRules()}</div>
      </div>
      <button className="button button-primary" type="submit" disabled={uploadMutation.isPending}><Upload size={17} /> {uploadMutation.isPending ? "Enviando..." : "Enviar PDF"}</button>
    </form>
    {documentsQuery.isPending && <p className="empty-state" role="status">Carregando documentos…</p>}
    {documentsQuery.isError && <p className="empty-state" role="alert">Falha ao carregar documentos. <button className="text-button" onClick={() => void documentsQuery.refetch()}>Tentar novamente</button></p>}
    {documents.length ? <div className="document-admin-list">{documents.map((document) => <article key={document.id}>
      <FileText /><div><strong>{document.title}</strong><span>{accessLabel(document)}</span><small>{document.file_name}</small>
      {editing === document.id && <div className="document-edit-rules">{renderRules()}<div className="document-rule-actions"><button className="button button-primary" type="button" disabled={saveRulesMutation.isPending} onClick={() => saveRules(document.id)}>{saveRulesMutation.isPending ? "Salvando…" : "Salvar regras"}</button><button className="button button-ghost" type="button" onClick={() => setEditing(null)}>Cancelar</button></div></div>}</div>
      <a href={`/api/documents/${document.id}/download`} target="_blank" rel="noreferrer" title="Abrir"><Download /></a>
      {editing !== document.id && <button className="document-edit-access" type="button" onClick={() => { const savedRules = document.access_rules ?? []; const normalized = savedRules.map((rule, index) => index === 0 ? rule : { ...rule, join: rule.join ?? document.access_logic ?? "or" }); setRules(normalized); setEditing(document.id); }} title="Editar acesso" aria-label={`Editar acesso de ${document.title}`}><Pencil size={17} /></button>}
      <button type="button" disabled={removeMutation.isPending} onClick={() => remove(document.id)} title="Excluir">{removeMutation.isPending && removeMutation.variables === document.id ? <span className="inline-spinner" /> : <Trash2 />}</button>
    </article>)}</div> : !documentsQuery.isPending && !documentsQuery.isError ? <div className="empty-state"><FileText /><h3>Nenhum documento cadastrado</h3><p>Envie o primeiro PDF usando o formulário acima.</p></div> : null}
  </div>;
}
