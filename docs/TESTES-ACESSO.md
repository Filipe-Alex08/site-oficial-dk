# Roteiro de testes de acesso do DK

Use este roteiro somente depois de configurar o Supabase e criar o primeiro ADM Principal.

## 1. Regras esperadas

| Perfil | Área do membro | Documentos gerais | Documentos de Oficial | Documentos de graduação | CMS |
|---|---:|---:|---:|---:|---:|
| Cadastro pendente | Não | Não | Não | Não | Não |
| Membro aprovado | Sim | Sim | Não | Conforme graduação | Somente se possuir um papel de ADM |
| Oficial aprovado | Sim | Sim | Conforme patente mínima | Conforme graduação | Somente se possuir um papel de ADM |

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
