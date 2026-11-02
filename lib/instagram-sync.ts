import { fetchInstagramPosts } from "./instagram-apify";
import { createAdminClient } from "./supabase/admin";
import { archiveInstagramPost, ensureInstagramBucket, InstagramMediaArchiveError } from "./instagram-storage";

type ScrapedPost = Awaited<ReturnType<typeof fetchInstagramPosts>>[number];

async function refreshExistingPost(admin: NonNullable<ReturnType<typeof createAdminClient>>, postId: string, currentPost: { cover_url: string | null; excerpt: string; youtube_url: string | null; tiktok_url: string | null }, item: ScrapedPost, hasVideoLinks: boolean) {
  const { data: currentMedia, error: readError } = await admin.from("media_items")
    .select("type,url,caption,sort_order")
    .eq("post_id", postId)
    .order("sort_order");
  if (readError) throw new Error(readError.message);

  const currentKey = (currentMedia || []).map(({ type, url }) => `${type}:${url}`).sort().join("\n");
  const nextKey = item.media.map(({ type, url }) => `${type}:${url}`).sort().join("\n");
  const mediaChanged = currentKey !== nextKey;
  const coverChanged = Boolean(item.coverUrl && item.coverUrl !== currentPost.cover_url);
  const excerptChanged = currentPost.excerpt !== item.excerpt;
  const linksChanged = hasVideoLinks && Boolean((item.youtubeUrl && currentPost.youtube_url !== item.youtubeUrl) || (item.tiktokUrl && currentPost.tiktok_url !== item.tiktokUrl));

  if (mediaChanged) {
    const { error: deleteError } = await admin.from("media_items").delete().eq("post_id", postId);
    if (deleteError) throw new Error(deleteError.message);
    const { error: insertError } = await admin.from("media_items").insert(item.media.map((media, sort_order) => ({
      post_id: postId,
      type: media.type,
      url: media.url,
      caption: media.caption,
      sort_order,
    })));
    if (insertError) {
      if (currentMedia?.length) await admin.from("media_items").insert(currentMedia.map((media) => ({ ...media, post_id: postId })));
      throw new Error(insertError.message);
    }
  }

  if (coverChanged || excerptChanged || linksChanged) {
    const updates: { cover_url?: string; excerpt?: string; youtube_url?: string | null; tiktok_url?: string | null } = {};
    if (coverChanged && item.coverUrl) updates.cover_url = item.coverUrl;
    if (excerptChanged) updates.excerpt = item.excerpt;
    if (hasVideoLinks && item.youtubeUrl && currentPost.youtube_url !== item.youtubeUrl) updates.youtube_url = item.youtubeUrl;
    if (hasVideoLinks && item.tiktokUrl && currentPost.tiktok_url !== item.tiktokUrl) updates.tiktok_url = item.tiktokUrl;
    const { error } = await admin.from("posts").update(updates).eq("id", postId);
    if (error) throw new Error(error.message);
  }
  return mediaChanged || coverChanged || excerptChanged || linksChanged;
}

function saoPauloDate(value: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(value));
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export async function syncInstagram(startDate?: string, endDate?: string, collectedPosts?: ScrapedPost[]) {
  const username = process.env.APIFY_INSTAGRAM_USERNAME?.replace(/^@/, "").trim();
  if (!username || !/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
    throw new Error("Configure APIFY_INSTAGRAM_USERNAME com o perfil público do Instagram.");
  }

  const admin = createAdminClient();
  if (!admin) throw new Error("Configure SUPABASE_SECRET_KEY no servidor.");

  try {
    // Older installations may not have the optional social-video columns yet.
    const { error: videoColumnsError } = await admin.from("posts").select("youtube_url,tiktok_url").limit(0);
    const hasVideoLinks = !videoColumnsError;
    if (videoColumnsError && videoColumnsError.code !== "42703") throw new Error(videoColumnsError.message);
    await ensureInstagramBucket(admin);
    const allScraped = collectedPosts ?? await fetchInstagramPosts(username);
    const scraped = startDate && endDate
      ? allScraped.filter((item) => {
        const publishedDate = saoPauloDate(item.publishedAt);
        return publishedDate >= startDate && publishedDate <= endDate;
      })
      : allScraped;
    let imported = 0;
    let refreshed = 0;
    let skipped = 0;
    let coversRecovered = 0;
    const failures: string[] = [];
    const seenSourceIds = new Set<string>();
    const seenSourceUrls = new Set<string>();

    for (const scrapedItem of scraped) {
      let item: ScrapedPost;
      try {
        item = await archiveInstagramPost(admin, scrapedItem);
      } catch (error) {
        if (error instanceof InstagramMediaArchiveError && error.coverUrl) {
          // An oversized video must not prevent an existing post's thumbnail
          // from being repaired. Keep its gallery unchanged and report the failure.
          const { data: repaired, error: repairError } = await admin.from("posts")
            .update({ cover_url: error.coverUrl }).eq("source", "instagram")
            .eq("source_id", scrapedItem.sourceId).select("id");
          if (repairError) failures.push(`${scrapedItem.sourceId}: ${repairError.message}`);
          else coversRecovered += repaired?.length || 0;
        }
        failures.push(`${scrapedItem.sourceId}: ${error instanceof Error ? error.message : "Falha ao armazenar a mídia."}`);
        continue;
      }
      const sourceIdKey = item.sourceId.toLowerCase();
      const sourceUrlKey = item.sourceUrl.toLowerCase().replace(/\/$/, "");
      if (seenSourceIds.has(sourceIdKey) || seenSourceUrls.has(sourceUrlKey)) {
        skipped++;
        continue;
      }
      seenSourceIds.add(sourceIdKey);
      seenSourceUrls.add(sourceUrlKey);

      const findExisting = async (column: "source_id" | "source_url", value: string) => admin.from("posts")
        .select("*")
        .eq("source", "instagram")
        .eq(column, value)
        .maybeSingle();

      let existing = await findExisting("source_id", item.sourceId);
      if (existing.error) {
        failures.push(`${item.sourceId}: ${existing.error.message}`);
        continue;
      }
      if (!existing.data) {
        existing = await findExisting("source_url", item.sourceUrl);
        if (existing.error) {
          failures.push(`${item.sourceId}: ${existing.error.message}`);
          continue;
        }
      }
      if (existing.data) {
        try {
          if (await refreshExistingPost(admin, existing.data.id, existing.data, item, hasVideoLinks)) refreshed++;
          else skipped++;
        } catch (error) {
          failures.push(`${item.sourceId}: ${error instanceof Error ? error.message : "Falha ao atualizar a galeria."}`);
        }
        continue;
      }

      const { data: post, error } = await admin.from("posts").upsert({
        title: item.title,
        slug: `instagram-${item.sourceId.toLowerCase()}`,
        excerpt: item.excerpt,
        content: item.content,
        category: "Instagram",
        cover_url: item.coverUrl,
        published: true,
        published_at: item.publishedAt,
        source: "instagram",
        source_id: item.sourceId,
        source_url: item.sourceUrl,
        ...(hasVideoLinks ? { youtube_url: item.youtubeUrl, tiktok_url: item.tiktokUrl } : {}),
      }, { onConflict: "source,source_id", ignoreDuplicates: true })
        .select("id,source_id")
        .maybeSingle();

      if (error) {
        if (error.code === "23505") {
          const collision = await findExisting("source_url", item.sourceUrl);
          if (collision.data) {
            try {
              if (await refreshExistingPost(admin, collision.data.id, collision.data, item, hasVideoLinks)) refreshed++;
              else skipped++;
            } catch (refreshError) {
              failures.push(`${item.sourceId}: ${refreshError instanceof Error ? refreshError.message : "Falha ao atualizar a galeria."}`);
            }
            continue;
          }
          skipped++;
          continue;
        }
        failures.push(`${item.sourceId}: ${error.message}`);
        continue;
      }
      if (!post) {
        const collision = await findExisting("source_id", item.sourceId);
        if (collision.data) {
          try {
            if (await refreshExistingPost(admin, collision.data.id, collision.data, item, hasVideoLinks)) refreshed++;
            else skipped++;
          } catch (refreshError) {
            failures.push(`${item.sourceId}: ${refreshError instanceof Error ? refreshError.message : "Falha ao atualizar a galeria."}`);
          }
        } else skipped++;
        continue;
      }

      const { error: mediaError } = await admin.from("media_items").insert(item.media.map((media, sort_order) => ({
        post_id: post.id,
        type: media.type,
        url: media.url,
        caption: media.caption,
        sort_order,
      })));
      if (mediaError) {
        await admin.from("posts").delete().eq("id", post.id);
        failures.push(`${item.sourceId}: ${mediaError.message}`);
        continue;
      }
      imported++;
    }

    return { imported, refreshed, coversRecovered, skipped, failed: failures.length, errors: failures.slice(0, 5) };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível sincronizar com o Apify.";
    throw new Error(message);
  }
}

