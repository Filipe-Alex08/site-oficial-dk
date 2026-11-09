const portuguese = /[áàâãéêíóôõúç]|\b(não|você|membro|senha|código|convite|obrigat\w+|inválid\w+|permiss\w+)\b/i;

/**
 * Converte erros técnicos (Postgres, Supabase, rede) em uma mensagem curta em
 * português. Mensagens que já vêm em português da nossa API passam direto; o
 * detalhe técnico fica apenas no console.
 */
export function friendlyError(error: unknown, fallback = "Não foi possível concluir a ação. Tente novamente."): string {
  const message = typeof error === "string"
    ? error
    : error && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : "";
  if (!message) return fallback;
  if (/duplicate key|already exists/i.test(message)) return "Já existe um registro com esses dados.";
  if (/row-level security|permission denied|not authorized|forbidden/i.test(message)) return "Você não tem permissão para esta ação.";
  if (/failed to fetch|network|timeout/i.test(message)) return "Sem conexão com o servidor. Tente novamente.";
  if (portuguese.test(message)) return message;
  console.error(message);
  return fallback;
}
