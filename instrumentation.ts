import type { Instrumentation } from "next";

// Roda uma vez quando o servidor sobe. So no Node: a captura grava no banco com
// a chave de servico, que nao existe no runtime edge.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { installConsoleCapture } = await import("./lib/console-capture");
  installConsoleCapture();
}

// Erros nao tratados de paginas, rotas e acoes. Sem cabecalhos nem corpo: so o
// que ajuda a achar o problema.
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { logEventNow } = await import("./lib/app-log");

  const error = err instanceof Error ? err : new Error(String(err));
  const digest = typeof err === "object" && err !== null && "digest" in err ? String((err as { digest: unknown }).digest) : undefined;

  await logEventNow({
    level: "erro",
    source: "servidor",
    category: "request",
    action: `${request.method} ${context.routeType}`,
    message: error.message || "Erro sem mensagem",
    path: request.path,
    details: {
      rota: context.routePath,
      tipo: context.routeType,
      origem: context.renderSource,
      digest,
      stack: error.stack?.split("\n").slice(0, 8).join("\n"),
    },
  });
};
