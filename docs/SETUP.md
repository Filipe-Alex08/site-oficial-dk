# Configuração do Site Oficial do DK

Este guia ativa o banco, o login, a área dos membros e o CMS. A parte pública pode ser visualizada sem o Supabase, usando conteúdo demonstrativo local.

## 1. Requisitos

- Node.js 22 ou superior;
- npm;
- conta no Supabase;
- VS Code ou outro editor.

## 2. Atualizar e executar o projeto

No PowerShell do VS Code, dentro da pasta do projeto:

```powershell
git pull origin main
npm.cmd install
npm.cmd run dev
```

Acesse <http://localhost:3000>. Use `Ctrl + C` para encerrar o servidor.

## 3. Criar o projeto no Supabase

1. Acesse <https://supabase.com/dashboard> e entre na sua conta.
2. Selecione **New project**.
3. Escolha a organização, informe um nome como `site-oficial-dk` e crie uma senha forte para o banco.
4. Escolha a região disponível mais próxima dos usuários do site.
5. Crie o projeto e aguarde a conclusão da preparação.

Guarde a senha do banco em um gerenciador de senhas. Não envie a senha nem chaves secretas pelo chat.

## 4. Criar as tabelas e permissões

1. No projeto do Supabase, abra **SQL Editor**.
2. No VS Code, abra `supabase/migrations/001_initial_schema.sql`.
3. Copie todo o conteúdo desse arquivo para uma nova consulta no SQL Editor.
4. Clique em **Run** e confirme que a execução terminou sem erro.

5. Execute as migrações restantes, uma por vez, nesta ordem exata. Há arquivos com o mesmo prefixo numérico; use o nome completo para não pular nenhum:

   1. `002_document_access_rules.sql`
   2. `002_instagram_import.sql`
   3. `003_chained_document_rules.sql`
   4. `003_service_role_table_access.sql`
   5. `004_instagram_permalink_collision.sql`
   6. `005_post_video_links.sql`
   7. `005_registration_security.sql`
   8. `006_member_profile_edit_and_unique_nickname.sql`
   9. `007_member_profile_avatar.sql`
   10. `008_member_birthdays.sql`
   11. `009_assessment_module.sql`

   Em projetos que já receberam alguma dessas alterações, confira o histórico e aplique apenas as que ainda faltam. Não reexecute scripts de criação inicial em um banco já configurado.

O script cria tabelas, índices, tipos, funções e políticas de Row Level Security para:

- Membro e Oficial como níveis internos independentes da patente;
- patentes de Recruta a General de Exército;
- graduações Bronze, Prata e Ouro com acesso progressivo;
- quatro níveis administrativos independentes;
- documentos privados em PDF;
- confirmação de presença nas atividades;
- bucket privado `dk-documents` no Supabase Storage.
- banco de questões, avaliações, indicações e resultados internos.

Não execute `supabase/seed.sql` nesta etapa. Esse arquivo é opcional e insere conteúdo demonstrativo; o banco do DK começará vazio para receber eventos e publicações reais.

## 5. Configurar as chaves no site

No PowerShell do VS Code:

```powershell
Copy-Item .env.example .env.local
```

No Supabase, abra o diálogo **Connect** ou **Project Settings > API Keys**. Copie a URL do projeto, a chave publicável e a chave secreta. Preencha `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SECRET_KEY=sb_secret_...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_YOUTUBE_URL=
```

A chave publicável pode ser usada pelo navegador. A chave secreta ignora as políticas de acesso e deve permanecer somente no servidor. Nunca coloque `SUPABASE_SECRET_KEY` em uma variável iniciada por `NEXT_PUBLIC_`, em um commit ou em uma mensagem.

Depois de salvar `.env.local`, reinicie o servidor:

```powershell
npm.cmd run dev
```

## 6. Criar o primeiro ADM Principal

O cadastro público direto não existe. Para iniciar o sistema:

1. No Supabase, abra **Authentication > Users**.
2. Use **Add user** para criar o primeiro usuário e copie o UUID apresentado.
3. Abra o **SQL Editor** e execute o código abaixo, substituindo os quatro valores indicados:

```sql
insert into public.profiles (
  id, email, full_name, nickname, member_kind, rank,
  graduation_level, status
) values (
  'UUID-DO-USUARIO',
  'email@exemplo.com',
  'Filipe Alexandre',
  'Kurono',
  'oficial',
  'terceiro_sargento',
  'bronze',
  'aprovado'
);

insert into public.user_admin_roles (user_id, role)
values ('UUID-DO-USUARIO', 'principal');
```

4. Entre em <http://localhost:3000/area-do-membro/login>.
5. Abra o painel administrativo e gere o primeiro convite.

## 7. Perfis administrativos

| Papel no banco | Perfil | Permissões |
|---|---|---|
| `principal` | ADM Principal | Acesso completo |
| `midias` | ADM de Mídias | Publicações e galerias |
| `atividades` | ADM de Atividades | Calendário e eventos |
| `membros` | ADM de Membros | Convites, aprovação e acesso dos membros |

O ADM Principal também herda as permissões dos outros três perfis. Depois de entrar em `/admin`, ele poderá abrir **Membros**, editar um integrante e marcar ou remover cada papel administrativo.

Ser Membro ou Oficial não concede automaticamente nenhuma permissão administrativa. A marcação de Oficial é feita manualmente pelo ADM de Membros.

## 8. Documentos e PDFs internos

Somente o ADM Principal poderá enviar e excluir PDFs pelo menu **Documentos** do painel administrativo.

Os níveis disponíveis são:

- todos os membros aprovados;
- somente Oficiais, a partir de uma patente mínima;
- graduação mínima Bronze, Prata ou Ouro.

O acesso de graduação é progressivo: Prata também acessa Bronze, e Ouro acessa Prata e Bronze. Os arquivos permanecem no bucket privado `dk-documents`; o site gera um link temporário somente depois de validar a permissão.

## 9. Presença nas atividades

O ADM de Atividades informa início, término, local e se a confirmação está aberta. Em `/membro/atividades`, cada integrante aprovado poderá:

- marcar **Vou** ou **Não vou**;
- informar convidados ou recrutas que irão com ele;
- incluir uma observação pública;
- alterar ou remover a própria resposta;
- consultar a lista completa;
- copiar a lista ou abri-la no WhatsApp.

O WhatsApp recebe o texto formatado, mas não permite que o site crie marcações reais com `@`. Essas marcações precisam ser adicionadas manualmente depois que a mensagem for aberta.

## 10. Avaliações e simulados

Execute `supabase/migrations/009_assessment_module.sql` para ativar o módulo. Ele cria:

- banco de questões objetivas e abertas;
- classificação por patente ou graduação;
- áreas Geral, Cavalaria e Arquearia;
- avaliações com 10, 20, 30, 50 ou 100 questões;
- indicações individuais com link exclusivo;
- uma tentativa por indicação;
- correção automática das objetivas e manual das abertas;
- resultados vinculados ao perfil;
- histórico de ações dos responsáveis.

O acesso administrativo é independente dos quatro papéis de ADM:

- General de Brigada, General de Divisão e General de Exército possuem acesso automático;
- Major, Tenente-Coronel e Coronel precisam receber a permissão **Gestor de Avaliações** de um General;
- ser ADM Principal, isoladamente, não permite criar ou corrigir avaliações.

As questões, alternativas corretas e gabaritos não possuem permissão de leitura direta para o navegador. Todas as operações passam por rotas do servidor que validam a sessão, o perfil aprovado e a indicação individual.

## 11. Imagens e vídeos públicos

O CMS atual aceita URLs de capa, imagens e vídeos. A tabela `media_items` já suporta galerias.

O envio direto de imagens e vídeos públicos pelo CMS ainda não foi implementado. Essa etapa é independente do armazenamento privado de PDFs.

### Importação do Instagram pelo Apify

O ADM Principal ou ADM de Mídias pode usar **Importar do Instagram** no painel de Mídias. A integração consulta as últimas 50 publicações de um perfil público com o ator `apify/instagram-scraper`, cria as postagens publicadas e suas galerias no CMS, e evita duplicatas pelo shortcode do Instagram. O token do Apify fica apenas no servidor.

Configure no `.env.local` (e também nas variáveis do provedor de hospedagem):

```env
APIFY_TOKEN=seu_token_do_apify
APIFY_INSTAGRAM_USERNAME=dkbhmg
APIFY_INSTAGRAM_ACTOR_ID=apify~instagram-scraper
CRON_SECRET=um_segredo_longo_aleatorio
```

O `CRON_SECRET` é opcional e permite que um agendador externo chame `GET /api/admin/instagram/sync` com o cabeçalho `Authorization: Bearer <CRON_SECRET>`. A chamada manual é feita pelo painel e não exige esse segredo. Para ativar a importação automática periódica, configure esse agendador no provedor de hospedagem; o site não assume um provedor específico.

Para usar os campos de links para YouTube e TikTok em Mídias, aplique também `supabase/migrations/005_post_video_links.sql`. O importador identifica links dessas plataformas quando eles aparecem como URLs completas na legenda retornada pelo Apify.

Antes de sincronizar, aplique a migração `supabase/migrations/002_instagram_import.sql` no projeto Supabase. A sincronização importa apenas URLs de mídia retornadas pelo ator; como elas são servidas pelo Instagram, podem expirar ou mudar. Para uma cópia durável dos arquivos, será necessário adicionar uma etapa de download e armazenamento próprio.

Se o projeto foi criado antes das migrações `supabase/migrations/003_service_role_table_access.sql` e `supabase/migrations/004_instagram_permalink_collision.sql`, aplique também esses arquivos no SQL Editor, em ordem. A migração 003 concede privilégios de tabela ao papel `service_role`, usado apenas pelo servidor para operações administrativas e importações. A 004 também impede que a mesma URL do Instagram seja cadastrada duas vezes.

## 12. Ordem de validação

Depois da configuração inicial, os testes devem seguir esta ordem:

1. login do ADM Principal;
2. criação de quatro contas de teste;
3. atribuição de um papel administrativo a cada conta;
4. verificação das permissões e bloqueios de cada perfil;
5. geração e uso de convite de membro;
6. aprovação do cadastro e acesso à área interna;
7. criação de uma atividade real com confirmação aberta;
8. teste das respostas **Vou** e **Não vou** com duas contas;
9. cópia e compartilhamento da lista;
10. envio de PDFs gerais, de Oficial e de cada graduação;
11. tentativa de abertura de cada PDF com perfis permitidos e bloqueados;
12. criação de uma publicação real como rascunho e posterior publicação.
13. cadastro de dez questões objetivas e uma questão aberta;
14. criação de uma avaliação e indicação para uma conta de teste;
15. tentativa de abrir o link com outra conta;
16. entrega da avaliação e verificação do bloqueio de segunda tentativa;
17. correção da questão aberta e conferência do resultado no perfil;
18. delegação e revogação do Gestor de Avaliações para um Oficial Superior.

O roteiro completo, com a matriz de permissões esperada, está em `docs/TESTES-ACESSO.md`.

## 13. Publicação futura

Quando chegar a etapa de colocar o site na internet, cadastre as mesmas variáveis de ambiente no provedor de hospedagem e altere `NEXT_PUBLIC_SITE_URL` para o domínio definitivo.

Antes da publicação, valide localmente:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd start
```

### Aniversários dos membros

Execute também `supabase/migrations/008_member_birthdays.sql` no SQL Editor. Essa migração permite consultar apelido, dia e mês dos aniversariantes somente com uma sessão de membro aprovado. O ano de nascimento não é exposto no calendário. Enquanto essa função não estiver disponível, o servidor pode consultar os dados usando `SUPABASE_SECRET_KEY` (ou `SUPABASE_SERVICE_ROLE_KEY`), após validar a sessão e o status aprovado do membro. Apenas apelido, dia e mês são enviados ao calendário. Falhas de consulta exibem um aviso de indisponibilidade.
