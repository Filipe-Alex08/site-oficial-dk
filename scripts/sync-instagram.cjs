// Run the same synchronization used by the admin screen, without a browser session.
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

process.chdir(path.resolve(__dirname, ".."));
process.loadEnvFile(".env.local");
require.extensions[".ts"] = (module, filename) => {
  module._compile(ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText, filename);
};

const { syncInstagram } = require("../lib/instagram-sync.ts");

async function run() {
  if (!process.argv.includes("--repair")) return syncInstagram();
  const { createAdminClient } = require("../lib/supabase/admin.ts");
  const { fetchInstagramPosts } = require("../lib/instagram-apify.ts");
  const admin = createAdminClient();
  if (!admin) throw new Error("Configure as credenciais administrativas do Supabase.");
  const { data, error } = await admin.from("posts").select("source_url,cover_url,media_items(url)")
    .eq("source", "instagram").eq("published", true);
  if (error) throw new Error(error.message);
  const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")}/storage/v1/object/public/instagram-media/`;
  const urls = data.filter((post) => (post.cover_url && !post.cover_url.startsWith(prefix))
    || post.media_items.some((item) => !item.url.startsWith(prefix))).map((post) => post.source_url);
  if (!urls.length) return { repaired: 0, failed: 0 };
  const username = process.env.APIFY_INSTAGRAM_USERNAME?.replace(/^@/, "").trim();
  if (!username) throw new Error("Configure APIFY_INSTAGRAM_USERNAME.");
  const posts = await fetchInstagramPosts(username, urls);
  if (!posts.length) throw new Error("O Instagram não retornou as publicações pendentes.");
  return syncInstagram(undefined, undefined, posts);
}

run().then((result) => {
  console.log(JSON.stringify(result, null, 2));
  if (result.failed) process.exitCode = 1;
}).catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
