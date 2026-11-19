// Converte as artes de build (preto sobre branco, ou PNG transparente) em máscaras
// brancas sobre transparente para o fundo do cartão do membro.
//
//   node scripts/prepare-build-emblems.mjs [pastaDeOrigem] [pastaDeDestino]
//
// Padrão: art/builds -> public/images/builds. Ver art/builds/LEIA-ME.md.
import { existsSync, mkdirSync, readdirSync } from "node:fs";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const BUILD_KEYS = ["arqueiro", "dual", "escudeiro", "lanceiro", "padrao"];
const EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];
const SIZE = 1024;

/**
 * Imagem webp RGBA: cor branca, e o alfa vem da arte.
 * - Com transparência real: usa o alfa que já existe.
 * - Sem transparência (forma preta sobre fundo branco): alfa = 255 - luminância.
 */
async function toMask(file) {
  const source = sharp(file).rotate();
  const metadata = await source.metadata();
  // Um canal alfa 100% opaco (comum em PNG exportado) não é transparência: aí vale a luminância.
  const hasAlpha = Boolean(metadata.hasAlpha) && !(await sharp(file).stats()).isOpaque;
  const resized = (hasAlpha ? source : source.flatten({ background: "#fff" })).resize(SIZE, SIZE, { fit: "contain", background: hasAlpha ? { r: 0, g: 0, b: 0, alpha: 0 } : "#fff" });

  let alpha;
  if (hasAlpha) {
    alpha = await resized.clone().ensureAlpha().extractChannel("alpha").raw().toBuffer();
  } else {
    // O leve aumento de contraste limpa fundos "sujos" (cinza claro vira branco, cinza escuro vira preto).
    const gray = await resized.clone().greyscale().linear(1.25, -32).raw().toBuffer();
    alpha = Buffer.from(gray.map((value) => 255 - value));
  }

  const rgba = Buffer.alloc(SIZE * SIZE * 4, 255);
  for (let pixel = 0; pixel < SIZE * SIZE; pixel++) rgba[pixel * 4 + 3] = alpha[pixel];

  // Forma encostando na borda = quase sempre folhas do laurel cortadas pela célula da imagem.
  const EDGE = 8;
  let touching = 0;
  for (let i = 0; i < SIZE; i++) {
    for (let e = 0; e < EDGE; e++) {
      for (const [x, y] of [[e, i], [SIZE - 1 - e, i], [i, e], [i, SIZE - 1 - e]]) if (alpha[y * SIZE + x] > 128) touching++;
    }
  }
  return { image: sharp(rgba, { raw: { width: SIZE, height: SIZE, channels: 4 } }).webp({ quality: 90, alphaQuality: 100 }), cut: touching > 20 };
}

const [, , from = "art/builds", to = "public/images/builds"] = process.argv;
if (!existsSync(from)) {
  console.error(`Pasta de origem não existe: ${from}`);
  process.exit(1);
}
mkdirSync(to, { recursive: true });

const done = new Set();
for (const file of readdirSync(from).filter((name) => EXTENSIONS.includes(extname(name).toLowerCase()))) {
  const key = basename(file, extname(file)).toLowerCase();
  if (!BUILD_KEYS.includes(key)) { console.warn(`Ignorado (o nome não é uma build): ${file}`); continue; }
  if (done.has(key)) { console.warn(`Ignorado (já há outro arquivo para "${key}"): ${file}`); continue; }
  const { image, cut } = await toMask(join(from, file));
  await image.toFile(join(to, `${key}.webp`));
  done.add(key);
  console.log(`OK  ${file} -> ${join(to, `${key}.webp`)}`);
  if (cut) console.warn(`    ATENÇÃO: a arte de "${key}" encosta na borda da imagem; o laurel pode estar cortado. Gere de novo com margem branca.`);
}
const missing = BUILD_KEYS.filter((key) => !done.has(key));
if (missing.length) console.log(`Sem arte (usa o desenho provisório): ${missing.join(", ")}`);
if (!done.size) { console.error("Nenhuma imagem convertida."); process.exit(1); }
