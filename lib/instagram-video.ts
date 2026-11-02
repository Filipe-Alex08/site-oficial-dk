import { execFile } from "node:child_process";
import { mkdtemp, writeFile, readFile, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";

const run = promisify(execFile);

export async function compressInstagramVideo(input: Buffer, maxBytes = 50 * 1024 * 1024) {
  if (!ffmpegPath) throw new Error("FFmpeg não está disponível nesta plataforma.");
  const directory = await mkdtemp(join(tmpdir(), "dk-instagram-"));
  try {
    const source = join(directory, "source");
    const output = join(directory, "compressed.mp4");
    await writeFile(source, input);
    const common = ["-hide_banner", "-nostdin", "-y", "-protocol_whitelist", "file,pipe", "-i", source];
    const { stderr } = await run(ffmpegPath, [...common, "-map", "0:v:0", "-t", "0", "-f", "null", "-"], {
      timeout: 30_000, maxBuffer: 1024 * 1024, windowsHide: true,
    });
    const match = stderr.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/);
    const duration = match ? Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) : 0;
    if (!Number.isFinite(duration) || duration <= 0) throw new Error("Não foi possível identificar a duração do vídeo.");
    const audioBitrate = 96_000;
    // Leave 10% for audio/container overhead; two passes preserve the full duration.
    const bitrate = Math.floor(maxBytes * 0.9 * 8 / duration - audioBitrate);
    if (bitrate < 100_000) throw new Error("Vídeo longo demais para comprimir com qualidade mínima dentro do limite.");
    const videoOptions = [
      "-map", "0:v:0", "-c:v", "libx264", "-preset", "veryfast", "-threads", "2",
      "-b:v", String(Math.min(bitrate, 4_000_000)), "-pix_fmt", "yuv420p",
      "-vf", "scale=w='min(1280,iw)':h='min(1280,ih)':force_original_aspect_ratio=decrease:force_divisible_by=2",
      "-passlogfile", "pass",
    ];
    const options = { cwd: directory, timeout: 180_000, maxBuffer: 2 * 1024 * 1024, windowsHide: true, killSignal: "SIGKILL" as const };
    await run(ffmpegPath, [...common, ...videoOptions, "-pass", "1", "-an", "-f", "null", "-"], options);
    await run(ffmpegPath, [...common, ...videoOptions, "-pass", "2", "-map", "0:a:0?",
      "-c:a", "aac", "-b:a", String(audioBitrate), "-movflags", "+faststart", "-map_metadata", "-1", output], options);
    const { size } = await stat(output);
    if (!size || size > maxBytes) throw new Error("O vídeo comprimido ainda excede o limite de armazenamento.");
    return await readFile(output);
  } catch (error) {
    // FFmpeg errors contain local paths and verbose codec diagnostics. Keep API
    // responses concise while preserving actionable timeout/size failures.
    if (error instanceof Error && !("cmd" in error)) throw error;
    throw new Error("Falha ao comprimir o vídeo com FFmpeg; verifique o formato e o tempo disponível no servidor.", { cause: error });
  } finally {
    const target = resolve(directory);
    const allowedPrefix = `${resolve(tmpdir())}${sep}dk-instagram-`;
    if (target.startsWith(allowedPrefix)) await rm(target, { recursive: true, force: true });
  }
}
