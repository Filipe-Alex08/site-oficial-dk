import { pageMetadata } from "@/lib/seo";
import MediaFeed from "@/components/MediaFeed";
import PageHero from "@/components/PageHero";
import LiveRefresh from "@/components/LiveRefresh";
import { createPublicClient } from "@/lib/supabase/public";
import { mediaCardColumns, toCardData, type MediaCardData } from "@/lib/media-posts";

// Página pública gerada uma vez e revalidada em segundo plano. Publicar ou editar
// uma mídia no painel chama /api/admin/revalidate para atualizar na hora.
export const revalidate = 300;

export const metadata = pageMetadata("Fotos e vídeos de Swordplay do DK", "Acompanhe fotos, vídeos e publicações de treinos, jogos e eventos do DK Death Knights e da comunidade de Swordplay em Belo Horizonte.", "/midias");

export default async function MediaPage() {
  let posts: MediaCardData[] = [];
  const supabase = createPublicClient();
  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select(mediaCardColumns)
      .eq("published", true)
      .order("published_at", { ascending: false });
    posts = (data ?? []).map((post) => toCardData(post as unknown as Parameters<typeof toCardData>[0]));
  }

  return (
    <>
      <LiveRefresh tables={["posts", "media_items"]} debounceMs={2000} />
      <PageHero
        title="Mídias"
        description="Fotos e vídeos dos treinos, batalhas e encontros."
        variant="events"
      />
      <section className="section">
        <div className="container">
          <MediaFeed posts={posts} />
        </div>
      </section>
    </>
  );
}
