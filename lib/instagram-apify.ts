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

function socialVideoUrl(caption: string, platform: "youtube" | "tiktok") {
  const candidates = caption.match(/https?:\/\/[^\s<>]+/gi) || [];
  for (const candidate of candidates) {
    try {
      const url = new URL(candidate.replace(/[.,;!?]+$/, ""));
      const host = url.hostname.toLowerCase();
      if (url.protocol !== "https:") continue;
      if (platform === "youtube" && (host === "youtu.be" || host === "youtube.com" || host.endsWith(".youtube.com"))) return url.toString();
      if (platform === "tiktok" && (host === "tiktok.com" || host.endsWith(".tiktok.com"))) return url.toString();
    } catch { /* Ignore invalid links in captions. */ }
  }
  return null;
}

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

const TITLE_MAX = 72;
/** Quando a primeira linha é só um gancho curto ("terapia em dia"), a linha seguinte entra como complemento. */
const TITLE_SHORT_LINE = 16;
/** Formato do título antigo do importador; só ele é trocado em publicações já existentes. */
const LEGACY_TITLE = /^Instagram — \d{2}\/\d{2}\/\d{2,4}$/;

export const isLegacyInstagramTitle = (title: string) => LEGACY_TITLE.test(title.trim());

/** Tira link, hashtag, emoji e pontuação de borda: o que sobra é texto que cabe num título. */
function titleText(line: string) {
  return line
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/#[\p{L}\p{N}_]+/gu, " ")
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Modifier}‍️]/gu, " ")
    .replace(/\s+/g, " ")
    .replace(/^[^\p{L}\p{N}@]+/u, "")
    .replace(/[\s,;:\-–—•|/]+$/u, "")
    .trim();
}

const hasWords = (text: string) => /[\p{L}\p{N}]{3,}/u.test(text);

function fallbackTitle(publishedAtIso: string, media: ScrapedMedia[]) {
  const images = media.filter((item) => item.type === "image").length;
  const videos = media.length - images;
  const label = images && videos ? "Fotos e vídeos" : videos ? (videos > 1 ? "Vídeos" : "Vídeo") : images > 1 ? "Fotos" : "Foto";
  const date = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "America/Sao_Paulo" }).format(new Date(publishedAtIso));
  return `${label} de ${date}`;
}

/**
 * Título da publicação a partir da legenda: a primeira frase com texto de verdade
 * (sem hashtags, links nem emojis), cortada em uma palavra inteira. Sem legenda
 * aproveitável, descreve a mídia e a data ("Vídeo de 10 de outubro de 2026").
 * `rest` é o que sobrou da legenda depois do título, para o resumo não repeti-lo
 * (vazio quando o título já é a legenda toda); `null` quando o título foi cortado
 * no meio de uma linha e o resumo precisa da legenda inteira.
 */
export function buildInstagramTitle(caption: string, publishedAtIso: string, media: ScrapedMedia[]) {
  const lines = caption.split(/\r?\n/).map((line) => line.trim());
  const cleaned = lines.map(titleText);
  const first = cleaned.findIndex(hasWords);
  if (first === -1) return { title: fallbackTitle(publishedAtIso, media), rest: null };

  let last = first;
  let text = cleaned[first];
  if (text.length < TITLE_SHORT_LINE) {
    const next = cleaned.findIndex((line, index) => index > first && hasWords(line));
    if (next !== -1) { last = next; text = `${text} — ${cleaned[next]}`; }
  }

  let title = text;
  const stop = title.search(/[.!?](?=\s|$)/);
  if (stop >= 12 && stop < TITLE_MAX) title = title.slice(0, stop + (title[stop] === "." ? 0 : 1));
  // Só o corte no meio de uma frase leva reticências; terminar numa frase completa não.
  let wordCut = false;
  if (title.length > TITLE_MAX) {
    const cut = title.slice(0, TITLE_MAX);
    const space = cut.lastIndexOf(" ");
    title = `${cut.slice(0, space > TITLE_MAX / 2 ? space : TITLE_MAX).replace(/[\s,;:.\-–—(]+$/u, "")}…`;
    wordCut = true;
  }
  title = title.charAt(0).toLocaleUpperCase("pt-BR") + title.slice(1);

  if (wordCut) return { title, rest: null };
  const tail = text.slice(title.length).replace(/^[\s.]+/, "");
  const later = lines.slice(last + 1).filter((line) => hasWords(titleText(line)));
  return { title, rest: [tail, ...later].filter(Boolean).join(" ") };
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
  const { title, rest } = buildInstagramTitle(caption, publishedAtIso, media);
  // O resumo continua de onde o título parou, sem repeti-lo.
  const cardCaption = (rest ?? caption).replace(/\s+/g, " ").trim();
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
    title,
    excerpt,
    content: caption || "Publicação importada automaticamente do Instagram.",
    youtubeUrl: socialVideoUrl(caption, "youtube"),
    tiktokUrl: socialVideoUrl(caption, "tiktok"),
    coverUrl,
    publishedAt: publishedAtIso,
    media,
  };
}

export async function fetchInstagramPosts(username: string, postUrls?: string[]) {
  const token = process.env.APIFY_TOKEN;
  const actorId = (process.env.APIFY_INSTAGRAM_ACTOR_ID || "apify~instagram-scraper").replace(/\//g, "~");
  if (!token) throw new Error("O token do Apify não está configurado no servidor.");

  const response = await fetch(`https://api.apify.com/v2/acts/${encodeURIComponent(actorId)}/run-sync-get-dataset-items?format=json&clean=true`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      directUrls: postUrls?.length ? postUrls : [`https://www.instagram.com/${encodeURIComponent(username)}/`],
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
