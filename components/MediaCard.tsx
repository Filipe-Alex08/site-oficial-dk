import Link from "next/link";
import { ArrowUpRight, CalendarDays, Film, Image as ImageIcon } from "lucide-react";
import MediaCover from "@/components/MediaCover";
import { formatPostDate, mediaCountText, type MediaCardData } from "@/lib/media-posts";

/**
 * Cartão de publicação. O título é o único link, esticado sobre o cartão inteiro
 * (`.media-link::after`): clicar em qualquer ponto abre a publicação e o leitor de
 * tela ouve um link só, em vez de capa, título e "Ver publicação" separados.
 */
export default function MediaCard({ post, featured = false, headingLevel = 2 }: { post: MediaCardData; featured?: boolean; headingLevel?: 2 | 3 }) {
  const Heading = `h${headingLevel}` as "h2" | "h3";
  const total = post.imageCount + post.videoCount;
  const countText = mediaCountText(post.imageCount, post.videoCount);
  return (
    <article className={`media-card${featured ? " is-featured" : ""}`}>
      <div className="media-cover">
        <MediaCover key={post.imageUrl} title={post.title} coverUrl={post.imageUrl} videoUrl={post.videoUrl} alt="" />
        <span className="media-category">{post.category}</span>
        {total > 1 || post.videoCount > 0 ? <span className="media-count" title={countText}>
          {post.videoCount > 0 && !post.imageCount ? <Film size={14} aria-hidden="true" /> : <ImageIcon size={14} aria-hidden="true" />}
          <span aria-hidden="true">{total}</span>
          <span className="sr-only">{countText}</span>
        </span> : null}
      </div>
      <div className="media-body">
        {featured && <span className="media-featured-tag">Mais recente</span>}
        <time className="media-date" dateTime={post.publishedAt}><CalendarDays size={15} aria-hidden="true" /> {formatPostDate(post.publishedAt)}</time>
        <Heading className="media-title"><Link className="media-link" href={`/midias/${post.slug}`}>{post.title}</Link></Heading>
        {post.summary && <p className="media-excerpt">{post.summary}</p>}
        <span className="media-more" aria-hidden="true">Ver publicação <ArrowUpRight size={17} /></span>
      </div>
    </article>
  );
}
