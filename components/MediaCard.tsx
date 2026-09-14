import Link from "next/link";
import { ArrowUpRight, CalendarDays, Image as ImageIcon } from "lucide-react";
import type { Post } from "@/lib/types";

export default function MediaCard({ post }: { post: Post }) {
  const date = new Date(post.published_at);
  return (
    <article className="media-card">
      <div className="media-cover">
        {post.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover_url} alt="" />
        ) : (
          <div className="media-placeholder"><ImageIcon size={42} /><span>DK</span></div>
        )}
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
