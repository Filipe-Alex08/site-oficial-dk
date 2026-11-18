import { format } from "node:util";
import { logEvent } from "@/lib/app-log";

const FLAG = Symbol.for("dk.console-capture");

// Copia console.warn/console.error para a aba de logs. A saida original continua
// indo para o pm2; a captura so acrescenta uma linha no banco.
export function installConsoleCapture() {
  const g = globalThis as Record<symbol, unknown>;
  if (g[FLAG]) return;
  g[FLAG] = true;

  let capturing = false;
  const wrap = (method: "warn" | "error", level: "aviso" | "erro") => {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      original(...args);
      if (capturing) return;
      capturing = true;
      try {
        logEvent({
          level,
          source: "servidor",
          category: "console",
          action: method,
          message: format(...args),
        });
      } catch {
        // Captura e best-effort.
      } finally {
        capturing = false;
      }
    };
  };

  wrap("warn", "aviso");
  wrap("error", "erro");
}
