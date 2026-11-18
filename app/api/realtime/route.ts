import { isRealtimeConfigured, reserveConnection, subscribe, subscriberCount } from "@/lib/realtime-hub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Server-Sent Events com os avisos "a tabela X mudou" (só { table, op }; nenhum dado
// de linha, por isso não exige login: o navegador, ao receber, busca os dados de
// verdade pelos caminhos normais, com a sessão e o RLS de sempre).
//
// O Cloudflare derruba conexões sem tráfego por ~100 s: o comentário de heartbeat
// abaixo mantém a conexão viva.
const HEARTBEAT_MS = 25_000;
const MAX_STREAMS = 300;
const encoder = new TextEncoder();

const NO_STORE = { "cache-control": "no-store" };

function unavailable(status: number, error: string, extra: Record<string, string> = {}) {
  return Response.json({ error }, { status, headers: { ...NO_STORE, ...extra } });
}

// Endereço do visitante. Atrás do Cloudflare o cabeçalho cf-connecting-ip é
// reescrito por ele (o visitante não consegue forjá-lo); x-forwarded-for é o plano B.
function clientIp(request: Request) {
  const raw = request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0] ?? "";
  const ip = raw.trim();
  return ip && ip.length <= 64 ? ip : null;
}

export async function GET(request: Request) {
  // O EventSource não envia cabeçalhos próprios; o Sec-Fetch-Site já separa outros sites.
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return new Response(null, { status: 403, headers: NO_STORE });

  if (!isRealtimeConfigured()) return unavailable(503, "Tempo real indisponível.");
  if (subscriberCount() >= MAX_STREAMS) return unavailable(503, "Muitas conexões.", { "retry-after": "60" });

  const slot = reserveConnection(clientIp(request));
  if (!slot) return unavailable(429, "Muitas conexões deste endereço.", { "retry-after": "30" });
  const releaseSlot: () => void = slot;

  let controller!: ReadableStreamDefaultController<Uint8Array>;
  let closed = false;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let unsubscribe: () => void = () => undefined;

  const stream = new ReadableStream<Uint8Array>({
    start(c) { controller = c; },
    cancel() { cleanup(); },
  });

  function send(text: string) {
    if (closed) return;
    try {
      controller.enqueue(encoder.encode(text));
    } catch {
      cleanup();
    }
  }

  function cleanup() {
    if (closed) return;
    closed = true;
    clearInterval(heartbeat);
    unsubscribe();
    releaseSlot();
    try { controller.close(); } catch { /* já fechado */ }
  }

  // Decide ANTES de responder: se o banco está fora, devolve 503 de verdade em vez
  // de um 200 que quebra logo depois (o navegador ficaria reconectando em loop).
  const subscription = await subscribe((message) => send(`event: change\ndata: ${message}\n\n`));
  if (!subscription.ok) {
    closed = true;
    releaseSlot();
    return unavailable(503, "Tempo real indisponível.", { "retry-after": "30" });
  }
  unsubscribe = subscription.unsubscribe;

  if (request.signal.aborted) {
    cleanup();
    return new Response(null, { status: 499, headers: NO_STORE });
  }
  request.signal.addEventListener("abort", cleanup, { once: true });
  heartbeat = setInterval(() => send(": ping\n\n"), HEARTBEAT_MS);

  // retry: tempo que o navegador espera antes de reconectar sozinho.
  send("retry: 5000\n: conectado\n\n");

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream; charset=utf-8",
      // no-transform impede compressão/buffer no caminho (Next, nginx, Cloudflare).
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
