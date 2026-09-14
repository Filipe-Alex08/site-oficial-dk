"use client";

import { Film, Image as ImageIcon, Plus, Trash2 } from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { MediaItem, Post } from "@/lib/types";

export default function MediaGalleryManager({ posts }: { posts: Post[] }) {
  const supabase = useMemo(() => createClient(), []);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [postId, setPostId] = useState("");
  const [type, setType] = useState<"image" | "video">("image");
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    if (!supabase) return;
    const { data } = await supabase.from("media_items").select("*").order("sort_order");
    setItems((data || []) as MediaItem[]);
  }, [supabase]);

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.from("media_items").select("*").order("sort_order").then(({ data }) => {
      if (active) setItems((data || []) as MediaItem[]);
    });
    return () => { active = false; };
  }, [supabase]);

  const selectedPostId = postId || posts[0]?.id || "";

  async function add(event: FormEvent) {
    event.preventDefault();
    if (!supabase || !selectedPostId) return;
    const sort = items.filter((item) => item.post_id === selectedPostId).length;
    const { error } = await supabase.from("media_items").insert({
      post_id: selectedPostId,
      type,
      url,
      caption: caption || null,
      sort_order: sort,
    });
    setMessage(error ? error.message : "Mídia adicionada à publicação.");
    if (!error) { setUrl(""); setCaption(""); await load(); }
  }

  async function remove(id: string) {
    if (!supabase || !window.confirm("Remover este item da galeria?")) return;
    const { error } = await supabase.from("media_items").delete().eq("id", id);
    setMessage(error ? error.message : "Mídia removida.");
    await load();
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
                <label>Publicação</label>
                <select value={selectedPostId} onChange={(e) => setPostId(e.target.value)}>
                  {posts.map((post) => <option key={post.id} value={post.id}>{post.title}</option>)}
                </select>
              </div>
              <div className="field">
                <label>Tipo</label>
                <select value={type} onChange={(e) => setType(e.target.value as "image" | "video")}>
                  <option value="image">Imagem</option>
                  <option value="video">Vídeo</option>
                </select>
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
            <button className="button button-primary" type="submit"><Plus size={17} /> Adicionar mídia</button>
            {message && <p className="form-message success">{message}</p>}
          </form>
          <div className="gallery-admin-grid">
            {visible.map((item) => (
              <article key={item.id}>
                {item.type === "image" ? <ImageIcon /> : <Film />}
                <div><strong>{item.caption || (item.type === "image" ? "Imagem" : "Vídeo")}</strong><small>{item.url}</small></div>
                <button title="Excluir mídia" onClick={() => remove(item.id)}><Trash2 /></button>
              </article>
            ))}
            {!visible.length && <p className="empty-state">Nenhuma mídia vinculada a esta publicação.</p>}
          </div>
        </>
      ) : <p className="empty-state">Crie uma publicação antes de adicionar fotos ou vídeos.</p>}
    </section>
  );
}
