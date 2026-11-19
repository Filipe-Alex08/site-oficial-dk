# E-mails de autenticação (português e assinatura)

Os e-mails de "esqueci minha senha", troca de e-mail e convite saem do **servidor de Auth do Supabase**, não do site. Dois ajustes fazem eles parecerem e serem confiáveis: o **texto em português** e a **assinatura do domínio** (SPF, DKIM e DMARC).

## 1. Texto em português

Os modelos estão em `public/email-templates/` (um `.html` por tipo, mais `assuntos.json` com os assuntos). Para editar o texto, mude `scripts/build-email-templates.mjs` e rode `node scripts/build-email-templates.mjs`.

| Arquivo | Quando é enviado | Variável do Supabase |
|---|---|---|
| `recovery.html` | Esqueci minha senha | `Reset Password` |
| `email_change.html` | Troca de e-mail (vai para o atual e para o novo) | `Change Email Address` |
| `confirmation.html` | Confirmar cadastro | `Confirm sign up` |
| `invite.html` | Convite do painel do Supabase | `Invite user` |
| `magic_link.html` | Link mágico | `Magic Link` |
| `reauthentication.html` | Código de reautenticação | `Reauthentication` |

### Projeto hospedado (teste)
**Authentication → Emails → Templates**: para cada tipo, cole o assunto de `assuntos.json` em *Subject* e o conteúdo do `.html` em *Message body* (modo código-fonte). Salve cada aba.

### Servidor próprio (produção): automático no deploy
O `.\deploy\deploy.ps1` faz isto sozinho no passo 5/5: depois de publicar o site, aponta o serviço `auth` para os modelos que o site serve em `https://death-knights.com.br/email-templates/<nome>.html` (a pasta `public/email-templates/` vai junto em cada publicação) e para os assuntos de `assuntos.json`.

- **O que muda:** só o `docker-compose.yml` do Supabase (serviço `auth`: 6 variáveis `GOTRUE_MAILER_SUBJECTS_*` e 6 `GOTRUE_MAILER_TEMPLATES_*`, sem segredos) e só o `auth` é recriado. Se os modelos não mudaram, nada é tocado e nada é perguntado.
- **Antes de editar:** confere que o site serve os 6 modelos e que o **próprio contêiner `auth` consegue buscá-los** (primeiro pelo endereço público; se o Cloudflare barrar, pelo gateway da rede Docker). Um modelo inalcançável pode impedir o envio de e-mails, então, se nenhum endereço funcionar, nada é alterado e o erro explica as saídas.
- **Segurança:** valida com `docker compose config`, mostra a diferença, pede `APLICAR`, faz backup em `/var/backups/site-oficial-dk/email-templates/` e restaura sozinho se o teste ao vivo falhar.
- **Se falhar ou você recusar:** o site continua publicado e o release avisa no fim. Repita só esse passo com `.\deploy\email-templates.ps1 -Apply`; confira com `.\deploy\email-templates.ps1` (sem argumentos) ou desfaça com `-Rollback`.
- **Pular num release:** `.\deploy\deploy.ps1 -NoEmailTemplates`.
- **Mudar o texto:** edite `scripts/build-email-templates.mjs`, rode `node scripts/build-email-templates.mjs`, faça commit e o próximo deploy aplica (o compose só é editado quando o endereço ou o assunto mudam; o conteúdo do `.html` é buscado pelo GoTrue a cada envio, então só publicar o site já basta).

## 2. Assinatura: SPF, DKIM e DMARC

É o que prova ao Gmail e aos outros provedores que o e-mail saiu de um servidor autorizado pelo dono do domínio. **Só funciona com remetente no seu domínio**: com `@gmail.com` o Brevo troca o endereço por `...@<id>.brevosend.com`, porque o Gmail não deixa terceiros assinarem em nome dele.

1. No Brevo: **Senders, Domains & Dedicated IPs → Domains → Add a domain** → `death-knights.com.br`.
2. O Brevo lista os registros. Crie todos no DNS do domínio (no Cloudflare, como **DNS only**, nuvem cinza):
   - **Código de verificação do Brevo** (TXT `brevo-code:...`);
   - **DKIM** (a assinatura; normalmente CNAMEs `brevo1._domainkey` e `brevo2._domainkey`);
   - **DMARC** (TXT em `_dmarc`). Comece com `v=DMARC1; p=none; rua=mailto:<um-endereço-seu>` e endureça para `p=quarantine` depois de alguns dias sem falhas.
   - **SPF**: se o domínio já tem um TXT `v=spf1 ...`, acrescente `include:spf.brevo.com` nele; nunca crie um segundo SPF.
3. Clique em **Authenticate** no Brevo. Quando o domínio constar como autenticado, cadastre o remetente `noreply@death-knights.com.br`.
4. Troque o remetente no SMTP: no projeto hospedado, *Sender email* em Authentication → Emails → SMTP Settings; no servidor próprio, `SMTP_ADMIN_EMAIL=noreply@death-knights.com.br` e recrie o `auth`.

### Conferir se ficou assinado
Peça um "esqueci minha senha" para um Gmail, abra o e-mail e use **⋮ → Mostrar original**. No topo devem aparecer **SPF: PASS**, **DKIM: PASS** e **DMARC: PASS**, e o remetente deve ser `noreply@death-knights.com.br`. Se algum aparecer como FAIL ou NEUTRAL, o registro DNS correspondente está errado ou ainda não propagou.

## 3. Frase de segurança (prova dentro do e-mail)

O DKIM assina o e-mail por baixo, mas o membro não vê isso. A **frase de segurança** é a prova visível: cada membro define uma frase em **Editar perfil → Segurança**, e todo e-mail verdadeiro mostra a frase num quadro verde ("Sua frase de segurança: ..."). Um e-mail falso não sabe a frase. Quem ainda não definiu vê um aviso amarelo ensinando a criar.

- Fica em `user_metadata.frase_seguranca` (é o único dado do usuário que os modelos do Auth enxergam: `{{ .Data.frase_seguranca }}`). Aceita 3 a 40 caracteres, só letras, números, espaço e `. , ! ? -`.
- **Vale a partir do momento em que os modelos em português estiverem colados** no Supabase (seção 1); antes disso os e-mails continuam no texto padrão.
- A **troca de e-mail não mostra a frase** de propósito: o Auth usa o mesmo modelo para o endereço atual e para o novo, e `user_metadata` é editável pelo próprio usuário. Mostrar esse texto ao endereço novo deixaria um membro mal-intencionado escrever o que quisesse num e-mail "oficial" enviado a outra pessoa. Esse e-mail se confere pelos dois endereços citados no corpo e pelo DKIM.
- Se um dia for preciso um código impossível de forjar *calculado por e-mail* (por exemplo, um selo que o membro cola numa página do site para conferir), isso exige enviar os e-mails pelo próprio site com o "Send Email Hook" do Auth, em vez dos modelos. É mais trabalho e só vale se a frase não bastar.
