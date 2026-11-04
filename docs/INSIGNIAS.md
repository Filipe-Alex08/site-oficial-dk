# Ícones de patentes, graduações e builds

Os arquivos usados pelo site ficam em `public/images/insignias/`. A aplicação não depende da pasta de importação `assets_novos_delete-depois`.

O catálogo `lib/insignias.ts` relaciona as 14 patentes fornecidas aos arquivos originais, três graduações de cavalaria e as builds Arqueiro, Dual, Escudeiro e Lanceiro. Recruta usa um escudo neutro porque não foi fornecida insígnia específica. Nomes de builds fora do catálogo continuam aparecendo por extenso.

O perfil exibe as insígnias sob o nome. Os mesmos componentes são usados no menu da conta, na lista administrativa de membros, na presença em atividades, nos objetivos dos simulados e na página pública de graduações. A edição de perfil oferece sugestões das builds cadastradas, preservando valores livres.

A ordem identifica Cavalaria/Cavaleiro ou Arquearia/Arqueiro, incluindo plurais e formas femininas. Quando a ordem está ausente ou ambígua, a graduação usa uma medalha neutra em vez de atribuir uma ordem ao membro. A cor do tema continua seguindo a graduação aprovada, mesmo sem ordem.

## Medalhões de arquearia

Foi usado o Imagegen integrado para criar o medalhão de bronze, com o arquivo de cavalaria como referência. Prompt utilizado:

> Preserve the round segmented outer metal rim, narrow silver inner ring, white cracked stained-glass interior with heavy black outlines, flat hand-drawn heraldic style and subtle metal textures. Replace the central clenched armored fist with one clearly readable medieval recurve bow and a single nocked arrow, centered and filling the same area. No fist, no text, no letters, no extra decorations. Keep the entire circular medal visible, centered, tiny even outer margin, transparent outside the circular badge. The bow and outer rim must be copper bronze, distinctly reddish brown with copper orange highlights. All interior white regions remain opaque. Output one square isolated badge.

Após a revisão do usuário, as gerações independentes de prata e ouro foram descartadas. Os três níveis agora usam exatamente `graduacoes/arquearia-bronze.webp`, com filtros SVG calibrados pelas cores dos medalhões de cavalaria, definidos em `components/member/Insignia.tsx` e aplicados em `app/insignias.css`. O desenho original foi preservado em `graduacoes/arquearia-master.png`.
