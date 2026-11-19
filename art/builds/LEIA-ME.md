# Emblemas de build (fundo do cartão do membro)

Cada membro vê, no fundo do cartão de identidade, o emblema da **build principal** dele. A cor vem do tema
(cor da graduação, ou prata neutro na aparência "Padrão"), então a imagem precisa ser só a **forma**.

## O que gerar

Cinco imagens, uma por build, todas **quadradas (1:1), no mínimo 1024×1024**, **preto sobre branco puro**,
no mesmo estilo do emblema do clã (laurel em volta de uma arma, detalhes tribais em forma de asas).

| Arquivo | Elemento central |
|---|---|
| `arqueiro` | arco com uma flecha vertical atravessando (como o exemplo do clã) |
| `dual` | duas espadas curtas / adagas cruzadas |
| `escudeiro` | escudo heráldico com ressalto (umbo) central |
| `lanceiro` | lança vertical com ponta em forma de folha e flâmula |
| `padrao` | só a máscara oni com caveira, sem arma (aparece para quem não tem build, ou escreveu uma build diferente das quatro) |

### Prompt base

Troque `[ELEMENTO CENTRAL]` pela linha da tabela acima.

```
Symmetrical black stencil emblem on a pure white background, front view, square 1:1 composition.
A complete laurel wreath encircles the design. At the center: [ELEMENTO CENTRAL].
Curved tribal wing-like flourishes frame the central element, sharp and ornamental.
Solid black silhouette only: no gradients, no grey tones, no shading, no outlines in other colours,
no text, no letters, no border, no background texture. High contrast, clean vector-like edges,
centered with generous white margin. Style: heraldic tattoo / vector emblem.
```

Exemplos do `[ELEMENTO CENTRAL]`:

- arqueiro: `a longbow with a single vertical arrow passing through its center, arrowhead up, fletching down`
- dual: `two short swords crossed in an X, blades pointing up`
- escudeiro: `a heater shield with a round central boss`
- lanceiro: `a vertical spear with a leaf-shaped blade and a small pennant`
- padrao: `a fierce oni demon mask with a skull, no weapon`

Prefira **uma imagem por vez**: numa folha com vários emblemas as juntas costumam sair ruins. O laurel
inteiro precisa ter margem branca de todos os lados. O `npm run prepare:emblems` avisa quando a arte
encosta na borda da imagem.

Dicas: se a ferramenta devolver tons de cinza ou um fundo levemente sujo, peça de novo ou aumente o contraste
antes de salvar. Quanto mais limpo o preto e o branco, melhor a forma fica no fundo do cartão.
Mantenha os cinco no mesmo traço e na mesma espessura, para parecerem uma família.

## Como encaixar

1. Salve os arquivos aqui, com estes nomes exatos: `art/builds/arqueiro.png`, `dual.png`, `escudeiro.png`,
   `lanceiro.png`, `padrao.png` (também aceita `.jpg` e `.webp`).
2. Rode `npm run prepare:emblems`. O script transforma o preto em forma e o branco em transparência
   e grava `public/images/builds/<build>.webp` (1024 px).
3. Pronto: não precisa mexer em código. Na próxima carga do `/membro` a imagem já substitui o desenho
   provisório. Quem falta continua com o provisório.

Para trocar uma imagem, substitua o arquivo em `art/builds/` e rode o comando de novo.
Os originais ficam em `art/builds/`; o que o site serve fica em `public/images/builds/`.
