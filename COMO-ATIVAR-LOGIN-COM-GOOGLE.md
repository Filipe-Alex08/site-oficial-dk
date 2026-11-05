# Como ativar o login com Google

1. No [Google Cloud](https://console.cloud.google.com/), configure o aplicativo em **Google Auth Platform** (nome, e-mail de suporte e público externo). Use apenas os escopos `openid`, `email` e `profile`.
2. Crie um cliente OAuth do tipo **Aplicativo da Web**:
   - Origem autorizada: `https://death-knights.com.br`.
   - Redirecionamento autorizado: a URL de callback do **Supabase**, normalmente `https://DOMINIO-DO-SUPABASE/auth/v1/callback`.
   - Guarde o **Client ID** e o **Client Secret**.
3. Ative o Google no Supabase:
   - **Hospedado:** Authentication → Providers → Google. Ative e preencha o ID e o segredo.
   - **Servidor próprio:** configure `GOOGLE_ENABLED=true`, `GOOGLE_CLIENT_ID` e `GOOGLE_SECRET` no ambiente do Supabase, conecte essas variáveis ao serviço `auth` e recrie-o. [Configuração exata do servidor](docs/SETUP.md#143-supabase-auto-hospedado-servidor-do-diogo).
4. Nas configurações de URL do Supabase, defina:
   - **Site URL:** `https://death-knights.com.br`.
   - **Redirect URLs:** `https://death-knights.com.br/auth/callback`.
5. Confira no servidor do **site** as variáveis `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` e `SUPABASE_SECRET_KEY`. Publique a versão com o OAuth integrado.
6. Libere o aplicativo Google para produção, ou adicione seu Gmail aos usuários de teste. Entre em `/area-do-membro/login` e clique em **Entrar com Google**, usando o mesmo e-mail de um membro aprovado.

**Importante:** o Google retorna ao Supabase; o Supabase retorna ao site. São duas URLs diferentes. ID e segredo do Google ficam no Supabase, nunca no Git.

Para testar localmente, adicione a origem `http://localhost:3000` no Google e `http://localhost:3000/auth/callback` às URLs permitidas do Supabase.

O Google não libera acesso automaticamente: membros pendentes ou sem cadastro continuam bloqueados. [Guia completo e testes](docs/SETUP.md#14-login-com-google).
