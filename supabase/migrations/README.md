# Migrações

Aqui não existe CLI nem tabela de histórico: cada arquivo é colado no **SQL
Editor** do Supabase à mão, seguindo o `docs/SETUP.md`. O banco **não guarda os
nomes dos arquivos** — ele só sabe o que já foi executado porque alguém lembra.
É por isso que o prefixo numérico importa: ele é a única indicação de ordem.

## Renomear não quebra o site

Renomear um arquivo não altera o banco de dados: nenhuma migração é reexecutada,
nem o schema muda. A instalação em produção continua funcionando exatamente
igual. O que renomear quebra é a **próxima aplicação manual**, por dois motivos:

1. Um arquivo renomeado deixa de casar com o nome citado no `docs/SETUP.md` e
   nos outros documentos, então quem for aplicar "as que faltam" pode executar
   de novo algo que já rodou.
2. Se um dia o projeto passar a usar a CLI do Supabase, ela grava um registro por
   migração identificado pelo prefixo numérico — e dois arquivos com o mesmo
   prefixo não cabem nesse registro. A duplicata precisa ser resolvida **antes**
   de adotar a CLI, não depois.

## Duplicatas conhecidas

Três prefixos aparecem duas vezes:

| Prefixo | Arquivos | Ordem aplicada |
| --- | --- | --- |
| 002 | `002_document_access_rules.sql`, `002_instagram_import.sql` | alfabética |
| 003 | `003_chained_document_rules.sql`, `003_service_role_table_access.sql` | alfabética |
| 005 | `005_post_video_links.sql`, `005_registration_security.sql` | alfabética |

O desempate é o sufixo alfabético (`document` antes de `instagram`, `chained`
antes de `service`, `post` antes de `registration`). Na prática essa ordem é
inofensiva — os pares são independentes entre si —, mas ela é acidental, não
planejada, e vale conferir isso ao criar um banco novo.

**Recomendação:** deixe os arquivos existentes com os nomes atuais. Renomeá-los
não traz nenhum ganho para o banco em produção e cria divergência entre o
repositório e o que já foi executado. Num banco novo, renumere antes da primeira
aplicação, se quiser.

## Verificação

```
npm run check:migrations
```

O script aceita os três prefixos duplicados acima e **falha se aparecer um
quarto**. Se você está criando uma migração nova e o script reclamar, renomeie
o arquivo novo para o próximo número livre.
