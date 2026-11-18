import { isIP } from "node:net";

// Cloudflare overwrites CF-Connecting-IP; when it is absent, the rightmost
// X-Forwarded-For entry is the one appended by the closest trusted proxy.
// Never trust X-Real-IP or the leftmost XFF entry: both are client-controlled.
export function getClientIp(request: Request) {
  const cfConnectingIp = request.headers.get("cf-connecting-ip")?.trim();
  if (cfConnectingIp && isIP(cfConnectingIp)) return cfConnectingIp;

  const forwardedFor = request.headers.get("x-forwarded-for");
  const lastHop = forwardedFor?.split(",").map((part) => part.trim()).filter(Boolean).pop();
  if (lastHop && isIP(lastHop)) return lastHop;

  return "unknown";
}
