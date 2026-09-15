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

O script cria tabelas, índices, tipos, funções e políticas de Row Level Security para os quatro níveis administrativos.

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

O ADM Principal também herda as permissões dos outros três perfis. A atribuição de papéis ainda é feita na tabela `user_admin_roles`; a interface para distribuir esses papéis será uma das próximas melhorias.

## 8. Imagens e vídeos

O CMS atual aceita URLs de capa, imagens e vídeos. A tabela `media_items` já suporta galerias.

O envio direto de arquivos pelo CMS ainda não foi implementado. Essa etapa exigirá um bucket no Supabase Storage e políticas próprias de upload para o ADM de Mídias.

## 9. Ordem de validação

Depois da configuração inicial, os testes devem seguir esta ordem:

1. login do ADM Principal;
2. criação de quatro contas de teste;
3. atribuição de um papel administrativo a cada conta;
4. verificação das permissões e bloqueios de cada perfil;
5. geração e uso de convite de membro;
6. aprovação do cadastro e acesso à área interna;
7. criação de uma atividade real;
8. criação de uma publicação real como rascunho e posterior publicação.

## 10. Publicação futura

Quando chegar a etapa de colocar o site na internet, cadastre as mesmas variáveis de ambiente no provedor de hospedagem e altere `NEXT_PUBLIC_SITE_URL` para o domínio definitivo.

Antes da publicação, valide localmente:

```powershell
npm.cmd run lint
npm.cmd run build
npm.cmd start
```
