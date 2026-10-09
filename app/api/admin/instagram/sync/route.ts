import { NextResponse } from "next/server";
import { fetchInstagramPosts } from "@/lib/instagram-apify";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const maxDuration = 240;

type ScrapedPost = Awaited<ReturnType<typeof fetchInstagramPosts>>[number];

async function refreshExistingPost(admin: NonNullable<ReturnType<typeof createAdminClient>>, postId: string, currentPost: { cover_url: string | null; excerpt: string }, item: ScrapedPost) {
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

  if (coverChanged || excerptChanged) {
    const updates: { cover_url?: string; excerpt?: string } = {};
    if (coverChanged && item.coverUrl) updates.cover_url = item.coverUrl;
    if (excerptChanged) updates.excerpt = item.excerpt;
    const { error } = await admin.from("posts").update(updates).eq("id", postId);
    if (error) throw new Error(error.message);
  }
  return mediaChanged || coverChanged || excerptChanged;
}

function isDateOnly(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
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

async function syncInstagram(startDate?: string, endDate?: string) {
  const username = process.env.APIFY_INSTAGRAM_USERNAME?.replace(/^@/, "").trim();
  if (!username || !/^[a-zA-Z0-9._]{1,30}$/.test(username)) {
    return NextResponse.json({ error: "Configure APIFY_INSTAGRAM_USERNAME com o perfil público do Instagram." }, { status: 503 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "Configure SUPABASE_SECRET_KEY no servidor." }, { status: 503 });

  try {
    const allScraped = await fetchInstagramPosts(username);
    const scraped = startDate && endDate
      ? allScraped.filter((item) => {
        const publishedDate = saoPauloDate(item.publishedAt);
        return publishedDate >= startDate && publishedDate <= endDate;
      })
      : allScraped;
    let imported = 0;
    let refreshed = 0;
    let skipped = 0;
    const failures: string[] = [];
    const seenSourceIds = new Set<string>();
    const seenSourceUrls = new Set<string>();

    for (const item of scraped) {
      const sourceIdKey = item.sourceId.toLowerCase();
      const sourceUrlKey = item.sourceUrl.toLowerCase().replace(/\/$/, "");
      if (seenSourceIds.has(sourceIdKey) || seenSourceUrls.has(sourceUrlKey)) {
        skipped++;
        continue;
      }
      seenSourceIds.add(sourceIdKey);
      seenSourceUrls.add(sourceUrlKey);

      const findExisting = async (column: "source_id" | "source_url", value: string) => admin.from("posts")
        .select("id,cover_url,excerpt")
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
          if (await refreshExistingPost(admin, existing.data.id, existing.data, item)) refreshed++;
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
      }, { onConflict: "source,source_id", ignoreDuplicates: true })
        .select("id,source_id")
        .maybeSingle();

      if (error) {
        if (error.code === "23505") {
          const collision = await findExisting("source_url", item.sourceUrl);
          if (collision.data) {
            try {
              if (await refreshExistingPost(admin, collision.data.id, collision.data, item)) refreshed++;
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
            if (await refreshExistingPost(admin, collision.data.id, collision.data, item)) refreshed++;
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

    return NextResponse.json({ imported, refreshed, skipped, failed: failures.length, errors: failures.slice(0, 5) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Não foi possível sincronizar com o Apify.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

async function isMediaAdmin() {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase.from("user_admin_roles").select("role")
    .eq("user_id", user.id).in("role", ["principal", "midias"]);
  return Boolean(data?.length);
}

export async function POST(request: Request) {
  if (!await isMediaAdmin()) return NextResponse.json({ error: "Acesso permitido somente ao ADM Principal ou ADM de Mídias." }, { status: 403 });
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Informe a data inicial e final para importar." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || !("start" in body) || !("end" in body)
    || !isDateOnly(body.start) || !isDateOnly(body.end) || body.start > body.end) {
    return NextResponse.json({ error: "O intervalo de datas informado é inválido." }, { status: 400 });
  }
  return syncInstagram(body.start, body.end);
}

// Permite configurar um agendador externo com Authorization: Bearer <CRON_SECRET>.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  return syncInstagram();
}
