// O celular é salvo só em dígitos, com o código do país (coluna profiles.whatsapp).

/**
 * Número pronto para salvar: só dígitos, com o código do país.
 * Sem "+", 10 ou 11 dígitos são tratados como DDD + número do Brasil.
 */
export function normalizeWhatsapp(input: string): string | null {
  const international = input.trim().startsWith("+");
  let digits = input.replace(/\D/g, "").replace(/^0+/, "");
  if (!international && (digits.length === 10 || digits.length === 11)) digits = `55${digits}`;
  const minimum = international ? 10 : 12;
  return digits.length >= minimum && digits.length <= 15 ? digits : null;
}

// Os separadores só aparecem quando há um dígito depois deles; senão o Backspace travaria.
function brazilianMask(digits: string) {
  if (!digits) return "";
  if (digits.length <= 2) return `(${digits}`;
  const number = digits.slice(2);
  const split = number.length > 8 ? 5 : 4;
  const head = `(${digits.slice(0, 2)}) ${number.slice(0, split)}`;
  return number.length > split ? `${head}-${number.slice(split)}` : head;
}

/**
 * Máscara do campo de celular: "(11) 99999-8888", "+55 (11) 99999-8888" ou,
 * para outros países (começando com "+"), só os dígitos.
 */
export function maskPhone(input: string) {
  const international = input.trim().startsWith("+");
  let digits = input.replace(/\D/g, "");
  if (!international) digits = digits.replace(/^0+/, "");
  const withCountryCode = digits.startsWith("55") && digits.length <= 13;
  if (!international && !(withCountryCode && digits.length > 11)) return brazilianMask(digits.slice(0, 11));
  if (!withCountryCode) return `+${digits.slice(0, 15)}`;
  const local = brazilianMask(digits.slice(2));
  return local ? `+55 ${local}` : "+55";
}

/** Número salvo (só dígitos) como aparece no campo; o do Brasil dispensa o "+55". */
export function phoneFieldValue(stored: string) {
  const brazilian = stored.startsWith("55") && (stored.length === 12 || stored.length === 13);
  return maskPhone(brazilian ? stored.slice(2) : `+${stored}`);
}
