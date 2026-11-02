import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { fetchInstagramPosts } from "./instagram-apify";
import { compressInstagramVideo } from "./instagram-video";

export const INSTAGRAM_BUCKET = "instagram-media";
const MAX_BYTES = 50 * 1024 * 1024;
const MIME_EXTENSIONS: Record<string, string> = {
  "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
  "image/gif": "gif", "image/avif": "avif", "video/mp4": "mp4", "video/webm": "webm",
};

export class InstagramMediaArchiveError extends Error {
  constructor(message: string, public readonly coverUrl: string | null) {
    super(message);
  }
}

export async function ensureInstagramBucket(admin: SupabaseClient) {
  const { data, error } = await admin.storage.getBucket(INSTAGRAM_BUCKET);
  if (data) {
    if (!data.public) throw new Error("O bucket instagram-media precisa ser público.");
    return;
  }
  if (error && !["400", "404"].includes(String(error.statusCode))) throw new Error(error.message);
  const { error: createError } = await admin.storage.createBucket(INSTAGRAM_BUCKET, {
    public: true, fileSizeLimit: MAX_BYTES, allowedMimeTypes: Object.keys(MIME_EXTENSIONS),
  });
  if (createError) {
    // Another synchronization may have created the bucket concurrently.
    const { data: existing } = await admin.storage.getBucket(INSTAGRAM_BUCKET);
    if (!existing?.public) throw new Error(createError.message);
  }
}

function sourceUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.username || url.password || url.port
    || !["cdninstagram.com", "fbcdn.net"].some((host) => url.hostname.endsWith(`.${host}`))) {
    throw new Error("Origem de mídia do Instagram não permitida.");
  }
  return url;
}

async function download(value: string, type: "image" | "video") {
  let url = sourceUrl(value);
  const inputLimit = type === "video" ? 250 * 1024 * 1024 : MAX_BYTES;
  const signal = AbortSignal.timeout(type === "video" ? 120_000 : 60_000);
  for (let redirect = 0; redirect <= 3; redirect++) {
    const response = await fetch(url, { redirect: "manual", signal, cache: "no-store" });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (!location) throw new Error("Redirecionamento de mídia sem destino.");
      url = sourceUrl(new URL(location, url).href);
      continue;
    }
    if (!response.ok) {
      await response.body?.cancel();
      throw new Error(`Instagram retornou ${response.status}; obtenha links novos pela sincronização.`);
    }
    const contentType = response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() || "";
    if (!MIME_EXTENSIONS[contentType] || !contentType.startsWith(`${type}/`)) {
      await response.body?.cancel();
      throw new Error(`Formato de mídia não suportado: ${contentType || "desconhecido"}.`);
    }
    if (Number(response.headers.get("content-length")) > inputLimit) {
      await response.body?.cancel();
      throw new Error(`Mídia excede o limite de entrada de ${inputLimit / 1024 / 1024} MB.`);
    }
    if (!response.body) throw new Error("Mídia vazia.");
    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        size += chunk.byteLength;
        if (size > inputLimit) throw new Error(`Mídia excede o limite de entrada de ${inputLimit / 1024 / 1024} MB.`);
        chunks.push(chunk);
      }
    } finally {
      await reader.cancel();
    }
    if (!size) throw new Error("Mídia vazia.");
    const bytes = Buffer.concat(chunks);
    if (type === "video" && bytes.length > MAX_BYTES) {
      return { bytes: await compressInstagramVideo(bytes, MAX_BYTES), contentType: "video/mp4", extension: "mp4" };
    }
    return { bytes, contentType, extension: MIME_EXTENSIONS[contentType] };
  }
  throw new Error("Excesso de redirecionamentos na mídia.");
}

export async function archiveInstagramPost(
  admin: SupabaseClient,
  post: Awaited<ReturnType<typeof fetchInstagramPosts>>[number],
) {
  const bucket = admin.storage.from(INSTAGRAM_BUCKET);
  const folder = createHash("sha256").update(post.sourceId).digest("hex");
  const { data: files, error } = await bucket.list(folder, { limit: 1000 });
  if (error) throw new Error(error.message);
  const stored = new Set((files || []).map((file) => file.name));
  const pending = new Map<string, Promise<string>>();
  const archive = (value: string, type: "image" | "video"): Promise<string> => {
    const source = sourceUrl(value);
    // CDN hosts and signatures change; the asset's path identifies the same file.
    const key = createHash("sha256").update(`${type}:${source.pathname}`).digest("hex");
    const cached = pending.get(key);
    if (cached) return cached;
    const task = (async () => {
      const existing = [...stored].find((name) => name.startsWith(`${key}.`));
      if (existing) return bucket.getPublicUrl(`${folder}/${existing}`).data.publicUrl;
      const { bytes, contentType, extension } = await download(value, type);
      const path = `${folder}/${key}.${extension}`;
      const { error: uploadError } = await bucket.upload(path, bytes, {
        contentType, cacheControl: "31536000", upsert: false,
      });
      if (uploadError && String(uploadError.statusCode) !== "409") throw new Error(uploadError.message);
      return bucket.getPublicUrl(path).data.publicUrl;
    })();
    pending.set(key, task);
    return task;
  };
  // Save everything before the database is changed. Never replace permanent URLs
  // with expiring CDN URLs when a download or upload fails.
  const coverUrl = post.coverUrl ? await archive(post.coverUrl, "image") : null;
  const media = [];
  try {
    for (const item of post.media) media.push({ ...item, url: await archive(item.url, item.type) });
  } catch (error) {
    throw new InstagramMediaArchiveError(error instanceof Error ? error.message : "Falha na galeria.", coverUrl);
  }
  return { ...post, coverUrl, media };
}
