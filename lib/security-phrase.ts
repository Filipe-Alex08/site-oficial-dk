// Frase de segurança do membro: um texto que só ele e o site conhecem, mostrado em
// todo e-mail de autenticação que enviamos. Um e-mail falso (phishing) não sabe a
// frase, então a ausência dela entrega o golpe.
//
// Fica em user_metadata ("frase_seguranca"), único lugar que os modelos de e-mail
// do Auth enxergam (`{{ .Data.frase_seguranca }}`).
export const SECURITY_PHRASE_KEY = "frase_seguranca";
export const SECURITY_PHRASE_MIN = 3;
export const SECURITY_PHRASE_MAX = 40;

// Só letras, números, espaço e pontuação simples: nada que o e-mail HTML interprete.
const ALLOWED = /^[\p{L}\p{N} .,!?-]+$/u;

export type SecurityPhraseResult = { ok: true; phrase: string | null } | { ok: false; error: string };

/** Vazio apaga a frase. Devolve o texto limpo (espaços aparados e compactados) ou o erro. */
export function validateSecurityPhrase(value: unknown): SecurityPhraseResult {
  if (value === null || value === undefined) return { ok: true, phrase: null };
  if (typeof value !== "string") return { ok: false, error: "Frase inválida." };
  const phrase = value.replace(/\s+/g, " ").trim();
  if (!phrase) return { ok: true, phrase: null };
  if (phrase.length < SECURITY_PHRASE_MIN || phrase.length > SECURITY_PHRASE_MAX) {
    return { ok: false, error: `A frase deve ter entre ${SECURITY_PHRASE_MIN} e ${SECURITY_PHRASE_MAX} caracteres.` };
  }
  if (!ALLOWED.test(phrase)) return { ok: false, error: "Use só letras, números, espaços e . , ! ? -" };
  return { ok: true, phrase };
}

/** Lê a frase de user_metadata com o mesmo filtro; qualquer coisa fora do padrão vira vazio. */
export function readSecurityPhrase(userMetadata: unknown): string {
  const raw = (userMetadata as Record<string, unknown> | null | undefined)?.[SECURITY_PHRASE_KEY];
  const result = validateSecurityPhrase(raw);
  return result.ok && result.phrase ? result.phrase : "";
}
