import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import type { Post } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import { pageMetadata, jsonLd, siteUrl, siteName, socialImage } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

const loadPost = cache(async (slug: string) => {
  const supabase = await createClient();
  if (!supabase) return undefined;

  const { data } = await supabase
    .from("posts")
    .select("*, media_items(*)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  return data ? data as Post : undefined;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await loadPost(slug);
  if (!post) notFound();
  const path = `/midias/${encodeURIComponent(post.slug)}`;
  const description = (post.excerpt || post.content || `Publicação do ${siteName}: ${post.title}`).replace(/\s+/g, " ").trim().slice(0, 160);
  const image = post.cover_url || socialImage.url;
  return { ...pageMetadata(post.title, description, path),
    openGraph: { type: "article", locale: "pt_BR", siteName, title: post.title, description, url: path, publishedTime: post.published_at, images: [{ url: image, alt: post.title }] },
    twitter: { card: "summary_large_image", title: post.title, description, images: [image] },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await loadPost(slug);

  if (!post) notFound();

  return (
    <article>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@graph": [
        { "@type": "Article", headline: post.title, description: post.excerpt || post.content.slice(0, 160), datePublished: post.published_at, image: new URL(post.cover_url || socialImage.url, siteUrl).href, mainEntityOfPage: `${siteUrl}/midias/${encodeURIComponent(post.slug)}`, inLanguage: "pt-BR", author: { "@type": "Organization", name: siteName, url: siteUrl }, publisher: { "@type": "Organization", name: siteName, url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/images/dk-emblem.webp` } } },
        { "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Início", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Mídias", item: `${siteUrl}/midias` }, { "@type": "ListItem", position: 3, name: post.title, item: `${siteUrl}/midias/${encodeURIComponent(post.slug)}` } ] },
      ] }) }} />
      <section className="post-hero"><div className="container post-hero-content">
        <Link className="back-link" href="/midias"><ArrowLeft size={17} /> Voltar para Mídias</Link>
        <h1>{post.title}</h1>
        <p className="media-date"><CalendarDays size={16} /> {new Date(post.published_at).toLocaleDateString("pt-BR")}</p>
        {post.source_url && <a className="text-link" href={post.source_url} target="_blank" rel="noreferrer">Ver no Instagram <ExternalLink size={16} /></a>}
      </div></section>
      <section className="section"><div className="container post-layout"><div className="prose">
        {post.source !== "instagram" && post.excerpt && <p className="lead">{post.excerpt}</p>}
        {post.content && <p>{post.content}</p>}
        {(post.youtube_url || post.tiktok_url) && <section aria-label="Vídeos em outras plataformas">
          <h2>Vídeos em outras plataformas</h2>
          {post.youtube_url && <p><a className="text-link" href={post.youtube_url} target="_blank" rel="noopener noreferrer">Assistir no YouTube <ExternalLink size={16} /></a></p>}
          {post.tiktok_url && <p><a className="text-link" href={post.tiktok_url} target="_blank" rel="noopener noreferrer">Assistir no TikTok <ExternalLink size={16} /></a></p>}
        </section>}
        {post.media_items?.length ? (<>
          <h2>Fotos e vídeos</h2>
          <div className="media-gallery">{[...post.media_items].sort((a,b) => a.sort_order-b.sort_order).map((item, index) => (
            <figure className="gallery-item" key={item.id}>
              {item.type === "video" ? (
                <video controls preload="metadata" poster={post.cover_url || undefined} aria-label={item.caption || `Vídeo ${index + 1}`}>
                  <source src={item.url} />
                </video>
              ) : (
                <a href={item.url} target="_blank" rel="noreferrer" aria-label={`Abrir foto ${index + 1} no Instagram`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.url} alt={item.caption || `Foto ${index + 1}`} loading="lazy" />
                </a>
              )}
              {item.caption && item.caption !== post.content && <figcaption>{item.caption}</figcaption>}
            </figure>
          ))}</div>
        </>) : null}
      </div></div></section>
    </article>
  );
}
