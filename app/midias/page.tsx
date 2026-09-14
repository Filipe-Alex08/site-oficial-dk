import type { Metadata } from "next";
import MediaCard from "@/components/MediaCard";
import PageHero from "@/components/PageHero";
import { demoPosts } from "@/lib/content";
import type { Post } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Mídias" };

export default async function MediaPage() {
  let posts: Post[] = demoPosts;
  const supabase = await createClient();
  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false });
    if (data?.length) posts = data as Post[];
  }

  return (
    <>
      <PageHero
        eyebrow="Registros do DK"
        title="Mídias"
        description="Acompanhe treinos, eventos, encontros e momentos da comunidade em uma linha do tempo."
        variant="events"
      />
      <section className="section">
        <div className="container media-feed">
          {posts.map((post) => (
            <MediaCard key={post.id} post={post} />
          ))}
        </div>
      </section>
    </>
  );
}
