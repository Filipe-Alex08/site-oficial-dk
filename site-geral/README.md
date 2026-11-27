# Site Geral do DK

Estrutura inicial do novo site do DK, destinado a reunir todas as divisões e aproveitar a base do site atual de Belo Horizonte.

## Etapa atual

Esta entrega prepara as pastas do projeto. Os arquivos `.gitkeep` permitem que o Git registre os diretórios ainda vazios. A implementação das páginas, a adaptação do conteúdo e a configuração de execução serão realizadas nas próximas etapas.

A base de referência está na raiz deste repositório, no commit [e593bc4](https://github.com/Filipe-Alex08/site-oficial-dk/commit/e593bc46d848606857bdf034b916706e7f2338a2). Ela utiliza Next.js, React e TypeScript; consulte o [README da base](../README.md) e o [package.json](../package.json).

## Organização das pastas

Todos os caminhos abaixo são relativos a `site-geral/`.

| Pasta | Finalidade prevista |
| --- | --- |
| `app/` | Página inicial, layouts e rotas do site geral. |
| `app/sobre/` | Apresentação institucional do DK. |
| `app/divisoes/` | Apresentação e listagem das divisões. |
| `app/divisoes/[slug]/` | Modelo de página individual de uma divisão. |
| `app/atividades/jogos/` | Catálogo comum de jogos e modalidades. |
| `app/atividades/jogos/[slug]/` | Página individual de cada jogo. |
| `app/eventos/` | Eventos do DK e de suas divisões. |
| `app/midias/` | Fotos, vídeos e publicações. |
| `app/area-do-membro/` | Entrada, cadastro e recuperação de acesso. |
| `app/membro/` | Área autenticada dos integrantes. |
| `app/admin/` | Painel de administração. |
| `app/api/` | Rotas de servidor e integrações. |
| `components/site/` | Cabeçalho, rodapé, navegação e seções comuns. |
| `components/ui/` | Elementos reutilizáveis de interface. |
| `components/divisoes/` | Componentes de apresentação das divisões. |
| `components/auth/` | Componentes de autenticação. |
| `components/member/` | Componentes da área do membro. |
| `components/admin/` | Componentes administrativos. |
| `lib/conteudo/` | Conteúdo institucional compartilhado. |
| `lib/divisoes/` | Dados, tipos e funções relacionados às divisões. |
| `public/images/institucional/` | Imagens públicas de uso geral do DK. |
| `public/images/divisoes/` | Imagens públicas das divisões. |
| `docs/` | Documentação de configuração e evolução do site geral. |

O segmento `[slug]` representa o identificador de cada divisão ou jogo. As pastas são reservas de organização; as rotas passarão a existir quando os arquivos de página forem implementados.

## Reaproveitamento da base

Os diretórios existentes [app](../app/), [components](../components/), [lib](../lib/) e [public](../public/) servirão de referência para adaptar as páginas, os componentes, os conteúdos e os materiais visuais.

- Preservar a identidade visual do DK ao adaptar os componentes.
- Centralizar conteúdos comuns e relacionar os conteúdos específicos à divisão correspondente.
- Tratar a lista de divisões, seus nomes, responsáveis, locais e contatos como **pendentes de definição**.
- Usar sempre o artigo masculino: **o DK** e **do DK**.

## Próximas etapas

1. Configurar o novo aplicativo e seu escopo de compilação.
2. Reaproveitar o layout, a navegação, os componentes e os materiais do site atual.
3. Definir os dados oficiais das divisões e implementar suas páginas.
4. Adaptar eventos, mídias, jogos e as áreas de membros e administração ao contexto de todas as divisões.

### Configuração antes de adicionar código

O [tsconfig.json da raiz](../tsconfig.json) inclui `**/*.ts` e `**/*.tsx` de forma recursiva. Antes de adicionar código em `site-geral/`, configurar o aplicativo e ajustar esse escopo para que cada projeto compile seus próprios arquivos. A estrutura atual contém somente Markdown e marcadores de diretório.

As configurações de execução, acesso, dados e publicação do site geral estão pendentes para as etapas de implementação.
