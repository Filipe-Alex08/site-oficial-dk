# SEO do site DK

## Auditoria e alterações

O site tinha títulos, uma descrição global e HTML renderizado no servidor. Faltavam URLs canônicas, sitemap, robots.txt, imagens e metadados de compartilhamento, descrições específicas e uma política de não indexação para páginas internas.

- Domínio canônico confirmado: `https://death-knights.com.br`, configurado em `lib/seo.ts`.
- As oito páginas públicas têm título, descrição, canonical e Open Graph/Twitter próprios.
- Publicações recebem metadados do conteúdo real, imagem de capa e tipo article. A consulta do artigo é compartilhada entre página e metadados durante a requisição.
- JSON-LD descreve a organização esportiva e o site na home; artigos incluem Article e BreadcrumbList. Não foram inventados avaliações, endereço completo, horários, autores individuais ou eventos.
- `/sitemap.xml` lista páginas públicas e publicações publicadas do banco. Não inclui páginas privadas, demos nem rotas de redirecionamento. Atualiza a cada hora e pagina consultas de publicações. Datas não são inventadas a cada requisição.
- `/robots.txt` aponta para o sitemap em produção. Desenvolvimento e previews Vercel ficam bloqueados. Páginas privadas podem ser rastreadas para que buscadores leiam o noindex; autenticação continua sendo a proteção de acesso.
- Membro, administração e autenticação recebem noindex/nofollow, também por cabeçalho HTTP. APIs e rotas de autenticação recebem o mesmo cabeçalho.
- Capas de mídia usam carregamento adiado e decodificação assíncrona; vídeos não iniciam reprodução nem carregamento completo automaticamente.
- A imagem social padrão tem 1200 × 630 pixels e identidade visual do DK.

## Depois da publicação

1. Confirmar que domínio e HTTPS apontam para esta versão. Validar redirecionamentos de HTTP e www para o domínio canônico no provedor de hospedagem.
2. Conferir `https://death-knights.com.br/robots.txt` e `/sitemap.xml`.
3. Verificar a propriedade no Google Search Console e enviar o sitemap. Essa etapa depende de acesso à conta e/ou DNS.
4. Inspecionar home, uma página de atividade e um artigo pelo Search Console; validar JSON-LD no Rich Results Test.
5. Medir Lighthouse/PageSpeed e Core Web Vitals na versão publicada, com conteúdo real. Não foi atribuída nota de desempenho sem medição.
6. Adicionar descrições úteis e legendas específicas às fotos novas. Regras de jogos em modais só entram no DOM ao abrir, portanto não devem ser tratadas como páginas de conteúdo indexável individuais. Caso a busca por cada modalidade seja prioritária, criar páginas públicas próprias com conteúdo editorial.

## Limites da verificação

A ferramenta de navegação não conseguiu acessar o domínio durante esta auditoria. Não foram verificadas posição no Google, dados de Search Console, redirecionamentos de hospedagem nem métricas reais de visitantes. Melhorias técnicas não garantem indexação ou posições.

Referências: [canonicals](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls), [sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap), [robots e noindex](https://developers.google.com/search/docs/crawling-indexing/robots/intro).
