import type { MediaItem, Post } from "@/lib/types";

const TIME_ZONE = "America/Sao_Paulo";

/** Colunas que a lista e os cartões precisam (evita trazer o texto completo e as mídias inteiras de cada post). */
export const mediaCardColumns = "id,slug,title,excerpt,content,category,cover_url,published_at,media_items(type,url,sort_order)";

/** Data fixa no fuso de Belo Horizonte: o servidor roda em UTC e, sem isso, a data muda de dia à noite. */
export function formatPostDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", { timeZone: TIME_ZONE });
}

/** O que o cartão de uma publicação mostra; é pequeno de propósito, pois a lista inteira vai para o navegador. */
export type MediaCardData = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  category: string;
  publishedAt: string;
  /** Imagem da capa; sem ela, a primeira foto da galeria. */
  imageUrl: string | null;
  /** Só usado para tirar um quadro do vídeo quando não há nenhuma imagem. */
  videoUrl: string | null;
  imageCount: number;
  videoCount: number;
};

type CardSource = Pick<Post, "id" | "slug" | "title" | "excerpt" | "content" | "category" | "cover_url" | "published_at"> & {
  media_items?: Pick<MediaItem, "type" | "url" | "sort_order">[] | null;
};

export function toCardData(post: CardSource): MediaCardData {
  const items = [...(post.media_items ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const images = items.filter((item) => item.type === "image");
  const videos = items.filter((item) => item.type === "video");
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    summary: (post.excerpt || post.content || "").replace(/\s+/g, " ").trim().slice(0, 240),
    category: post.category,
    publishedAt: post.published_at,
    imageUrl: post.cover_url || images[0]?.url || null,
    videoUrl: videos[0]?.url ?? null,
    imageCount: images.length,
    videoCount: videos.length,
  };
}

/** "3 fotos e 1 vídeo", para leitores de tela e legendas. */
export function mediaCountText(images: number, videos: number) {
  const parts: string[] = [];
  if (images) parts.push(`${images} ${images === 1 ? "foto" : "fotos"}`);
  if (videos) parts.push(`${videos} ${videos === 1 ? "vídeo" : "vídeos"}`);
  return parts.join(" e ");
}

/** Divide o texto em parágrafos nas linhas em branco; as quebras simples ficam para o CSS (`pre-line`). */
export function splitParagraphs(text: string) {
  return text.split(/\n\s*\n/).map((part) => part.trim()).filter(Boolean);
}

/** Só endereços http(s) entram em `url("…")` do CSS; o valor vem de um campo editável no painel. */
export function safeCssUrl(value?: string | null) {
  if (!value || !/^https?:\/\//i.test(value)) return null;
  return `url(${JSON.stringify(value)})`;
}
