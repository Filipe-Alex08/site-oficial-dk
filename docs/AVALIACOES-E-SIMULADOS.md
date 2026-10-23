# Avaliações e Simulados do DK

## Objetivo

O módulo registra avaliações de indicação para patentes e graduações. Cada indicação possui um link individual, exige login e permite uma única tentativa. Uma nova tentativa exige uma nova indicação.

## Responsáveis

- Generais de Brigada, Divisão e Exército: acesso automático;
- Major, Tenente-Coronel e Coronel: acesso somente após delegação de um General;
- demais integrantes e ADMs: sem acesso à administração das avaliações.

O papel **Gestor de Avaliações** não altera patente, graduação nem os quatro papéis administrativos existentes.

## Fluxo

1. O responsável cadastra perguntas e suas fontes.
2. Escolhe o objetivo e os conteúdos cobrados.
3. Seleciona 10, 20, 30, 50 ou 100 questões.
4. Publica a avaliação.
5. Seleciona um ou mais integrantes.
6. O sistema gera um link exclusivo para cada indicado.
7. O integrante entra com a própria conta e realiza a tentativa.
8. Questões objetivas são corrigidas automaticamente.
9. Questões abertas ficam aguardando correção manual.
10. O resultado final é registrado no histórico do integrante.

## Classificação das questões

Cada questão informa:

- manual, capítulo e página;
- tipo objetiva ou aberta;
- patente(s) ou graduação(ões) relacionadas;
- área Geral, Cavalaria ou Arquearia;
- dificuldade Básica, Intermediária ou Avançada;
- explicação ou gabarito esperado;
- situação ativa ou desativada.

As avaliações publicadas guardam uma fotografia das questões utilizadas. Alterar uma questão no banco não modifica avaliações já publicadas.

## Segurança

- O token do link não substitui o login.
- A indicação precisa pertencer ao usuário autenticado.
- Gabaritos e alternativas corretas ficam somente no servidor.
- Respostas deixam de aceitar alterações após a entrega.
- O encerramento por tempo usa o menor prazo entre a data limite e a duração configurada.
- Concessões, indicações, início, entrega e correções entram no histórico de auditoria.
- Somente um General pode apagar uma tentativa por falha excepcional; a justificativa fica registrada. No fluxo normal, a repetição exige uma nova indicação.

## Rotas principais

| Área | Endereço |
|---|---|
| Histórico do integrante | `/membro/simulados` |
| Tentativa individual | `/membro/simulados/[token]` |
| Administração | `/admin`, menu **Avaliações** |

## Ativação

Execute `supabase/migrations/009_assessment_module.sql` depois das migrações anteriores. O módulo também precisa das três variáveis já utilizadas pelo servidor:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
```

Não cadastre questões reais antes de concluir os testes descritos em `docs/TESTES-ACESSO.md`.
