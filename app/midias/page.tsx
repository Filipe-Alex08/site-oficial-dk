import { pageMetadata } from "@/lib/seo";
import { Image as ImageIcon } from "lucide-react";
import MediaCard from "@/components/MediaCard";
import PageHero from "@/components/PageHero";
import type { Post } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";


export const metadata = pageMetadata("Fotos e vídeos de Swordplay do DK", "Acompanhe fotos, vídeos e publicações de treinos, jogos e eventos do DK Death Knights e da comunidade de Swordplay em Belo Horizonte.", "/midias");

export default async function MediaPage() {
  let posts: Post[] = [];
  const supabase = await createClient();
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
