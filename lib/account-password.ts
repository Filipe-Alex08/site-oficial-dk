export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 128;

// Mesma regra do cadastro (/api/register). Devolve a mensagem de erro ou null.
export function validateNewPassword(next: unknown): string | null {
  if (typeof next !== "string" || next.length < PASSWORD_MIN || next.length > PASSWORD_MAX) {
    return `A nova senha deve ter entre ${PASSWORD_MIN} e ${PASSWORD_MAX} caracteres.`;
  }
  return null;
}

export function validatePasswordChange(current: unknown, next: unknown): string | null {
  if (typeof current !== "string" || !current) return "Informe a senha atual.";
  const invalid = validateNewPassword(next);
  if (invalid) return invalid;
  if (next === current) return "A nova senha deve ser diferente da atual.";
  return null;
}
