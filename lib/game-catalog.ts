import type { Game, GameCategory } from "@/lib/types";

type GameOverride = Partial<Pick<Game,
  "summary" | "objective" | "teamFormation" | "rules" | "victory" | "equipment" | "safety"
>>;

type GameCatalogMetadata = {
  categories: [GameCategory, ...GameCategory[]];
  overrides?: GameOverride;
};

/**
 * Metadados exclusivos do catálogo interativo. Eles ficam separados do
 * conteúdo geral do site para que a área de Jogos possa evoluir sem alterar
 * links institucionais ou integrações sociais mantidas no mesmo módulo.
 */
export const gameCatalogMetadata: Record<string, GameCatalogMetadata> = {
  "captura-bandeira": { categories: ["objetivos"] },
  Trollball: { categories: ["objetivos"] },
  "batalha-campal": { categories: ["batalhas"] },
  "Archery-Tag": { categories: ["arquearia"] },
  "Guerra-pelas-Fitas": {
    categories: ["objetivos"],
    overrides: {
      teamFormation: "Três equipes, normalmente com 4 ou 5 participantes cada.",
      rules: [
        "Cada participante começa com 3 fitas e possui 1 ponto de vida.",
        "As fitas podem ser encontradas pelo campo ou conquistadas ao derrotar adversários.",
        "Ao derrotar um adversário, quem aplicou o golpe final recebe 1 fita dele.",
        "Quem fica sem fitas é eliminado e fica fora até o fim da rodada.",
        "Não é permitido trocar, doar ou abandonar fitas.",
        "As fitas não podem ser utilizadas como equipamento de ataque ou defesa.",
      ],
    },
  },
  "Batalha-de-Campo-com-Conquista": {
    categories: ["batalhas"],
    overrides: {
      teamFormation: "Cinco equipes com 11 ou mais participantes cada, incluindo 1 líder, 2 capitães e os demais combatentes.",
      rules: [
        "Todos os integrantes possuem 1 ponto de vida, incluindo líder e capitães.",
        "A estratégia deve considerar a proteção da liderança e o avanço contra os comandantes adversários.",
      ],
    },
  },
  "Mate-o-Rei": { categories: ["objetivos"] },
  "Rapto-da-Princesa": { categories: ["objetivos"] },
  "Defesa-da-Vila": {
    categories: ["arquearia"],
    overrides: {
      summary: "Um arqueiro defende a vila de três jogadores que avançam pelo campo, um por vez.",
      objective: "Acertar os três jogadores-alvo que avançam rumo à vila, usando o menor número de flechas e no menor tempo possível.",
      teamFormation: "Um arqueiro por vez e três jogadores-alvo. A vila fica atrás do arqueiro.",
      rules: [
        "Cada participante possui 1 ponto de vida.",
        "O arqueiro dispõe de 5 flechas para acertar os 3 jogadores-alvo.",
        "Somente um jogador-alvo pode avançar por vez. Os demais aguardam nos pontos SAFE.",
        "Enquanto outro jogador avança, quem estiver em um ponto SAFE deve aguardar.",
        "O arqueiro deve permanecer na área de tiro demarcada e só pode disparar contra o jogador que está avançando fora dos pontos SAFE.",
      ],
      victory: "Vence o arqueiro que acertar os três jogadores-alvo no menor tempo, dentro do limite de cinco flechas.",
      safety: "Delimite a área de tiro e as três zonas SAFE. Mantenha a arena isolada durante os disparos e respeite a proteção dos jogadores nas zonas SAFE.",
    },
  },
  "Duelo-de-Arqueiros": { categories: ["duelos", "arquearia"] },
  "Batalha-de-Cerco": { categories: ["batalhas"] },
  "Rei-da-Mesa": { categories: ["duelos"] },
};
