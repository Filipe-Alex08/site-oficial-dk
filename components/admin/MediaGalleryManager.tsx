"use client";

import { Film, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import Select from "@/components/ui/Select";
import type { MediaItem, Post } from "@/lib/types";

export default function MediaGalleryManager({ posts }: { posts: Post[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [postId, setPostId] = useState("");
  const [type, setType] = useState<"image" | "video">("image");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");

  const queryClient = useQueryClient();
  const itemsQuery = useQuery({
    queryKey: ["admin-media-items"],
    enabled: Boolean(supabase),
    queryFn: async () => {
      if (!supabase) throw new Error("Banco não configurado.");
      const { data, error } = await supabase.from("media_items").select("*").order("sort_order");
      if (error) throw error;
      return (data ?? []) as MediaItem[];
    },
  });
  const items = itemsQuery.data ?? [];

  const selectedPostId = postId || posts[0]?.id || "";

  const addMutation = useMutation({
    mutationFn: async () => {
      if (!supabase || !selectedPostId) throw new Error("Selecione uma publicação.");
      const sort = items.filter((item) => item.post_id === selectedPostId).length;
      const { error } = await supabase.from("media_items").insert({ post_id: selectedPostId, type, url, caption: caption || null, sort_order: sort });
      if (error) throw error;
    },
    onSuccess: async () => {
      setMessage("Mídia adicionada à publicação."); setUrl(""); setCaption("");
      await queryClient.invalidateQueries({ queryKey: ["admin-media-items"] });
    },
    onError: (error: Error) => setMessage(error.message),
  });
  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!supabase) throw new Error("Banco não configurado.");
      const { error } = await supabase.from("media_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async () => { setMessage("Mídia removida."); await queryClient.invalidateQueries({ queryKey: ["admin-media-items"] }); },
    onError: (error: Error) => setMessage(error.message),
  });

  function add(event: FormEvent) {
    event.preventDefault();
    addMutation.mutate();
  }

  function remove(id: string) {
    if (!supabase || !window.confirm("Remover este item da galeria?")) return;
    removeMutation.mutate(id);
  }

  const visible = items.filter((item) => item.post_id === selectedPostId);

  return (
    <section className="gallery-manager">
      <div className="admin-title">
        <div><h3>Fotos e vídeos da publicação</h3><p>Vincule imagens e vídeos por URL ao conteúdo selecionado.</p></div>
      </div>
      {posts.length ? (
        <>
          <form className="admin-form compact" onSubmit={add}>
            <div className="form-grid">
              <div className="field field-full">
                <label htmlFor="gallery-post-select">Publicação</label>
                <Select id="gallery-post-select" value={selectedPostId} options={posts.map((post) => ({ value: post.id, label: post.title }))} onChange={setPostId} />
              </div>
              <div className="field">
                <label htmlFor="gallery-media-type">Tipo</label>
                <Select id="gallery-media-type" value={type} options={[{ value: "image", label: "Imagem" }, { value: "video", label: "Vídeo" }]} onChange={(value) => setType(value as "image" | "video")} />
              </div>
              <div className="field">
                <label>URL do arquivo</label>
                <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required />
              </div>
              <div className="field field-full">
                <label>Legenda</label>
                <input value={caption} onChange={(e) => setCaption(e.target.value)} />
              </div>
            </div>
            <button className="button button-primary" type="submit" disabled={addMutation.isPending}><Plus size={17} /> {addMutation.isPending ? "Adicionando…" : "Adicionar mídia"}</button>
            {message && <p className="form-message success">{message}</p>}
          </form>
          <div className="gallery-admin-grid">
            {visible.map((item) => (
              <article key={item.id}>
                {item.type === "image" ? <ImageIcon /> : <Film />}
                <div><strong>{item.caption || (item.type === "image" ? "Imagem" : "Vídeo")}</strong><small>{item.url}</small></div>
                <button title="Excluir mídia" disabled={removeMutation.isPending} onClick={() => remove(item.id)}>{removeMutation.isPending ? <span className="inline-spinner" /> : <Trash2 />}</button>
              </article>
            ))}
            {itemsQuery.isPending && <p className="empty-state" role="status">Carregando mídias…</p>}
            {itemsQuery.isError && <p className="empty-state" role="alert">Falha ao carregar mídias. <button className="text-button" onClick={() => void itemsQuery.refetch()}>Tentar novamente</button></p>}
            {!itemsQuery.isPending && !visible.length && <p className="empty-state">Nenhuma mídia vinculada a esta publicação.</p>}
          </div>
        </>
      ) : <p className="empty-state">Crie uma publicação antes de adicionar fotos ou vídeos.</p>}
    </section>
  );
}
