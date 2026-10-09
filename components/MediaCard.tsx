import Link from "next/link";
import { ArrowUpRight, CalendarDays } from "lucide-react";
import type { Post } from "@/lib/types";
import MediaCover from "@/components/MediaCover";

export default function MediaCard({ post }: { post: Post }) {
  const date = new Date(post.published_at);
  const videoCover = !post.cover_url
    ? post.media_items?.find((item) => item.type === "video")?.url
    : null;
  return (
    <article className="media-card">
      <div className="media-cover">
        <MediaCover title={post.title} coverUrl={post.cover_url} videoUrl={videoCover} />
        <span className="media-category">{post.category}</span>
      </div>
      <div className="media-body">
        <span className="media-date"><CalendarDays size={15} /> {date.toLocaleDateString("pt-BR")}</span>
        <h2>{post.title}</h2>
        <p>{post.excerpt}</p>
        <Link className="text-link" href={"/midias/" + post.slug}>Ver publicação <ArrowUpRight size={17} /></Link>
      </div>
    </article>
  );
}
