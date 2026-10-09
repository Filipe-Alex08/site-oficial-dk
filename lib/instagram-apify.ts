export type InstagramScrapedPost = {
  id?: string | number;
  shortCode?: string;
  shortcode?: string;
  type?: string;
  caption?: string;
  displayUrl?: string;
  imageUrl?: string;
  videoUrl?: string;
  images?: Array<string | { url?: string; displayUrl?: string; imageUrl?: string; videoUrl?: string; isVideo?: boolean; type?: string }>;
  videos?: Array<string | { url?: string; videoUrl?: string }>;
  mediaAssets?: Array<{ url?: string; isVideo?: boolean }>;
  isVideo?: boolean;
  childPosts?: Array<{ displayUrl?: string; imageUrl?: string; videoUrl?: string; images?: Array<string | { url?: string }>; isVideo?: boolean; type?: string }>;
  timestamp?: string | number;
  takenAt?: string | number;
  takenAtIso?: string;
  url?: string;
  postUrl?: string;
  ownerUsername?: string;
  error?: string;
  errorDescription?: string;
};

export type ScrapedMedia = { type: "image" | "video"; url: string; caption: string | null };

function toUrl(value: unknown) {
  if (typeof value !== "string") return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function normalizePermalink(value: string | null, shortcode: string) {
  if (!value) return `https://www.instagram.com/p/${encodeURIComponent(shortcode)}/`;
  try {
    const url = new URL(value);
    if (url.hostname === "instagram.com" || url.hostname.endsWith(".instagram.com")) {
      url.hostname = "www.instagram.com";
      url.search = "";
      url.hash = "";
      url.pathname = `${url.pathname.replace(/\/+$/, "")}/`;
    }
    return url.toString();
  } catch {
    return value;
  }
}

function isVideo(item: { type?: string; videoUrl?: string; isVideo?: boolean }) {
  return Boolean(item.isVideo || item.videoUrl || item.type?.toLowerCase().includes("video"));
}

export function normalizeInstagramPost(raw: InstagramScrapedPost, expectedUsername: string) {
  const username = raw.ownerUsername?.replace(/^@/, "").toLowerCase();
  if (username && username !== expectedUsername.toLowerCase()) return null;

  const rawPermalink = toUrl(raw.url) || toUrl(raw.postUrl);
  const shortcodeFromUrl = rawPermalink?.match(/\/(?:p|reel|tv)\/([^/?#]+)/i)?.[1];
  const shortcode = String(raw.shortCode || raw.shortcode || shortcodeFromUrl || "").trim();
  if (!shortcode || raw.error) return null;

  const permalink = normalizePermalink(rawPermalink, shortcode);
  const caption = (raw.caption || "").trim();
  const childPosts = Array.isArray(raw.childPosts) ? raw.childPosts : [];
  const media: ScrapedMedia[] = [];
  const addMedia = (type: "image" | "video", value: unknown) => {
    const url = toUrl(value);
    if (url && !media.some((item) => item.url === url)) media.push({ type, url, caption: null });
  };

  if (Array.isArray(raw.mediaAssets) && raw.mediaAssets.length) {
    for (const asset of raw.mediaAssets) addMedia(asset.isVideo ? "video" : "image", asset.url);
  } else if (childPosts.length) {
    for (const child of childPosts) {
      if (child.videoUrl) addMedia("video", child.videoUrl);
      else if (Array.isArray(child.images) && child.images.length) {
        for (const image of child.images) addMedia("image", typeof image === "string" ? image : image.url);
      } else if (child.displayUrl || child.imageUrl) addMedia("image", child.displayUrl || child.imageUrl);
    }
  } else {
    if (Array.isArray(raw.images)) {
      for (const image of raw.images) {
        if (typeof image === "string") addMedia("image", image);
        else if (image.videoUrl || image.isVideo || image.type?.toLowerCase().includes("video")) addMedia("video", image.videoUrl || image.url || image.displayUrl);
        else addMedia("image", image.url || image.displayUrl || image.imageUrl);
      }
    }
    for (const video of raw.videos || []) addMedia("video", typeof video === "string" ? video : video.videoUrl || video.url);
    if (raw.videoUrl) addMedia("video", raw.videoUrl);
    if (!isVideo(raw) || !media.length) addMedia("image", raw.displayUrl || raw.imageUrl);
  }

  if (!media.length) return null;

  let publishedAt = raw.takenAtIso || raw.timestamp || raw.takenAt;
  if (typeof publishedAt === "number" || (typeof publishedAt === "string" && /^\d{10,13}$/.test(publishedAt))) {
    const numeric = Number(publishedAt);
    publishedAt = new Date(numeric < 1e12 ? numeric * 1000 : numeric).toISOString();
  }
  const parsedDate = publishedAt ? new Date(publishedAt) : new Date();
  const publishedAtIso = Number.isNaN(parsedDate.getTime()) ? new Date().toISOString() : parsedDate.toISOString();
  const cardCaption = caption.replace(/\s+/g, " ").trim();
  const excerpt = cardCaption.length > 180
    ? `${cardCaption.slice(0, 177).trimEnd()}…`
    : cardCaption || "Publicação compartilhada no Instagram.";

  const coverUrl = toUrl(raw.displayUrl) || toUrl(raw.imageUrl)
    || childPosts.map((child) => toUrl(child.displayUrl) || toUrl(child.imageUrl)).find(Boolean)
    || media.find((item) => item.type === "image")?.url
    || null;

  return {
    sourceId: shortcode,
    sourceUrl: permalink,
    title: `Instagram — ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(new Date(publishedAtIso))}`,
    excerpt,
    content: caption || "Publicação importada automaticamente do Instagram.",
    coverUrl,
    publishedAt: publishedAtIso,
    media,
  };
}

export async function fetchInstagramPosts(username: string) {
  const token = process.env.APIFY_TOKEN;
  const actorId = (process.env.APIFY_INSTAGRAM_ACTOR_ID || "apify~instagram-scraper").replace(/\//g, "~");
  if (!token) throw new Error("O token do Apify não está configurado no servidor.");

  const response = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?format=json&clean=true`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      directUrls: [`https://www.instagram.com/${encodeURIComponent(username)}/`],
      resultsType: "posts",
      resultsLimit: 50,
      addParentData: false,
    }),
    signal: AbortSignal.timeout(180_000),
    cache: "no-store",
  });

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 500);
    throw new Error(`Apify retornou ${response.status}: ${detail || response.statusText}`);
  }
  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) throw new Error("O Apify retornou um formato inesperado.");
  return (payload as InstagramScrapedPost[]).flatMap((post) => {
    const normalized = normalizeInstagramPost(post, username);
    return normalized ? [normalized] : [];
  });
}
