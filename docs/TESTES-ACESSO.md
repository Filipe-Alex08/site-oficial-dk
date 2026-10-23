# Roteiro de testes de acesso do DK

Use este roteiro somente depois de configurar o Supabase e criar o primeiro ADM Principal.

## 1. Regras esperadas

| Perfil | Área do membro | Documentos gerais | Documentos de Oficial | Documentos de graduação | Avaliação indicada | Gestão de avaliações | CMS |
|---|---:|---:|---:|---:|---:|---:|---:|
| Cadastro pendente | Não | Não | Não | Não | Não | Não | Não |
| Membro aprovado | Sim | Sim | Não | Conforme graduação | Sim | Não | Somente se possuir um papel de ADM |
| Oficial aprovado | Sim | Sim | Conforme patente mínima | Conforme graduação | Sim | Conforme patente e delegação | Somente se possuir um papel de ADM |

Ser Oficial não transforma o usuário em administrador. Patente, graduação e papel de ADM são controles separados.

## 2. Progressão dos documentos

| Graduação do integrante | Bronze | Prata | Ouro |
|---|---:|---:|---:|
| Sem graduação | Não | Não | Não |
| Bronze | Sim | Não | Não |
| Prata | Sim | Sim | Não |
| Ouro | Sim | Sim | Sim |

Nos documentos de Oficial, a patente funciona da mesma forma: o integrante acessa materiais cuja patente mínima seja igual ou inferior à sua patente, desde que esteja marcado como Oficial.

## 3. Quatro níveis administrativos

| Ação | Principal | Mídias | Atividades | Membros |
|---|---:|---:|---:|---:|
| Publicações e galerias | Sim | Sim | Não | Não |
| Calendário | Sim | Não | Sim | Não |
| Membros e convites | Sim | Não | Não | Sim |
| Atribuir papéis de ADM | Sim | Não | Não | Não |
| Enviar e excluir PDFs internos | Sim | Não | Não | Não |

Para testar corretamente, utilize contas diferentes. Não atribua vários papéis à mesma conta durante o teste inicial.

## 4. Presença nas atividades

Para cada conta de membro aprovada:

1. Abra `/membro/atividades`.
2. Marque **Vou** e informe um convidado.
3. Confirme que somente a própria resposta pode ser alterada.
4. Em outra conta, marque **Não vou** e inclua uma observação.
5. Confira se as duas respostas aparecem para os membros aprovados.
6. Use **Copiar lista** e confira data, horário, local e participantes.
7. Use **WhatsApp** e confira o texto antes de enviá-lo.
8. Feche a lista pelo ADM de Atividades e confirme que novas alterações ficam bloqueadas.

As marcações reais com `@` devem ser adicionadas manualmente no WhatsApp.

## 5. PDFs privados

Cadastre pelo menos quatro PDFs de teste:

1. geral para todos os membros;
2. somente para Oficiais a partir de uma patente definida;
3. graduação Bronze;
4. graduação Ouro.

Depois, tente abrir cada arquivo com perfis permitidos e bloqueados. Um usuário sem permissão deve receber “Documento não encontrado ou sem permissão de acesso”, mesmo que conheça o endereço do download.

## 6. Avaliações e simulados

Prepare duas contas aprovadas: um General e um integrante indicado. Para validar a delegação, prepare também um Major, Tenente-Coronel ou Coronel.

1. Entre como General e abra **Administração > Avaliações**.
2. Cadastre dez questões objetivas com cinco alternativas e somente uma correta.
3. Cadastre ao menos uma questão aberta com gabarito esperado.
4. Crie uma avaliação de dez questões, escolhendo objetivo, conteúdos e área.
5. Indique o integrante e copie o link individual.
6. Abra o link sem sessão e confirme o redirecionamento ao login.
7. Entre com uma conta diferente da indicada e confirme o bloqueio.
8. Entre como o integrante correto, inicie a avaliação e responda algumas questões.
9. Feche a página, abra novamente e confirme que a mesma tentativa continua.
10. Entregue a avaliação e confirme que as respostas não podem ser alteradas.
11. Se houver resposta aberta, confirme a situação **Aguardando correção**.
12. Entre como General, corrija a resposta e confira o resultado final no histórico do integrante.
13. Gere uma nova indicação para o mesmo integrante e confirme que ela recebe outro número e outro link.
14. Conceda a permissão de Gestor de Avaliações ao Oficial Superior e teste o acesso.
15. Revogue a permissão e confirme que o painel deixa de ser acessível.

O ADM Principal sem uma patente autorizada e sem delegação não deve acessar o módulo de avaliações. O gabarito também não deve aparecer nas respostas das rotas usadas pelo integrante.
