import { statSync } from "node:fs";
import { join } from "node:path";
import type { CSSProperties } from "react";
import { getBuildKey, type BuildKey } from "@/lib/insignias";
import { defaultWreath, leafPath, wreathLeaves, wreathStemPath } from "@/lib/wreath";

type EmblemKey = BuildKey | "padrao";

const leaves = wreathLeaves(defaultWreath);
const stem = wreathStemPath(defaultWreath);

/**
 * Arte pronta da build, gerada pelo usuário e convertida por `npm run prepare:emblems`
 * (forma branca sobre transparente). Devolve a URL com a data do arquivo, para o navegador
 * não guardar uma versão antiga depois que a imagem for trocada. Sem arquivo, null.
 */
function emblemImage(key: EmblemKey): string | null {
  try {
    const stat = statSync(join(process.cwd(), "public", "images", "builds", `${key}.webp`));
    return `/images/builds/${key}.webp?v=${Math.floor(stat.mtimeMs)}`;
  } catch {
    return null;
  }
}

/** Arma central provisória, em traço simples, para quando ainda não há a arte pronta. */
function Glyph({ build }: { build: EmblemKey }) {
  const sword = (rotation: number, scale = 1) => (
    <g transform={`rotate(${rotation} 200 200) translate(200 200) scale(${scale}) translate(-200 -200)`}>
      <path d="M200 74 L210 104 V244 H190 V104 Z" fill="currentColor" />
      <rect x="170" y="244" width="60" height="10" rx="3" fill="currentColor" />
      <rect x="195" y="254" width="10" height="42" rx="3" fill="currentColor" />
      <circle cx="200" cy="304" r="7" fill="currentColor" />
    </g>
  );
  return (
    <svg className="m-emblem-glyph" viewBox="0 0 400 400" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round">
      {build === "arqueiro" && <>
        <path d="M118 128 Q200 340 282 128" />
        <path d="M118 128 L282 128" strokeWidth="3" />
        <path d="M200 76 V322" />
        <path d="M200 76 L184 112 H216 Z" fill="currentColor" />
        <path d="M200 304 L180 330 M200 304 L220 330 M200 286 L180 312 M200 286 L220 312" />
      </>}
      {build === "dual" && <>{sword(-38)}{sword(38)}</>}
      {build === "escudeiro" && <>
        <path d="M200 88 H284 V188 C284 244 246 282 200 306 C154 282 116 244 116 188 V88 Z" />
        <circle cx="200" cy="182" r="26" />
        <path d="M200 96 V150 M200 214 V290" strokeWidth="5" />
      </>}
      {build === "lanceiro" && <>
        <path d="M200 134 V326" />
        <path d="M200 72 C226 102 226 128 200 142 C174 128 174 102 200 72 Z" fill="currentColor" />
        <path d="M204 156 L252 168 L204 184 Z" fill="currentColor" />
      </>}
      {build === "padrao" && sword(0, 1.08)}
    </svg>
  );
}

/**
 * Emblema da build principal do membro, usado no fundo do cartão de identidade.
 * Com a arte pronta (`public/images/builds/<build>.webp`), ela é usada como máscara e pintada
 * com a cor do tema, então segue a graduação (ou fica neutra no modo Padrão) só pelo CSS.
 * Sem a arte, desenha um laurel por código com uma arma provisória no centro.
 */
export default function BuildEmblem({ build }: { build?: string | null }) {
  const key: EmblemKey = getBuildKey(build) ?? "padrao";
  const image = emblemImage(key);
  if (image) {
    return <div className="m-emblem" data-build={key} data-art="image"><span className="m-emblem-art" style={{ "--art": `url("${image}")` } as CSSProperties} /></div>;
  }

  const branch = <>
    <path d={stem} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    {leaves.map((leaf, index) => (
      <path key={index} d={leafPath(leaf.length, leaf.width)} transform={`translate(${leaf.x.toFixed(2)} ${leaf.y.toFixed(2)}) rotate(${leaf.angle.toFixed(2)})`} fill="currentColor" />
    ))}
  </>;
  return (
    <div className="m-emblem" data-build={key} data-art="vector">
      <svg className="m-emblem-wreath" viewBox="0 0 400 400">
        <g>{branch}</g>
        <g transform="translate(400 0) scale(-1 1)">{branch}</g>
      </svg>
      <Glyph build={key} />
    </div>
  );
}
