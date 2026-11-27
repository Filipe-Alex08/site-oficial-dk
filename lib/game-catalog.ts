/** Filtros do catálogo, na ordem em que aparecem na tela. */
export const gameCategoryLabels = {
  objetivos: "Objetivos",
  batalhas: "Batalhas",
  pontaria: "Pontaria",
  duelos: "Duelos",
  busca: "Busca",
  desportivos: "Desportivos",
  lendas: "Lendas",
  resistencia: "Resistência",
  taverna: "Taverna",
};

export type GameCategory = keyof typeof gameCategoryLabels;

/**
 * Categorias de cada jogo. A primeira é a que aparece no cartão.
 * O texto dos jogos fica em `lib/content.ts`.
 */
export const gameCategories: Record<string, [GameCategory, ...GameCategory[]]> = {
  "captura-bandeira": ["objetivos"],
  Trollball: ["objetivos"],
  "batalha-campal": ["batalhas"],
  "Archery-Tag": ["pontaria"],
  "Guerra-pelas-Fitas": ["objetivos"],
  "Batalha-de-Campo-com-Conquista": ["batalhas"],
  "Mate-o-Rei": ["objetivos"],
  "Rapto-da-Princesa": ["objetivos"],
  "Defesa-da-Vila": ["pontaria"],
  "Duelo-de-Arqueiros": ["duelos", "pontaria"],
  "Batalha-de-Cerco": ["batalhas"],
  "Rei-da-Mesa": ["duelos"],
  "caca-ovos-dragao": ["busca", "objetivos", "lendas"],
  "captura-espiao": ["busca", "objetivos", "lendas"],
  escolta: ["objetivos", "lendas"],
  invasao: ["batalhas", "objetivos", "lendas"],
  "linha-morte": ["resistencia", "batalhas", "objetivos"],
  tacobol: ["desportivos"],
  "arremesso-javelim": ["pontaria", "desportivos", "lendas"],
  "cabo-guerra": ["desportivos", "resistencia", "lendas"],
  "corrida-maca": ["taverna", "desportivos"],
  "corrida-drakares": ["lendas", "batalhas", "resistencia"],
  "destruicao-reino": ["lendas", "batalhas", "objetivos"],
  "todos-contra-todos": ["batalhas", "resistencia"],
  "jogos-vorazes": ["resistencia", "batalhas", "busca"],
  "sobrevivencia-selva": ["resistencia", "batalhas", "objetivos"],
  "conto-bardo": ["taverna", "lendas"],
  damas: ["taverna", "lendas"],
  quoits: ["pontaria", "desportivos", "taverna", "lendas"],
  xadrez: ["taverna", "lendas"],
};
