# Testar o login com Google em um projeto de teste

Este roteiro testa o botão **Entrar com Google** sem tocar no Supabase real. Use um projeto Supabase **só para teste**, que você apaga no fim. A configuração do servidor de produção está na [seção 14 do SETUP.md](SETUP.md#14-login-com-google).

> Nunca use as chaves do projeto de teste em um ambiente real nem rode, no servidor real, os SQLs de teste deste roteiro. Não cole chaves no chat, em issues nem em commits.

## 1. Preparar o projeto de teste (uma vez)

1. Crie um projeto novo em <https://supabase.com/dashboard> (o plano gratuito costuma bastar).
2. No **SQL Editor**, aplique as migrações de `supabase/migrations`, da `001` à `011`, na ordem da [seção 4 do SETUP.md](SETUP.md#4-criar-as-tabelas-e-permissões). A `011` está descrita na seção 13. A `012` é opcional (só guarda mídia do Instagram).
3. No Google Cloud ([seção 14.1](SETUP.md#141-google-cloud-console)), crie um cliente **Web application** com:
   - origem JavaScript: `http://localhost:3000`;
   - URI de redirecionamento: `https://<ref-do-projeto>.supabase.co/auth/v1/callback`;
   - **Audience** em **Teste**, com o seu Gmail em **Test users** (inclua também o Gmail do caso 3, se for outro).
4. No painel do projeto de teste ([seção 14.2](SETUP.md#142-supabase-hospedado)):
   - **Authentication > Sign In / Providers > Google**: ative e cole o Client ID e o Client Secret;
   - **Authentication > URL Configuration**: Site URL `http://localhost:3000` e Redirect URL `http://localhost:3000/auth/callback`.
5. Crie o `.env.local` na raiz do projeto com as chaves de **Project Settings > API Keys**:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://<ref-do-projeto>.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
   SUPABASE_SECRET_KEY=sb_secret_...
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   O `.gitignore` ignora todo arquivo `.env*`, menos o `.env.example`. Se você guardar as chaves em outro arquivo (por exemplo `.env.test.google`), os nomes costumam ser diferentes: `SUPABASE_URL` vira `NEXT_PUBLIC_SUPABASE_URL` e `SUPABASE_PUBLISHABLE_KEY` vira `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
6. Rode `npm.cmd run dev` e abra <http://localhost:3000/area-do-membro/login>. Use `localhost`, não `127.0.0.1`.

## 2. Criar o membro de teste

Crie um usuário com o **seu Gmail** e um perfil `aprovado`: em **Authentication > Users > Add user**, marque **Auto Confirm User** e copie o UUID do usuário. Depois rode o SQL da [seção 6 do SETUP.md](SETUP.md#6-criar-o-primeiro-adm-principal), trocando o e-mail pelo seu Gmail e deixando `status` como `aprovado`.

O Supabase exige senha de pelo menos 6 caracteres e o formulário do site pede 8 ou mais. Para o login com Google a senha não é necessária.

## 3. Os três casos, com um Gmail só

Abra o login e clique em **Entrar com Google**. Entre um caso e outro, clique em **Sair** em `/membro`.

| Caso | Preparação (SQL Editor) | Resultado esperado |
|---|---|---|
| 1. Aprovado | nenhuma | Cai em `/membro`. Em **Authentication > Users** continua um usuário só, agora com e-mail e Google |
| 2. Pendente | `update public.profiles set status = 'pendente' where email = 'SEU-GMAIL';` | Volta ao login com "Seu cadastro ainda está aguardando aprovação." e sem sessão |
| 3. Sem cadastro | `delete from auth.users where email = 'SEU-GMAIL';` (o perfil sai junto) | Volta ao login com "Não encontramos um cadastro de membro…". O site apaga a conta que o Google acabou de criar, então **Users** não deve ter nenhum usuário novo |

Para voltar ao estado normal, use `update public.profiles set status = 'aprovado' where email = 'SEU-GMAIL';` depois do caso 2, ou recrie o usuário depois do caso 3.

Com os três casos passando, desligue **Allow new users to sign up** ([seção 14.5](SETUP.md#145-bloquear-cadastros-públicos-no-supabase-recomendado)) e repita os casos 1 e 3. Com o cadastro desligado, o caso 3 volta com a mesma mensagem, mas o Supabase nem chega a criar a conta.

## 4. Problemas comuns

A tabela da [seção 14.6](SETUP.md#146-teste-manual) cobre os erros típicos. Quando aparecer "Não foi possível entrar com o Google", o terminal do `npm.cmd run dev` pode mostrar a causa.

## 5. Limpeza

- Apague os usuários de teste em **Authentication > Users**, ou o projeto Supabase inteiro.
- Apague o `.env.local` e qualquer arquivo com as chaves de teste.
- Remova o cliente do Google Cloud se ele foi criado só para o teste.
