import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Image as ImageIcon } from "lucide-react";
import { notFound } from "next/navigation";
import { demoPosts } from "@/lib/content";
import type { Post } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const local = demoPosts.find((item) => item.slug === slug);
  return { title: local?.title ?? "Publicação", description: local?.excerpt };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  let post: Post | undefined = demoPosts.find((item) => item.slug === slug);
  const supabase = await createClient();

  if (supabase) {
    const { data } = await supabase
      .from("posts")
      .select("*, media_items(*)")
      .eq("slug", slug)
      .eq("published", true)
      .maybeSingle();
    if (data) post = data as Post;
  }

  if (!post) notFound();

  return (
    <article>
      <section className="post-hero"><div className="container post-hero-content">
        <Link className="back-link" href="/midias"><ArrowLeft size={17} /> Voltar para Mídias</Link>
        <span className="media-category inline">{post.category}</span>
        <h1>{post.title}</h1>
        <p className="media-date"><CalendarDays size={16} /> {new Date(post.published_at).toLocaleDateString("pt-BR")}</p>
      </div></section>
      <section className="section"><div className="container post-layout"><div className="prose">
        <p className="lead">{post.excerpt}</p><p>{post.content}</p><h2>Fotos e vídeos</h2>
        {post.media_items?.length ? (
          <div className="media-gallery">{post.media_items.sort((a,b) => a.sort_order-b.sort_order).map((item) => (
            <a className="gallery-item" href={item.url} target="_blank" rel="noreferrer" key={item.id}>{item.caption || (item.type === "image" ? "Ver imagem" : "Assistir ao vídeo")}</a>
          ))}</div>
        ) : (
          <div className="empty-state"><ImageIcon /><h3>Galeria em preparação</h3><p>As fotos e os vídeos poderão ser adicionados pelo CMS.</p></div>
        )}
      </div></div></section>
    </article>
  );
}
