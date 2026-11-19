import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CalendarDays, ExternalLink, Film, Image as ImageIcon } from "lucide-react";
import { notFound } from "next/navigation";
import type { Post } from "@/lib/types";
import LiveRefresh from "@/components/LiveRefresh";
import MediaCard from "@/components/MediaCard";
import MediaGallery from "@/components/MediaGallery";
import ShareButton from "@/components/ShareButton";
import { formatPostDate, mediaCardColumns, mediaCountText, safeCssUrl, splitParagraphs, toCardData } from "@/lib/media-posts";
import { createPublicClient } from "@/lib/supabase/public";
import { cache, type CSSProperties } from "react";
import { pageMetadata, jsonLd, siteUrl, siteName, socialImage } from "@/lib/seo";

type Props = { params: Promise<{ slug: string }> };

// Gerada sob demanda na primeira visita e revalidada em segundo plano; o painel
// admin força a atualização via /api/admin/revalidate.
export const revalidate = 300;

export async function generateStaticParams() {
  const supabase = createPublicClient();
  if (!supabase) return [];
  try {
    const { data } = await supabase.from("posts").select("slug").eq("published", true).order("published_at", { ascending: false }).limit(100);
    return (data ?? []).map((post) => ({ slug: post.slug as string }));
  } catch {
    // Sem banco no build: as páginas passam a ser geradas na primeira visita.
    return [];
  }
}

const loadPost = cache(async (slug: string) => {
  const supabase = createPublicClient();
  if (!supabase) return undefined;

  const { data } = await supabase
    .from("posts")
    .select("*, media_items(*)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  return data ? data as Post : undefined;
});

// Outras publicações para o fim da página: da mesma categoria primeiro, depois as mais recentes.
const loadRelated = cache(async (id: string, category: string) => {
  const supabase = createPublicClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("posts")
    .select(mediaCardColumns)
    .eq("published", true)
    .neq("id", id)
    .order("published_at", { ascending: false })
    .limit(24);
  const cards = (data ?? []).map((post) => toCardData(post as unknown as Parameters<typeof toCardData>[0]));
  return [...cards.filter((card) => card.category === category), ...cards.filter((card) => card.category !== category)].slice(0, 3);
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

  const related = await loadRelated(post.id, post.category);
  const media = [...(post.media_items ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const photoCount = media.filter((item) => item.type === "image").length;
  const videoCount = media.length - photoCount;
  const countText = mediaCountText(photoCount, videoCount);
  const paragraphs = splitParagraphs(post.content);
  const heroImage = safeCssUrl(post.cover_url);

  return (
    <article>
      <LiveRefresh tables={["posts", "media_items"]} debounceMs={2000} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@graph": [
        { "@type": "Article", headline: post.title, description: post.excerpt || post.content.slice(0, 160), datePublished: post.published_at, image: new URL(post.cover_url || socialImage.url, siteUrl).href, mainEntityOfPage: `${siteUrl}/midias/${encodeURIComponent(post.slug)}`, inLanguage: "pt-BR", author: { "@type": "Organization", name: siteName, url: siteUrl }, publisher: { "@type": "Organization", name: siteName, url: siteUrl, logo: { "@type": "ImageObject", url: `${siteUrl}/images/dk-emblem.webp` } } },
        { "@type": "BreadcrumbList", itemListElement: [ { "@type": "ListItem", position: 1, name: "Início", item: siteUrl }, { "@type": "ListItem", position: 2, name: "Mídias", item: `${siteUrl}/midias` }, { "@type": "ListItem", position: 3, name: post.title, item: `${siteUrl}/midias/${encodeURIComponent(post.slug)}` } ] },
      ] }) }} />
      <section className="post-hero" style={heroImage ? { "--post-hero-image": heroImage } as CSSProperties : undefined}><div className="container post-hero-content">
        <Link className="back-link" href="/midias"><ArrowLeft size={17} aria-hidden="true" /> Voltar para Mídias</Link>
        <h1>{post.title}</h1>
        <div className="post-meta">
          <time className="media-date" dateTime={post.published_at}><CalendarDays size={16} aria-hidden="true" /> {formatPostDate(post.published_at)}</time>
          <span className="media-category is-inline">{post.category}</span>
          {countText && <span className="media-date">{videoCount && !photoCount ? <Film size={16} aria-hidden="true" /> : <ImageIcon size={16} aria-hidden="true" />} {countText}</span>}
        </div>
        <div className="post-actions">
          {post.source_url && <a className="button button-ghost button-small" href={post.source_url} target="_blank" rel="noreferrer">Ver no Instagram <ExternalLink size={16} aria-hidden="true" /></a>}
          <ShareButton title={post.title} />
        </div>
      </div></section>
      <section className="section"><div className="container post-layout"><div className="prose">
        {post.source !== "instagram" && post.excerpt && <p className="lead">{post.excerpt}</p>}
        {paragraphs.map((paragraph, index) => <p className="post-paragraph" key={index}>{paragraph}</p>)}
        {(post.youtube_url || post.tiktok_url) && <section aria-label="Vídeos em outras plataformas">
          <h2>Vídeos em outras plataformas</h2>
          <div className="post-links">
            {post.youtube_url && <a className="button button-ghost" href={post.youtube_url} target="_blank" rel="noopener noreferrer">Assistir no YouTube <ExternalLink size={16} aria-hidden="true" /></a>}
            {post.tiktok_url && <a className="button button-ghost" href={post.tiktok_url} target="_blank" rel="noopener noreferrer">Assistir no TikTok <ExternalLink size={16} aria-hidden="true" /></a>}
          </div>
        </section>}
        {media.length ? (<>
          <h2>Fotos e vídeos</h2>
          <MediaGallery
            title={post.title}
            poster={post.cover_url}
            postText={post.content}
            items={media.map((item) => ({ id: item.id, type: item.type, url: item.url, caption: item.caption }))}
          />
        </>) : null}
      </div></div></section>
      {related.length > 0 && <section className="section media-related" aria-labelledby="media-related-title"><div className="container">
        <h2 id="media-related-title">Mais publicações</h2>
        <div className="media-grid">{related.map((card) => <MediaCard key={card.id} post={card} headingLevel={3} />)}</div>
      </div></section>}
    </article>
  );
}
