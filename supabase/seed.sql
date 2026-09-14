insert into public.activities (title, starts_at, location, type, status, description)
values
  ('Treino aberto do DK', '2026-09-20 09:00:00-03', 'Parque Ecológico da Pampulha — Belo Horizonte', 'Treino', 'confirmado', 'Treino técnico, jogos e integração com novos participantes.'),
  ('Atividade especial', '2026-09-27 09:00:00-03', 'A definir', 'Atividade interna', 'a_definir', 'Detalhes serão publicados no cronograma.');

insert into public.posts (title, slug, excerpt, content, category, published, published_at)
values
  ('Treino do DK — 13/09/2026', 'treino-dk-13-09-2026', 'Registros, destaques e momentos do retorno às atividades do DK.', 'Depois de um breve intervalo, o DK voltou ao campo para mais uma manhã de treino, integração e evolução técnica. A atividade reuniu membros e novos participantes em exercícios, duelos e jogos coletivos.', 'Treinos', true, '2026-09-13 14:00:00-03'),
  ('Participação em evento geek', 'participacao-evento-geek', 'O DK levou demonstrações e experiências de Swordplay para o público.', 'A equipe apresentou equipamentos, regras básicas e atividades adaptadas para quem conheceu o Swordplay pela primeira vez.', 'Eventos', true, '2026-08-30 18:00:00-03');

insert into public.games (name, slug, summary, objective, team_formation, rules, victory, equipment, safety, sort_order)
values
  ('Captura da Bandeira', 'captura-da-bandeira', 'Duas equipes disputam a bandeira adversária enquanto protegem a própria base.', 'Capturar a bandeira adversária e levá-la até a própria base.', 'Duas equipes equilibradas.', '["Respeitar os limites do campo", "A bandeira deve permanecer visível"]', 'Capturar a bandeira ou atingir a pontuação definida.', 'Equipamentos autorizados pela organização.', 'Respeitar os comandos e utilizar equipamentos aprovados.', 1),
  ('Trollball', 'trollball', 'Jogo de avanço territorial com disputa de uma bola.', 'Levar a bola à área de pontuação adversária.', 'Duas equipes com funções de avanço e proteção.', '["A bola deve permanecer visível", "Não é permitido contato físico direto"]', 'Alcançar a quantidade definida de pontos.', 'Equipamentos de curta e média distância autorizados.', 'Interromper a jogada quando solicitado.', 2);
