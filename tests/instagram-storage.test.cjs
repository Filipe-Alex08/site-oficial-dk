const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const ts = require("typescript");
const { createHash } = require("node:crypto");

function load(file, mocks = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(fs.readFileSync(file, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText, {
    exports, Buffer, URL, AbortSignal, console, process,
    require: (name) => name in mocks ? mocks[name] : require(name), ...globals,
  });
  return exports;
}

function fixture(files = [], response = () => new Response(Buffer.from([255, 216, 255]), { headers: { "content-type": "image/jpeg" } })) {
  const uploads = [];
  const compressions = [];
  let downloads = 0;
  const bucket = {
    list: async () => ({ data: files.map((name) => ({ name })) }),
    upload: async (...args) => { uploads.push(args); return {}; },
    getPublicUrl: (path) => ({ data: { publicUrl: `https://storage.example/${path}` } }),
  };
  const api = load("lib/instagram-storage.ts", {
    "./instagram-video": { compressInstagramVideo: async (bytes) => { compressions.push(bytes.length); return Buffer.from("compressed"); } },
  }, { fetch: async () => { downloads++; return response(); } });
  return { ...api, admin: { storage: { from: () => bucket } }, uploads, compressions, downloads: () => downloads };
}

const url = "https://scontent.example.cdninstagram.com/photo.jpg?signature=one";
const post = { sourceId: "AbC", coverUrl: url, media: [{ type: "image", url, caption: null }] };

test("archives a shared cover/gallery image once and returns permanent URLs", async () => {
  const f = fixture();
  const result = await f.archiveInstagramPost(f.admin, post);
  assert.equal(f.downloads(), 1);
  assert.equal(f.uploads.length, 1);
  assert.equal(f.uploads[0][2].contentType, "image/jpeg");
  assert.equal(result.coverUrl, result.media[0].url);
  assert.ok(result.coverUrl.startsWith("https://storage.example/"));
});

test("reuses an archived file after CDN host/signature changes without downloading", async () => {
  const key = createHash("sha256").update("image:/photo.jpg").digest("hex");
  const f = fixture([`${key}.jpg`]);
  await f.archiveInstagramPost(f.admin, { ...post, coverUrl: url.replace("scontent.example", "scontent.other"), media: post.media });
  assert.equal(f.downloads(), 0);
  assert.equal(f.uploads.length, 0);
});

test("rejects expired links and oversized files instead of returning temporary URLs", async () => {
  for (const response of [
    () => new Response("URL signature expired", { status: 403 }),
    () => new Response("too big", { headers: { "content-type": "image/jpeg", "content-length": String(51 * 1024 * 1024) } }),
  ]) {
    const f = fixture([], response);
    await assert.rejects(f.archiveInstagramPost(f.admin, post));
    assert.equal(f.uploads.length, 0);
  }
});

test("rejects untrusted sources and redirects before following them", async () => {
  const f = fixture([], () => new Response(null, { status: 302, headers: { location: "http://127.0.0.1/private" } }));
  await assert.rejects(f.archiveInstagramPost(f.admin, { ...post, coverUrl: "https://cdninstagram.com.attacker.example/photo.jpg" }));
  assert.equal(f.downloads(), 0);
  await assert.rejects(f.archiveInstagramPost(f.admin, post));
  assert.equal(f.downloads(), 1);
});

test("a video exceeding the input limit preserves the permanent cover for independent recovery", async () => {
  let request = 0;
  const f = fixture([], () => ++request === 1
    ? new Response("cover", { headers: { "content-type": "image/jpeg" } })
    : new Response("video", { headers: { "content-type": "video/mp4", "content-length": String(251 * 1024 * 1024) } }));
  await assert.rejects(f.archiveInstagramPost(f.admin, {
    ...post, media: [{ type: "video", url: url.replace("photo.jpg", "video.mp4"), caption: null }],
  }), (error) => {
    assert.ok(error instanceof f.InstagramMediaArchiveError);
    assert.ok(error.coverUrl.startsWith("https://storage.example/"));
    return true;
  });
  assert.equal(f.uploads.length, 1);
});

test("compresses videos above the bucket limit and uploads only the compressed MP4", async () => {
  const bytes = Buffer.alloc(50 * 1024 * 1024 + 1);
  const f = fixture([], () => new Response(bytes, { headers: { "content-type": "video/webm" } }));
  const result = await f.archiveInstagramPost(f.admin, {
    ...post, coverUrl: null, media: [{ type: "video", url: url.replace("photo.jpg", "video.webm"), caption: null }],
  });
  assert.equal(f.compressions[0], bytes.length);
  assert.equal(f.uploads[0][1].toString(), "compressed");
  assert.equal(f.uploads[0][2].contentType, "video/mp4");
  assert.ok(result.media[0].url.endsWith(".mp4"));
});

test("failed archiving never changes existing database records", async () => {
  const original = process.env.APIFY_INSTAGRAM_USERNAME;
  process.env.APIFY_INSTAGRAM_USERNAME = "example";
  let writes = 0;
  const api = load("lib/instagram-sync.ts", {
    "./instagram-apify": { fetchInstagramPosts: async () => [post] },
    "./supabase/admin": { createAdminClient: () => ({ from: () => ({
      select: () => ({ limit: async () => ({ error: null }) }),
      insert: () => { writes++; throw new Error("Unexpected write"); },
      update: () => { writes++; throw new Error("Unexpected write"); },
      delete: () => { writes++; throw new Error("Unexpected write"); },
    }) }) },
    "./instagram-storage": {
      ensureInstagramBucket: async () => {},
      archiveInstagramPost: async () => { throw new Error("Transfer failed"); },
      InstagramMediaArchiveError: class extends Error {},
    },
  });
  try {
    const result = await api.syncInstagram();
    assert.equal(result.failed, 1);
    assert.equal(writes, 0);
  } finally {
    if (original === undefined) delete process.env.APIFY_INSTAGRAM_USERNAME;
    else process.env.APIFY_INSTAGRAM_USERNAME = original;
  }
});

test("syncs old schemas without querying or writing optional video-link columns", async () => {
  const original = process.env.APIFY_INSTAGRAM_USERNAME;
  process.env.APIFY_INSTAGRAM_USERNAME = "example";
  let writes = 0;
  const archived = { ...post, sourceUrl: "https://www.instagram.com/p/AbC/", media: [],
    excerpt: "Caption", youtubeUrl: "https://youtu.be/example", tiktokUrl: null };
  const api = load("lib/instagram-sync.ts", {
    "./instagram-apify": { fetchInstagramPosts: async () => [archived] },
    "./instagram-storage": { ensureInstagramBucket: async () => {}, archiveInstagramPost: async (_, item) => item,
      InstagramMediaArchiveError: class extends Error {} },
    "./supabase/admin": { createAdminClient: () => ({ from: (table) => ({
      select(columns) {
        if (table === "posts" && columns !== "*") {
          assert.equal(columns, "youtube_url,tiktok_url");
          return { limit: async () => ({ error: { code: "42703" } }) };
        }
        return this;
      },
      eq() { return this; },
      maybeSingle: async () => ({ data: { id: "existing", cover_url: archived.coverUrl, excerpt: archived.excerpt } }),
      order: async () => ({ data: [] }),
      update: () => { writes++; throw new Error("Unexpected write"); },
    }) }) },
  });
  try {
    const result = await api.syncInstagram();
    assert.equal(result.skipped, 1);
    assert.equal(result.failed, 0);
    assert.equal(writes, 0);
  } finally {
    if (original === undefined) delete process.env.APIFY_INSTAGRAM_USERNAME;
    else process.env.APIFY_INSTAGRAM_USERNAME = original;
  }
});
