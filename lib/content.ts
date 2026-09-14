import type { Activity, Game, Post } from "@/lib/types";

export const socialLinks = {
  instagram: "https://www.instagram.com/dkbhmg/",
  whatsapp: "https://chat.whatsapp.com/FEH19lTq3LIJDWBzBDkE7J",
  youtube: process.env.NEXT_PUBLIC_YOUTUBE_URL || "",
};

export const demoActivities: Activity[] = [
  {
    id: "demo-1",
    title: "Treino aberto do DK",
    starts_at: "2026-09-20T09:00:00-03:00",
    location: "Parque Ecológico da Pampulha — Belo Horizonte",
    type: "Treino",
    status: "confirmado",
    description: "Treino técnico, jogos e integração com novos participantes.",
  },
  {
    id: "demo-2",
    title: "Atividade especial",
    starts_at: "2026-09-27T09:00:00-03:00",
    location: "A definir",
    type: "Atividade interna",
    status: "a_definir",
    description: "Detalhes serão publicados no cronograma.",
  },
];

export const games: Game[] = [
  {
    id: "captura-bandeira",
    name: "Captura da Bandeira",
    summary: "Duas equipes disputam a bandeira adversária enquanto protegem a própria base.",
    objective: "Capturar a bandeira adversária e levá-la até a base da própria equipe.",
    teamFormation: "Duas equipes equilibradas, com atacantes, defensores e jogadores de suporte.",
    rules: [
      "Respeitar os limites definidos para o campo.",
      "Jogadores atingidos seguem a regra de eliminação informada antes da partida.",
      "A bandeira deve ser transportada de forma visível.",
    ],
    victory: "Vence a equipe que capturar a bandeira ou atingir a pontuação definida.",
    equipment: "Espadas, escudos, lanças, duais e arquearia, conforme a organização.",
    safety: "Respeitar os comandos dos organizadores e utilizar somente equipamentos aprovados.",
  },
  {
    id: "trollball",
    name: "Trollball",
    summary: "Jogo de avanço territorial no qual as equipes disputam a posse de uma bola.",
    objective: "Levar a bola até a área de pontuação adversária.",
    teamFormation: "Duas equipes com corredores, linha de proteção e jogadores de marcação.",
    rules: [
      "A bola deve permanecer visível durante a jogada.",
      "Não é permitido esconder ou prender a bola ao corpo.",
      "A eliminação segue o sistema apresentado antes do início.",
    ],
    victory: "Vence a equipe que alcançar primeiro a quantidade definida de pontos.",
    equipment: "Equipamentos de curta e média distância autorizados pela organização.",
    safety: "Evitar contato físico direto e interromper a jogada quando solicitado.",
  },
  {
    id: "batalha-campal",
    name: "Batalha Campal",
    summary: "Combate coletivo que trabalha formação, posicionamento e comunicação.",
    objective: "Eliminar a equipe adversária ou cumprir o objetivo especial da rodada.",
    teamFormation: "Equipes organizadas em linha de frente, suporte, flancos e arquearia.",
    rules: [
      "Cada jogador deve respeitar a função e os limites da rodada.",
      "Acertos válidos seguem as regras gerais do DK.",
      "A partida termina quando a condição anunciada for alcançada.",
    ],
    victory: "Depende do formato: eliminação, domínio de área ou cumprimento de objetivo.",
    equipment: "Todas as categorias aprovadas para a atividade.",
    safety: "Manter controle dos golpes, distância segura e atenção às orientações de campo.",
  },
];

export const demoPosts: Post[] = [
  {
    id: "post-1",
    title: "Treino do DK — 13/09/2026",
    slug: "treino-dk-13-09-2026",
    excerpt: "Registros, destaques e momentos do retorno às atividades do DK.",
    content:
      "Depois de um breve intervalo, o DK voltou ao campo para mais uma manhã de treino, integração e evolução técnica. A atividade reuniu membros e novos participantes em exercícios, duelos e jogos coletivos.",
    category: "Treinos",
    cover_url: null,
    published: true,
    published_at: "2026-09-13T14:00:00-03:00",
    media_items: [],
  },
  {
    id: "post-2",
    title: "Participação em evento geek",
    slug: "participacao-evento-geek",
    excerpt: "O DK levou demonstrações e experiências de Swordplay para o público.",
    content:
      "A equipe apresentou equipamentos, regras básicas e atividades adaptadas para quem conheceu o Swordplay pela primeira vez.",
    category: "Eventos",
    cover_url: null,
    published: true,
    published_at: "2026-08-30T18:00:00-03:00",
    media_items: [],
  },
];
