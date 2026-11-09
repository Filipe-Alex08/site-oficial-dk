import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";
import { games } from "@/lib/content";
import { siteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const paths = ["", "/sobre", "/atividades/swordplay", "/atividades/tipos", "/atividades/jogos", "/atividades/graduacoes", "/eventos", "/midias"];
  const gamePaths = games.map((game) => `/atividades/jogos/${game.slug}`);
  const entries: MetadataRoute.Sitemap = [...paths, ...gamePaths].map((path) => ({ url: `${siteUrl}${path}` }));
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return entries;
  const client = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await client.from("posts").select("slug,published_at").eq("published", true).order("id").range(offset, offset + 999);
    if (error) throw new Error(`Sitemap: não foi possível consultar publicações (${error.code}).`);
    for (const post of data ?? []) entries.push({ url: `${siteUrl}/midias/${encodeURIComponent(post.slug)}`, lastModified: post.published_at });
    if (!data || data.length < 1000) break;
  }
  return entries;
}
