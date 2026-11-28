"use client";

import { apiFetch } from "@/lib/api-client";
import { Award, CircleHelp, ExternalLink, FileText, FileUp, Pencil, Plus, Shield, Trash2, Upload, X } from "lucide-react";
import { FormEvent, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { graduationLabels, graduationOptions, rankGroups, rankLabels } from "@/lib/member-access";
import { createClient } from "@/lib/supabase/client";
import AdminTitle from "@/components/admin/AdminTitle";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import FormSectionHead from "@/components/admin/FormSectionHead";
import { useToast } from "@/components/admin/ToastProvider";
import Drawer from "@/components/admin/ui/Drawer";
import Panel from "@/components/admin/ui/Panel";
import RowMenu from "@/components/admin/ui/RowMenu";
import Select from "@/components/ui/Select";
import type { DocumentAccessRule, DocumentTrack, InternalDocument, DkRank, GraduationLevel } from "@/lib/types";

type RulesState = { rules: DocumentAccessRule[]; set: React.Dispatch<React.SetStateAction<DocumentAccessRule[]>>; prefix: string };

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
  const toast = useToast();
  const confirm = useConfirm();
  // Regras do formulário de envio e regras do documento em edição ficam separadas.
  const [editRules, setEditRules] = useState<DocumentAccessRule[]>([]);
  const [fileName, setFileName] = useState("");
  const queryClient = useQueryClient();
  const documentsQuery = useQuery({
    queryKey: ["admin-documents"],
    enabled: Boolean(supabase),
    queryFn: async () => {
      if (!supabase) throw new Error("Serviço indisponível no momento.");
      const { data, error } = await supabase.from("documents").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as InternalDocument[];
    },
  });
  const documents = documentsQuery.data ?? [];
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiFetch("/api/admin/documents", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar o documento.");
    },
    onSuccess: async () => {
      toast.success("Documento enviado."); formRef.current?.reset(); setFileName(""); setRules([]);
      await queryClient.invalidateQueries({ queryKey: ["admin-documents"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });
  const saveRulesMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch(`/api/admin/documents/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ access_logic: "or", access_rules: editRules }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível atualizar as regras.");
    },
    onSuccess: async () => { toast.success("Regras de acesso atualizadas."); setEditing(null); await queryClient.invalidateQueries({ queryKey: ["admin-documents"] }); },
    onError: (error: Error) => toast.error(error.message),
  });
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiFetch(`/api/admin/documents/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível excluir o documento.");
    },
    onSuccess: async () => { toast.success("Documento excluído."); await queryClient.invalidateQueries({ queryKey: ["admin-documents"] }); },
    onError: (error: Error) => toast.error(error.message),
  });
  const uploadRules: RulesState = { rules, set: setRules, prefix: "up" };
  const drawerRules: RulesState = { rules: editRules, set: setEditRules, prefix: "ed" };
  function renderJoin(join: "and" | "or", onChange: (value: "and" | "or") => void, label: string) {
    return <div className="document-join-control"><div role="group" aria-label={label} className="document-join-toggle">
      {(["and", "or"] as const).map((value) => <button key={value} type="button" className={join === value ? "active" : ""} aria-pressed={join === value} onClick={() => onChange(value)}>{value === "and" ? "E" : "OU"}</button>)}
    </div></div>;
  }
  function renderRules({ rules, set, prefix }: RulesState) {
    const addRule = () => set((current) => [...current, { ...newRule(), join: "and" }]);
    const updateRule = (index: number, rule: DocumentAccessRule) => set((current) => current.map((item, i) => i === index ? rule : item));
    const changeJoin = (index: number, join: "and" | "or") => set((current) => current.map((item, i) => i === index ? { ...item, join } : item));
    return <div className="document-rules-editor">
      <div className="document-rules-heading"><strong>Requisitos de acesso</strong><details className="document-rules-help"><summary aria-label="Ajuda sobre requisitos de acesso" title="Como funcionam os requisitos"><CircleHelp size={18} /></summary><div className="document-rules-help-card"><strong>Como funcionam os requisitos</strong><p>Sem requisitos, qualquer membro aprovado pode acessar o documento.</p><ul><li>Patente mínima libera para essa patente e as superiores.</li><li>Graduação mínima vale para a modalidade escolhida e graduações superiores.</li><li><b>E</b> exige que a pessoa cumpra os dois requisitos conectados.</li><li><b>OU</b> libera quando a pessoa cumpre qualquer um dos requisitos conectados.</li></ul><p>Quando há mais de uma combinação, <b>E</b> é avaliado antes de <b>OU</b>. Exemplo: Major E Cavaleiro de Ouro OU General libera para Major com essa graduação ou para qualquer General.</p></div></details></div>
      {rules.map((rule, index) => <div className="document-rule-wrap" key={index}>
        {index > 0 && renderJoin(rule.join ?? "and", (value) => changeJoin(index, value), `Como combinar o requisito ${index + 1} com o anterior`)}
        <section className="document-rule-card">
          <header><span className="document-rule-icon">{rule.kind === "rank" ? <Shield size={19} /> : <Award size={19} />}</span><div><strong>Requisito {index + 1}</strong><small>{rule.kind === "rank" ? "Patente" : "Graduação"}</small></div><button className="document-rule-remove" type="button" onClick={() => set((current) => current.filter((_, i) => i !== index))} aria-label={`Remover requisito ${index + 1}`}><X size={17} /></button></header>
          <div className={`document-rule-fields ${rule.kind === "rank" ? "rank" : "graduation"}`}>
            <div className="field"><label htmlFor={`rule-${prefix}-kind-${index}`}>Tipo de requisito</label><Select id={`rule-${prefix}-kind-${index}`} value={rule.kind} options={[{ value: "rank", label: "Patente mínima" }, { value: "graduation", label: "Graduação mínima" }]} onChange={(value) => updateRule(index, value === "rank" ? { ...newRule(), join: rule.join } : { kind: "graduation", track: "cavalaria", minimum_graduation: "bronze", join: rule.join })} /></div>
            {rule.kind === "rank" ? <div className="field"><label htmlFor={`rule-${prefix}-rank-${index}`}>Patente mínima</label><Select id={`rule-${prefix}-rank-${index}`} value={rule.minimum_rank} options={rankGroups.flatMap((group) => group.ranks.map((item) => ({ value: item.value, label: item.label, group: group.category })))} onChange={(value) => updateRule(index, { ...rule, minimum_rank: value as DkRank })} /></div> : <>
              <div className="field"><label htmlFor={`rule-${prefix}-track-${index}`}>Modalidade</label><Select id={`rule-${prefix}-track-${index}`} value={rule.track} options={[{ value: "cavalaria", label: "Cavalaria" }, { value: "arquearia", label: "Arquearia" }]} onChange={(value) => updateRule(index, { ...rule, track: value as DocumentTrack })} /></div>
              <div className="field"><label htmlFor={`rule-${prefix}-graduation-${index}`}>Graduação mínima</label><Select id={`rule-${prefix}-graduation-${index}`} value={rule.minimum_graduation} options={graduationOptions.filter((item) => item.value !== "sem_graduacao").map((item) => ({ value: item.value, label: item.label }))} onChange={(value) => updateRule(index, { ...rule, minimum_graduation: value as GraduationLevel })} /></div>
            </>}
          </div>
        </section>
      </div>)}
      <button className="button button-ghost document-add-rule" type="button" onClick={addRule}><Plus aria-hidden="true" /> Adicionar requisito</button>
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
  async function remove(document: InternalDocument) {
    if (!(await confirm({ title: `Excluir «${document.title}»?`, message: "O arquivo é apagado permanentemente e deixa de aparecer para os membros.", confirmLabel: "Excluir documento", danger: true }))) return;
    removeMutation.mutate(document.id);
  }
  function startEdit(document: InternalDocument) {
    const savedRules = document.access_rules ?? [];
    setEditRules(savedRules.map((rule, index) => index === 0 ? rule : { ...rule, join: rule.join ?? document.access_logic ?? "or" }));
    setEditing(document.id);
  }
  const editingDocument = documents.find((document) => document.id === editing);
  return <div>
    <AdminTitle eyebrow="Conteúdo" title="Documentos" />
    <Panel title="Enviar documento" description="PDF de até 20 MB.">
    <form className="admin-form" onSubmit={upload} ref={formRef}>
      <section className="form-section">
        <FormSectionHead title="Arquivo" hint="Título e PDF que os membros vão abrir." />
        <div className="form-section-body">
          <div className="field"><label htmlFor="document-title">Título</label><input id="document-title" name="title" placeholder="Ex.: Manual de combate" required /></div>
          <div className="field"><span className="field-label" id="document-file-label">Arquivo PDF</span><label className="document-upload-zone" htmlFor="document-file"><FileUp size={23} /><span><strong>{fileName || "Selecione um arquivo PDF"}</strong><small>{fileName ? "Arquivo pronto para envio" : "PDF • máximo de 20 MB"}</small></span><span className="document-upload-action">Escolher arquivo</span><input id="document-file" name="file" type="file" accept="application/pdf,.pdf" aria-labelledby="document-file-label" onChange={(event) => setFileName(event.target.files?.[0]?.name ?? "")} required /></label></div>
          <div className="field"><label htmlFor="document-description">Descrição<span className="opt">opcional</span></label><textarea id="document-description" className="is-short" name="description" /></div>
        </div>
      </section>
      <section className="form-section">
        <FormSectionHead title="Acesso" hint="Sem requisitos, qualquer membro aprovado pode abrir o documento." />
        <div className="form-section-body">{renderRules(uploadRules)}</div>
      </section>
      <div className="form-actions"><button className="button button-primary" type="submit" disabled={uploadMutation.isPending}><Upload aria-hidden="true" /> {uploadMutation.isPending ? "Enviando…" : "Enviar PDF"}</button></div>
    </form>
    </Panel>
    {documentsQuery.isPending && <p className="empty-state" role="status">Carregando documentos…</p>}
    {documentsQuery.isError && <p className="empty-state" role="alert">Falha ao carregar documentos. <button className="text-button" onClick={() => void documentsQuery.refetch()}>Tentar novamente</button></p>}
    {documents.length ? <Panel title="Documentos enviados" description={`${documents.length} ${documents.length === 1 ? "documento" : "documentos"}`} flush>
      <ul className="document-admin-list">{documents.map((document) => <li key={document.id}>
        <FileText aria-hidden="true" />
        <div className="document-admin-text"><strong>{document.title}</strong><span>{accessLabel(document)}</span><small>{document.file_name}</small></div>
        <a className="icon-button" href={`/api/documents/${document.id}/download`} target="_blank" rel="noreferrer" title="Abrir" aria-label={`Abrir ${document.title}`}><ExternalLink aria-hidden="true" /></a>
        <RowMenu label={`Ações de ${document.title}`} items={[
          { label: "Editar acesso", icon: <Pencil />, onSelect: () => startEdit(document) },
          { label: "Excluir", icon: <Trash2 />, danger: true, disabled: removeMutation.isPending, onSelect: () => void remove(document) },
        ]} />
      </li>)}</ul>
    </Panel> : !documentsQuery.isPending && !documentsQuery.isError ? <div className="empty-state"><FileText /><h3>Nenhum documento enviado</h3></div> : null}
    {editingDocument && <Drawer
      title="Editar acesso"
      description={editingDocument.title}
      onClose={() => setEditing(null)}
      onSubmit={(event) => { event.preventDefault(); saveRules(editingDocument.id); }}
      footer={<><button className="button button-ghost" type="button" onClick={() => setEditing(null)}>Cancelar</button><button className="button button-primary" type="submit" disabled={saveRulesMutation.isPending}>{saveRulesMutation.isPending ? "Salvando…" : "Salvar regras"}</button></>}
    >{renderRules(drawerRules)}</Drawer>}
  </div>;
}
