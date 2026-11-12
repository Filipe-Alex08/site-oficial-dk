import type { Game } from "@/lib/types";

type GameFieldMap = NonNullable<Game["fieldMap"]>;

export const gameFieldMaps: Record<string, GameFieldMap> = {
  "captura-bandeira": {
    src: "/images/games/maps/captura-da-bandeira.webp",
    alt: "Mapa do campo de Captura da Bandeira, com as bases e as rotas de avanço das equipes vermelha e azul.",
    width: 1672,
    height: 941,
  },
  Trollball: {
    src: "/images/games/maps/trollball.webp",
    alt: "Mapa do campo de Trollball, com os poços, a Cabeça de Troll, os curandeiros e as rotas das duas equipes.",
    width: 1671,
    height: 941,
  },
  "batalha-campal": {
    src: "/images/games/maps/batalha-campal.webp",
    alt: "Mapa do campo de Batalha Campal, com as formações das equipes e a saída para o campo dos eliminados.",
    width: 1672,
    height: 941,
  },
  "Archery-Tag": {
    src: "/images/games/maps/archery-tag.webp",
    alt: "Mapa do campo de Archery Tag, com as flechas no centro e os alvos das equipes nas extremidades.",
    width: 1672,
    height: 941,
  },
  "Guerra-pelas-Fitas": {
    src: "/images/games/maps/guerra-pelas-fitas.webp",
    alt: "Mapa do campo de Guerra pelas Fitas, mostrando três equipes avançando com três fitas por jogador.",
    width: 1672,
    height: 941,
  },
  "Batalha-de-Campo-com-Conquista": {
    src: "/images/games/maps/batalha-de-campo-com-conquista.webp",
    alt: "Mapa do campo de Batalha de Campo com Conquista, com cinco equipes organizadas por líder, capitães e combatentes.",
    width: 1672,
    height: 941,
  },
  "Mate-o-Rei": {
    src: "/images/games/maps/mate-o-rei.webp",
    alt: "Mapa do campo de Mate o Rei, com os Reis protegidos pelas equipes vermelha e azul.",
    width: 1672,
    height: 941,
  },
  "Rapto-da-Princesa": {
    src: "/images/games/maps/rapto-da-princesa.webp",
    alt: "Mapa do campo de Rapto da Princesa, com a equipe de defesa, a equipe de rapto e o trajeto até a área de domínio.",
    width: 1672,
    height: 941,
  },
  "Defesa-da-Vila": {
    src: "/images/games/maps/defesa-da-vila.webp",
    alt: "Vila atrás do arqueiro, área de tiro com cinco flechas e três zonas SAFE no trajeto dos jogadores-alvo.",
    width: 1536,
    height: 1024,
  },
  "Duelo-de-Arqueiros": {
    src: "/images/games/maps/duelo-de-arqueiros.webp",
    alt: "Mapa do campo de Duelo de Arqueiros, com as posições demarcadas e cinco flechas para cada participante.",
    width: 1672,
    height: 941,
  },
  "Batalha-de-Cerco": {
    src: "/images/games/maps/batalha-de-cerco.webp",
    alt: "Mapa do campo de Batalha de Cerco, com oito defensores na fortificação e dezesseis atacantes avançando.",
    width: 1672,
    height: 941,
  },
  "Rei-da-Mesa": {
    src: "/images/games/maps/rei-da-mesa.webp",
    alt: "Mapa do campo de Rei da Mesa, com a arena de duelo e a fila de espera dos próximos desafiantes.",
    width: 1672,
    height: 941,
  },
};
