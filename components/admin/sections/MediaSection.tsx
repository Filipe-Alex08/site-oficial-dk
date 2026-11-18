"use client";

import { ChevronDown, Download, Edit3, ExternalLink, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAdminData } from "@/components/admin/AdminDataContext";
import AdminTitle from "@/components/admin/AdminTitle";
import { useConfirm } from "@/components/admin/ConfirmProvider";
import FormSectionHead from "@/components/admin/FormSectionHead";
import MediaGalleryManager from "@/components/admin/MediaGalleryManager";
import TemplateBar from "@/components/admin/TemplateBar";
import { useToast } from "@/components/admin/ToastProvider";
import { useContentTemplates } from "@/components/admin/useContentTemplates";
import DataTable from "@/components/admin/ui/DataTable";
import Drawer from "@/components/admin/ui/Drawer";
import Panel from "@/components/admin/ui/Panel";
import RowMenu from "@/components/admin/ui/RowMenu";
import StatusBadge from "@/components/admin/ui/StatusBadge";
import InfoTip from "@/components/ui/InfoTip";
import Select from "@/components/ui/Select";
import { emptyPost, postFormHasContent, postFormToTemplate, slugify, templateToPostForm, type PostFormState } from "@/lib/content-templates";
import { friendlyError } from "@/lib/friendly-error";
import { revalidatePublicMedia } from "@/lib/revalidate-client";
import type { Post } from "@/lib/types";

type Quota = { used: number; limit: number; start: string | null; end: string | null };

function toDateInput(value: Date) {
  const local = new Date(value.getTime() - value.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

function defaultInstagramDateRange() {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 6);
  return { start: toDateInput(start), end: toDateInput(end) };
}

function formFromPost(post: Post): PostFormState {
  return { title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, category: post.category, cover_url: post.cover_url || "", youtube_url: post.youtube_url || "", tiktok_url: post.tiktok_url || "", published: post.published };
}

export default function MediaSection({ active }: { active: boolean }) {
  const { supabase, canMedia, posts, refetch } = useAdminData();
  const toast = useToast();
  const confirm = useConfirm();
  const [postForm, setPostForm] = useState<PostFormState>(emptyPost);
  // "Modo template": o formulário edita um template em vez de criar/editar uma publicação.
  const [editingPostTemplate, setEditingPostTemplate] = useState<{ id: string; name: string } | null>(null);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [postExtrasOpen, setPostExtrasOpen] = useState(false);
  const [postFormVersion, setPostFormVersion] = useState(0);
  const postTemplates = useContentTemplates("post", canMedia);
  const [syncingInstagram, setSyncingInstagram] = useState(false);
  const [instagramDateRange, setInstagramDateRange] = useState(defaultInstagramDateRange);
  const [selectedPostIds, setSelectedPostIds] = useState<Set<string>>(new Set());

  // A cota só é consultada enquanto a aba está à vista (e a cada 5 minutos).
  const quotaQuery = useQuery({
    queryKey: ["admin-instagram-quota"],
    enabled: active && canMedia,
    refetchInterval: 5 * 60 * 1000,
    gcTime: 0,
    queryFn: async (): Promise<Quota> => {
      const response = await fetch("/api/admin/instagram/quota", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Falha ao consultar a cota.");
      return result as Quota;
    },
  });
  const quota = quotaQuery.data ?? null;
  const loadingQuota = quotaQuery.isFetching;
  const quotaError = quotaQuery.isError ? friendlyError(quotaQuery.error, "Falha ao consultar a cota.") : "";
  const refreshQuota = () => quotaQuery.refetch();
  const quotaPercent = quota && quota.limit > 0 ? Math.min(100, Math.round(quota.used / quota.limit * 100)) : null;

  // Carrega o formulário e remonta o <details> de capa/links, que abre se houver conteúdo.
  function loadPostForm(form: PostFormState, target: { post?: string; template?: { id: string; name: string } } = {}) {
    setPostForm(form);
    setEditingPost(target.post ?? null);
    setEditingPostTemplate(target.template ?? null);
    setPostExtrasOpen(Boolean(form.cover_url || form.youtube_url || form.tiktok_url));
    setPostFormVersion((version) => version + 1);
  }

  function openNew() {
    // Se havia um rascunho em andamento, reabre nele; senão começa em branco.
    if (!drawerOpen && (editingPost || editingPostTemplate)) loadPostForm(emptyPost);
    setDrawerOpen(true);
  }

  function openEdit(post: Post) {
    loadPostForm(formFromPost(post), { post: post.id });
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
  }

  async function savePost(event: FormEvent) {
    event.preventDefault();
    if (!supabase) return;
    if (editingPostTemplate) {
      try {
        await postTemplates.update(editingPostTemplate.id, { data: postFormToTemplate(postForm) });
      } catch (error) {
        return toast.error(`Falha ao salvar o template: ${(error as Error).message}`);
      }
      toast.success(`Template «${editingPostTemplate.name}» atualizado.`);
      loadPostForm(emptyPost);
      return;
    }
    const payload = { ...postForm, slug: postForm.slug || slugify(postForm.title), cover_url: postForm.cover_url || null, youtube_url: postForm.youtube_url || null, tiktok_url: postForm.tiktok_url || null, published_at: new Date().toISOString() };
    const result = editingPost ? await supabase.from("posts").update(payload).eq("id", editingPost) : await supabase.from("posts").insert(payload);
    if (result.error) return toast.error(friendlyError(result.error));
    revalidatePublicMedia();
    loadPostForm(emptyPost);
    setDrawerOpen(false);
    toast.success("Publicação salva.");
    await refetch();
  }

  async function removePost(post: Post) {
    if (!supabase) return;
    if (!(await confirm({ title: "Excluir publicação?", message: `«${post.title}» será removida do site.`, confirmLabel: "Excluir", danger: true }))) return;
    const { error } = await supabase.from("posts").delete().eq("id", post.id);
    if (!error) revalidatePublicMedia();
    setSelectedPostIds((current) => { const next = new Set(current); next.delete(post.id); return next; });
    if (error) toast.error(friendlyError(error)); else toast.success("Publicação excluída.");
    await refetch();
  }

  function togglePostSelection(id: string) {
    setSelectedPostIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleAllPostSelection() {
    setSelectedPostIds((current) => current.size === posts.length ? new Set() : new Set(posts.map((post) => post.id)));
  }

  async function removeSelectedPosts() {
    if (!supabase || !selectedPostIds.size) return;
    const count = selectedPostIds.size;
    if (!(await confirm({ title: `Excluir ${count} ${count === 1 ? "publicação" : "publicações"}?`, message: "Esta ação não pode ser desfeita.", confirmLabel: "Excluir", danger: true }))) return;
    const { error } = await supabase.from("posts").delete().in("id", Array.from(selectedPostIds));
    if (!error) { setSelectedPostIds(new Set()); revalidatePublicMedia(); }
    if (error) toast.error(friendlyError(error)); else toast.success(`${count} publicação(ões) excluída(s).`);
    await refetch();
  }

  async function syncInstagram() {
    if (!instagramDateRange.start || !instagramDateRange.end || instagramDateRange.start > instagramDateRange.end) {
      return toast.error("Selecione um intervalo de datas válido.");
    }
    setSyncingInstagram(true);
    try {
      const response = await fetch("/api/admin/instagram/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(instagramDateRange),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível sincronizar o Instagram.");
      revalidatePublicMedia();
      toast.success(`${result.imported} nova(s), ${result.refreshed || 0} atualizada(s) e ${result.skipped} sem alteração.${result.failed ? ` Falhas: ${result.failed}.` : ""}`);
      await refetch();
    } catch (error) {
      toast.error(friendlyError(error, "Não foi possível sincronizar o Instagram."));
    } finally {
      setSyncingInstagram(false);
      void refreshQuota();
    }
  }

  const drawerTitle = editingPostTemplate ? `Editar template «${editingPostTemplate.name}»` : editingPost ? "Editar publicação" : "Nova publicação";

  return <div>
    <AdminTitle
      eyebrow="Conteúdo"
      title="Mídias"
      description="Publicações do site, importação do Instagram e galerias de fotos e vídeos."
      action={<button className="button button-primary" type="button" onClick={openNew}><Plus size={18} /> Nova publicação</button>}
    />

    <details className="import-strip">
      <summary>
        <span className="import-strip-title"><Download size={17} aria-hidden="true" /> Importar do Instagram</span>
        <span className="import-strip-meta">
          {quotaPercent !== null && <><span className="import-strip-bar" aria-hidden="true"><span style={{ width: `${quotaPercent}%` }} /></span>{quotaPercent}% da cota</>}
          {quotaPercent === null && quota && `US$ ${quota.used.toFixed(2)} usados`}
        </span>
        <ChevronDown className="import-strip-chevron" aria-hidden="true" />
      </summary>
      <div className="admin-panel-grid import-strip-body">
        <Panel
          title="Cota de importação"
          description="Consumo mensal da importação do Instagram."
          actions={<button className="apify-quota-refresh" type="button" onClick={() => void refreshQuota()} disabled={loadingQuota}><RefreshCw size={14} className={loadingQuota ? "spin" : ""} />{loadingQuota ? "Consultando…" : "Atualizar"}</button>}
        >
          {quotaError && <p className="apify-quota-error" role="alert">{quotaError}</p>}
          {quota
            ? <div className="apify-quota-metric">
              <div className="apify-quota-values"><div><span>Utilizado neste ciclo</span><strong>US$ {quota.used.toFixed(2)}</strong></div><div><span>Limite mensal</span><strong>{quota.limit > 0 ? `US$ ${quota.limit.toFixed(2)}` : "Indisponível"}</strong></div></div>
              {quota.limit > 0 && <div className="apify-quota-progress" role="progressbar" aria-label="Cota mensal utilizada" aria-valuenow={quotaPercent ?? 0} aria-valuemin={0} aria-valuemax={100}><span style={{ width: `${Math.min(100, Math.max(0, quota.used / quota.limit * 100))}%` }} /></div>}
              <div className="apify-quota-footer"><span>{quota.limit > 0 ? `${quotaPercent}% do limite utilizado` : "Limite não informado pela Apify"}</span>{quota.start && quota.end && <span>Ciclo: {new Date(quota.start).toLocaleDateString("pt-BR")} a {new Date(quota.end).toLocaleDateString("pt-BR")}</span>}</div>
            </div>
            : !quotaError && <p className="apify-quota-empty">{loadingQuota ? "Consultando a cota…" : "Cota ainda não consultada."}</p>}
        </Panel>
        <Panel title={<span className="title-tip">Importar do Instagram<InfoTip label="Mais informações sobre a importação">Traz as publicações do período escolhido.</InfoTip></span>}>
          <div className="instagram-import-controls">
            <div className="field"><label htmlFor="instagram-start-date">De</label><input id="instagram-start-date" type="date" value={instagramDateRange.start} max={instagramDateRange.end} onChange={(event) => setInstagramDateRange({ ...instagramDateRange, start: event.target.value })} /></div>
            <div className="field"><label htmlFor="instagram-end-date">Até</label><input id="instagram-end-date" type="date" value={instagramDateRange.end} min={instagramDateRange.start} onChange={(event) => setInstagramDateRange({ ...instagramDateRange, end: event.target.value })} /></div>
            <button className="button button-ghost" type="button" onClick={() => void syncInstagram()} disabled={syncingInstagram}>
              <RefreshCw size={17} className={syncingInstagram ? "spin" : ""} />
              {syncingInstagram ? "Buscando publicações…" : "Importar do Instagram"}
            </button>
          </div>
        </Panel>
      </div>
    </details>

    <Panel
      title="Publicações"
      description={`${posts.length} ${posts.length === 1 ? "publicação" : "publicações"}`}
      flush
      actions={<label className="check-field"><input type="checkbox" checked={posts.length > 0 && selectedPostIds.size === posts.length} onChange={toggleAllPostSelection} /> Selecionar todas</label>}
    >
      <DataTable
        rows={posts}
        rowKey={(post) => post.id}
        empty="Nenhuma publicação ainda."
        caption="Publicações do site"
        rowClassName={(post) => selectedPostIds.has(post.id) ? "is-selected" : undefined}
        columns={[
          { key: "select", header: "Selecionar", srOnlyHeader: true, className: "is-select", render: (post) => <input type="checkbox" aria-label={`Selecionar ${post.title}`} checked={selectedPostIds.has(post.id)} onChange={() => togglePostSelection(post.id)} /> },
          { key: "post", header: "Publicação", hideLabel: true, className: "is-lead", render: (post) => <><strong>{post.title}</strong><small>/midias/{post.slug}</small></> },
          { key: "category", header: "Categoria", render: (post) => post.category },
          { key: "status", header: "Situação", render: (post) => <StatusBadge status={post.published ? "aprovado" : "pendente"} label={post.published ? "Publicada" : "Rascunho"} /> },
          {
            key: "actions", header: "Ações", srOnlyHeader: true, className: "row-actions",
            render: (post) => <RowMenu label={`Ações de ${post.title}`} items={[
              { label: "Editar", icon: <Edit3 />, onSelect: () => openEdit(post) },
              { label: "Ver no site", icon: <ExternalLink />, hidden: !post.published, onSelect: () => { window.open(`/midias/${post.slug}`, "_blank", "noopener"); } },
              { label: "Excluir", icon: <Trash2 />, danger: true, onSelect: () => void removePost(post) },
            ]} />,
          },
        ]}
      />
    </Panel>

    <MediaGalleryManager posts={posts} />

    {selectedPostIds.size > 0 && active && <div className="bulk-bar" role="region" aria-label="Ações em lote">
      <strong>{selectedPostIds.size} {selectedPostIds.size === 1 ? "selecionada" : "selecionadas"}</strong>
      <button className="button button-ghost button-small" type="button" onClick={() => setSelectedPostIds(new Set())}><X size={16} /> Limpar</button>
      <button className="button button-danger button-small" type="button" onClick={() => void removeSelectedPosts()}><Trash2 size={16} /> Excluir</button>
    </div>}

    {drawerOpen && active && <Drawer
      title={drawerTitle}
      description={editingPostTemplate ? undefined : "Texto, categoria e capa da publicação."}
      onClose={closeDrawer}
      onSubmit={savePost}
      headerExtra={editingPostTemplate
        ? <p className="template-mode-note" role="status">Você está editando um template: nada aqui cria ou altera uma publicação. Os campos podem ficar em branco.</p>
        : <TemplateBar
          kind="post"
          store={postTemplates}
          currentData={postFormToTemplate(postForm)}
          hasContent={postFormHasContent(postForm)}
          onApply={(template) => {
            // Em uma publicação já existente, o endereço e a situação não mudam por causa do template.
            const next = templateToPostForm(template.data);
            loadPostForm(editingPost ? { ...next, slug: postForm.slug, published: postForm.published } : next, editingPost ? { post: editingPost } : {});
            toast.success("Template aplicado.");
          }}
          onEdit={(template) => loadPostForm(templateToPostForm(template.data), { template: { id: template.id, name: template.name } })}
        />}
      footer={<>
        <button className="button button-ghost" type="button" onClick={() => { loadPostForm(emptyPost); closeDrawer(); }}>Cancelar</button>
        <button className="button button-primary" type="submit">{editingPostTemplate ? "Salvar template" : editingPost ? "Salvar alterações" : "Criar publicação"}</button>
      </>}
    >
      <div className="admin-form">
        <section className="form-section">
          <FormSectionHead title="Texto" hint="O que aparece na página da publicação." />
          <div className="form-section-body">
            <div className="field">
              <label htmlFor="post-title">Título</label>
              <input id="post-title" value={postForm.title} onChange={(event) => setPostForm({ ...postForm, title: event.target.value, slug: slugify(event.target.value) })} required={!editingPostTemplate} />
            </div>
            <div className="field"><label htmlFor="post-excerpt">Resumo</label><textarea id="post-excerpt" className="is-short" value={postForm.excerpt} onChange={(event) => setPostForm({ ...postForm, excerpt: event.target.value })} required={!editingPostTemplate && posts.find((post) => post.id === editingPost)?.source !== "instagram"} /></div>
            <div className="field"><label htmlFor="post-content">Conteúdo</label><textarea id="post-content" value={postForm.content} onChange={(event) => setPostForm({ ...postForm, content: event.target.value })} required={!editingPostTemplate} /></div>
          </div>
        </section>
        <section className="form-section">
          <FormSectionHead title="Publicação" hint="Onde a publicação entra e quando fica visível." />
          <div className="form-section-body">
            <div className="field"><label htmlFor="post-category">Categoria</label><Select id="post-category" value={postForm.category} options={["Treinos", "Eventos", "Encontros", "Comunicados"].map((value) => ({ value, label: value }))} onChange={(value) => setPostForm({ ...postForm, category: value })} /></div>
            {!editingPostTemplate && <label className="switch-field"><span><strong>Publicar agora</strong></span><input type="checkbox" checked={postForm.published} onChange={(event) => setPostForm({ ...postForm, published: event.target.checked })} /></label>}
            <details className="form-more" key={`${editingPost ?? editingPostTemplate?.id ?? "nova"}-${postFormVersion}`} open={postExtrasOpen}>
              <summary><span>Capa e links<small>opcional</small></span><ChevronDown aria-hidden="true" /></summary>
              <div className="form-more-body">
                <div className="field"><label htmlFor="post-cover">Imagem de capa<span className="opt">URL</span></label><input id="post-cover" type="url" inputMode="url" placeholder="https://" value={postForm.cover_url} onChange={(event) => setPostForm({ ...postForm, cover_url: event.target.value })} /></div>
                <div className="field"><label htmlFor="post-youtube">YouTube<span className="opt">URL</span></label><input id="post-youtube" type="url" inputMode="url" placeholder="https://" value={postForm.youtube_url} onChange={(event) => setPostForm({ ...postForm, youtube_url: event.target.value })} /></div>
                <div className="field"><label htmlFor="post-tiktok">TikTok<span className="opt">URL</span></label><input id="post-tiktok" type="url" inputMode="url" placeholder="https://" value={postForm.tiktok_url} onChange={(event) => setPostForm({ ...postForm, tiktok_url: event.target.value })} /></div>
                {!editingPostTemplate && <div className="field"><label htmlFor="post-slug">Endereço personalizado</label><input id="post-slug" value={postForm.slug} onChange={(event) => setPostForm({ ...postForm, slug: event.target.value })} /><p className="field-hint">Gerado a partir do título. Só altere se precisar.</p></div>}
              </div>
            </details>
          </div>
        </section>
      </div>
    </Drawer>}
  </div>;
}
