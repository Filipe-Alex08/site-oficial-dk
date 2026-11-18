import { pageMetadata } from "@/lib/seo";
import { Image as ImageIcon } from "lucide-react";
import MediaCard from "@/components/MediaCard";
import PageHero from "@/components/PageHero";
import type { Post } from "@/lib/types";
import LiveRefresh from "@/components/LiveRefresh";
import { createPublicClient } from "@/lib/supabase/public";

// Página pública gerada uma vez e revalidada em segundo plano. Publicar ou editar
// uma mídia no painel chama /api/admin/revalidate para atualizar na hora.
export const revalidate = 300;

export const metadata = pageMetadata("Fotos e vídeos de Swordplay do DK", "Acompanhe fotos, vídeos e publicações de treinos, jogos e eventos do DK Death Knights e da comunidade de Swordplay em Belo Horizonte.", "/midias");

export default async function MediaPage() {
  let posts: Post[] = [];
  const supabase = createPublicClient();
  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select("*, media_items(*)")
      .eq("published", true)
      .order("published_at", { ascending: false });
    posts = (data ?? []) as Post[];
  }

  return (
    <>
      <LiveRefresh tables={["posts", "media_items"]} debounceMs={2000} />
      <PageHero
        title="Mídias"
        description="Treinos, eventos e encontros da comunidade."
        variant="events"
      />
      <section className="section">
        <div className="container media-feed">
          {!posts.length && (
            <div className="empty-state">
              <ImageIcon />
              <h2>Nenhuma publicação disponível</h2>
            </div>
          )}
          {posts.map((post) => (
            <MediaCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
