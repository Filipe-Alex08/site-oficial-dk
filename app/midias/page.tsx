import type { Metadata } from "next";
import MediaCard from "@/components/MediaCard";
import PageHero from "@/components/PageHero";
import { demoPosts } from "@/lib/content";

export const metadata: Metadata = { title: "Mídias" };

export default function MediaPage() {
  return (
    <>
      <PageHero eyebrow="Registros do DK" title="Mídias" description="Acompanhe treinos, eventos, encontros e momentos da comunidade em uma linha do tempo." />
      <section className="section">
        <div className="container media-feed">
          {demoPosts.map((post) => <MediaCard key={post.id} post={post} />)}
        </div>
      </section>
    </>
  );
}
