import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === "production";

// CSP configurada por cabeçalho (sem nonce): a alternativa com nonce exige
// renderização dinâmica em todas as páginas, o que desativaria o cache das
// páginas públicas. O custo é `'unsafe-inline'` em script-src.
const supabaseOrigin = (() => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!url) return "";
  try {
    const { protocol, origin } = new URL(url);
    return protocol === "https:" || protocol === "http:" ? origin : "";
  } catch {
    return "";
  }
})();
// O cliente usa REST/auth por HTTPS e Realtime por WebSocket.
const supabaseSocketOrigin = supabaseOrigin ? supabaseOrigin.replace(/^http/, "ws") : "";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "frame-src 'none'",
  "form-action 'self'",
  // 'unsafe-eval' só é necessário no servidor de desenvolvimento.
  `script-src 'self' 'unsafe-inline'${isProduction ? "" : " 'unsafe-eval'"}`,
  // O next/font e os componentes injetam estilos em linha.
  "style-src 'self' 'unsafe-inline'",
  // Imagens e vídeos arquivados vivem no Storage do Supabase; https: cobre
  // capas e mídias antigas ainda apontando para o CDN de origem.
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  ["connect-src 'self'", supabaseOrigin, supabaseSocketOrigin].filter(Boolean).join(" "),
  "manifest-src 'self'",
  "worker-src 'self' blob:",
  ...(isProduction ? ["upgrade-insecure-requests"] : []),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // HSTS só faz sentido sob HTTPS; `preload` exige envio às listas dos navegadores.
  ...(isProduction ? [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" }] : []),
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  serverExternalPackages: ["ffmpeg-static"],
  outputFileTracingIncludes: {
    "/api/admin/instagram/sync": ["./node_modules/ffmpeg-static/ffmpeg", "./node_modules/ffmpeg-static/ffmpeg.exe"],
  },
  experimental: {
    agentUpgrade: "security",
  },
  async headers() {
    return [{
      source: "/(.*)",
      headers: securityHeaders,
    }, ...["/membro/:path*", "/admin/:path*", "/area-do-membro/:path*", "/api/:path*", "/auth/:path*"].map((source) => ({ source, headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow, noarchive" }] }))];
  },
};

export default nextConfig;
