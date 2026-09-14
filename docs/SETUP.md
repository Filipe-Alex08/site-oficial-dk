# Configuração do Site Oficial do DK

## 1. Requisitos

- Node.js 22 ou superior
- npm
- Uma conta no Supabase
- VS Code ou outro editor

## 2. Instalação local

Clone o repositório e execute:

    npm install
    npm run dev

Acesse http://localhost:3000.

Sem configurar o Supabase, todas as páginas públicas funcionam com dados demonstrativos. Login, cadastro e CMS exigem o banco.

## 3. Criar o banco no Supabase

1. Crie um projeto no painel do Supabase.
2. Abra o SQL Editor.
3. Execute todo o conteúdo de supabase/migrations/001_initial_schema.sql.
4. Opcionalmente, execute supabase/seed.sql para inserir dados demonstrativos.

## 4. Variáveis de ambiente

Copie .env.example para .env.local e preencha:

    NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
    SUPABASE_SERVICE_ROLE_KEY=SUA_CHAVE_SERVICE_ROLE
    NEXT_PUBLIC_SITE_URL=http://localhost:3000
    NEXT_PUBLIC_YOUTUBE_URL=

A chave service role é secreta. Nunca a coloque em arquivos públicos, no navegador ou em commits.

## 5. Criar o primeiro ADM Principal

O cadastro público não existe. Para iniciar o sistema:

1. No Supabase, abra Authentication > Users.
2. Crie manualmente o primeiro usuário.
3. Copie o UUID desse usuário.
4. Execute no SQL Editor, substituindo os valores:

    insert into public.profiles (
      id, email, full_name, nickname, status
    ) values (
      'UUID-DO-USUARIO',
      'email@exemplo.com',
      'Nome do Administrador',
      'Apelido',
      'aprovado'
    );

    insert into public.user_admin_roles (user_id, role)
    values ('UUID-DO-USUARIO', 'principal');

5. Entre em /area-do-membro/login.
6. Abra o Painel administrativo e gere o primeiro convite.

## 6. Perfis administrativos

- principal: acesso completo.
- midias: gerencia publicações e arquivos.
- atividades: gerencia o calendário.
- membros: aprova, suspende e exclui membros, além de gerar convites.

O ADM Principal pode adicionar papéis pela tabela user_admin_roles. A interface para distribuir papéis poderá ser ampliada sem mudar o banco.

## 7. Imagens e vídeos

A primeira versão aceita URLs de capa e URLs de mídia. A tabela media_items já está preparada para galerias de imagens e vídeos.

Para uploads diretos, crie um bucket público chamado dk-media no Supabase Storage e adicione o componente de upload usando a mesma permissão do ADM de Mídias.

## 8. Publicação

O projeto pode ser publicado na Vercel ou em outro serviço compatível com Next.js. Cadastre as mesmas variáveis de ambiente no provedor escolhido.

Antes de publicar:

    npm run build
    npm start

## 9. Próximas personalizações

- Adicionar logotipo e fotografias oficiais.
- Informar o link do YouTube.
- Cadastrar imagens das patentes, ordens e builds.
- Revisar os textos históricos definitivos.
- Atualizar o cronograma demonstrativo.
