/** Texto em minúsculas, sem acentos e só com letras/números separados por espaço: base das buscas do site. */
export function normalizeSearch(text: string) {
  return text.toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
