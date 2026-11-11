# Google Agenda e controle de presença

## Modelo adotado

O calendário do site continua sendo a fonte oficial. Quando a integração está
configurada, cada atividade criada ou alterada no painel administrativo é
espelhada em um calendário institucional do Google. Uma falha do Google não
apaga nem desfaz a atividade salva no DK; o painel mostra a falha e permite
tentar a sincronização novamente.

O Google Agenda serve para divulgação e acompanhamento de alterações. A
resposta **Vou/Não vou** e o comparecimento efetivamente validado continuam no
site. O projeto não importa respostas do Google e não troca automaticamente a
presença real com base em um RSVP externo.

## Antes de configurar

1. Crie uma conta institucional administrada pelo DK, protegida por autenticação
   em dois fatores e recuperação sob controle de mais de um responsável.
2. Nessa conta, crie um calendário exclusivo para as atividades do DK e defina
   o fuso horário como `America/Sao_Paulo`.
3. Torne público apenas esse calendário. Não use o calendário pessoal de um
   organizador e não publique dados internos ou listas de membros na descrição.
4. Copie o identificador do calendário e o link público para adicioná-lo no
   Google Agenda.

Quem adiciona um calendário público controla as próprias notificações no
Google. Alterar ou cancelar um evento atualiza o espelho, mas isso não garante
que todas as pessoas receberão e-mail ou alerta: cada assinante precisa manter
as notificações habilitadas. O aviso em destaque no site continua sendo o canal
público independente do Google.

## Credencial OAuth

1. No Google Cloud, crie ou escolha um projeto institucional.
2. Ative a **Google Calendar API**.
3. Configure a tela de consentimento OAuth e publique o aplicativo quando
   apropriado. Aplicativos externos mantidos em modo de teste podem emitir
   refresh tokens de curta duração.
4. Crie um cliente OAuth do tipo aplicação Web.
5. Autorize a conta institucional com acesso offline e o escopo mínimo
   `https://www.googleapis.com/auth/calendar.events.owned`.
6. Guarde o `client_id`, o `client_secret` e o `refresh_token` no gerenciador de
   segredos da hospedagem. Nunca coloque esses valores em variáveis
   `NEXT_PUBLIC_`, commits, prints ou mensagens.

O OAuth 2.0 Playground pode ser usado para obter o refresh token. Se ele for
utilizado, cadastre `https://developers.google.com/oauthplayground` como URI de
redirecionamento do cliente e marque a opção para usar as credenciais próprias.
Depois de concluir, remova URIs que não serão mais necessárias.

## Variáveis de ambiente

Preencha no `.env.local` e no ambiente de produção:

```env
GOOGLE_CALENDAR_ID=identificador-do-calendario
GOOGLE_CALENDAR_CLIENT_ID=cliente-oauth
GOOGLE_CALENDAR_CLIENT_SECRET=segredo-oauth
GOOGLE_CALENDAR_REFRESH_TOKEN=refresh-token
GOOGLE_CALENDAR_PUBLIC_URL=https://calendar.google.com/calendar/...
```

As quatro primeiras variáveis ativam o espelho. `GOOGLE_CALENDAR_PUBLIC_URL`
exibe no site o botão para o visitante acompanhar o calendário. O link precisa
usar HTTPS. Sem as quatro credenciais, o painel exibe **Não configurado** e todo
o restante continua funcionando.

## Ativação no banco

Aplique, depois das migrações anteriores:

```text
supabase/migrations/20261111005828_calendar_google_notifications_presence.sql
```

Ela adiciona os avisos públicos e cria duas áreas privadas, acessíveis somente
pela chave de serviço:

- estado técnico da sincronização com o Google;
- presença real validada pelos administradores.

Os segredos OAuth não são gravados no Supabase. As tabelas privadas têm RLS
ativada e não concedem acesso a `anon` nem `authenticated`.

## Operação diária

1. O ADM de Atividades cria ou edita a atividade no site.
2. Para cancelamento ou adiamento, publica uma mensagem e define até quando o
   aviso ficará visível.
3. Confere no painel se o estado ficou **Sincronizado**. Em caso de falha, usa o
   botão de nova tentativa após corrigir a configuração.
4. Depois da atividade, abre **Presenças** e registra comparecimento, ausência ou
   justificativa. A intenção original permanece separada para comparação.

Não edite diretamente no Google um evento criado pelo site: a próxima
sincronização substituirá esses ajustes. Uma alteração urgente deve ser feita no
painel do DK para atualizar, ao mesmo tempo, o aviso público e o espelho.

## Limites desta primeira etapa

- sincronização em uma direção: site → Google;
- nenhuma lista de membros ou observação administrativa é enviada ao Google;
- nenhum RSVP do Google altera o banco;
- notificações dependem das preferências de cada assinante;
- o responsável ainda valida manualmente a presença real no site.
