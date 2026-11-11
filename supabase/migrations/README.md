# Migrações

As instalações existentes ainda podem aplicar cada arquivo pelo **SQL Editor**,
na ordem indicada em `docs/SETUP.md`. Os arquivos históricos usam uma sequência
curta e possuem duplicatas conhecidas. Migrações novas são geradas pela CLI do
Supabase e usam um carimbo de data e hora, que também preserva a ordem sem
reutilizar os prefixos antigos.

## Renomear não quebra o site

Renomear um arquivo não altera o banco de dados: nenhuma migração é reexecutada,
nem o schema muda. A instalação em produção continua funcionando exatamente
igual. O que renomear quebra é a **próxima aplicação manual**, por dois motivos:

1. Um arquivo renomeado deixa de casar com o nome citado no `docs/SETUP.md` e
   nos outros documentos, então quem for aplicar "as que faltam" pode executar
   de novo algo que já rodou.
2. Em um projeto que passe a registrar o histórico pela CLI, as duplicatas
   antigas precisam ser reconciliadas antes do primeiro `db push`.

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
repositório e o que já foi executado. Gere os próximos arquivos com
`supabase migration new nome_da_alteracao`.

## Verificação

```
npm run check:migrations
```

O script aceita os três prefixos duplicados acima e **falha se aparecer um
quarto**. Uma migração nova com carimbo de data e hora não deve reutilizar
nenhum prefixo existente.
