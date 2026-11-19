// Geometria do laurel do emblema de build. Arquivo puro (sem imports de runtime):
// o componente só desenha o que esta função calcula, e os testes conferem a conta.
//
// Sistema de coordenadas do SVG (y para baixo). Ângulos em graus, no sentido horário a
// partir do eixo +x: 90° é o ponto mais baixo do círculo, 180° o da esquerda, 270° o do topo.
// Calcula só o ramo ESQUERDO, que sobe do pé até quase o topo; o direito é o espelho.

export type WreathConfig = {
  /** Lado do quadrado do SVG (o círculo fica no centro). */
  size: number;
  /** Raio da haste, a linha que sustenta as folhas. */
  radius: number;
  /** Quantas posições de folha ao longo do ramo; cada uma tem uma folha fora e uma dentro. */
  steps: number;
  /** Ângulo da primeira posição de folha e da última. */
  startDeg: number;
  endDeg: number;
  /** A haste começa antes das folhas (passa do pé e cruza com a do outro lado). */
  stemStartDeg: number;
  leafLength: number;
  leafWidth: number;
  /** Quanto a folha se afasta da tangente da haste, para fora ou para dentro. */
  spreadDeg: number;
  /** Escala da última folha em relação à primeira (as do topo são menores). */
  taper: number;
};

export const defaultWreath: WreathConfig = {
  size: 400,
  radius: 150,
  steps: 11,
  startDeg: 104,
  endDeg: 256,
  stemStartDeg: 70,
  leafLength: 40,
  leafWidth: 12,
  spreadDeg: 36,
  taper: 0.7,
};

export type Leaf = {
  /** Base da folha, presa à haste. */
  x: number;
  y: number;
  /** Direção do eixo da folha, em graus. */
  angle: number;
  length: number;
  width: number;
  side: "out" | "in";
};

const rad = (deg: number) => (deg * Math.PI) / 180;

/** Folhas do ramo esquerdo, da base para o topo. */
export function wreathLeaves(config: WreathConfig = defaultWreath): Leaf[] {
  const { size, radius, steps, startDeg, endDeg, leafLength, leafWidth, spreadDeg, taper } = config;
  const center = size / 2;
  const leaves: Leaf[] = [];
  for (let index = 0; index < steps; index++) {
    const t = steps === 1 ? 0 : index / (steps - 1);
    const theta = startDeg + (endDeg - startDeg) * t;
    const scale = 1 - (1 - taper) * t;
    const x = center + radius * Math.cos(rad(theta));
    const y = center + radius * Math.sin(rad(theta));
    // Sentido em que a haste caminha (para o topo, no ramo esquerdo).
    const tangent = theta + 90;
    for (const side of ["out", "in"] as const) {
      leaves.push({
        x,
        y,
        angle: tangent + (side === "out" ? -spreadDeg : spreadDeg),
        length: leafLength * scale,
        width: leafWidth * scale,
        side,
      });
    }
  }
  return leaves;
}

/** Ponta da folha: onde o eixo termina. */
export function leafTip(leaf: Leaf) {
  return { x: leaf.x + leaf.length * Math.cos(rad(leaf.angle)), y: leaf.y + leaf.length * Math.sin(rad(leaf.angle)) };
}

/** Contorno de uma folha pontuda, desenhado com a base na origem e o eixo em +x. */
export function leafPath(length: number, width: number): string {
  const f = (value: number) => Math.round(value * 100) / 100;
  return `M0 0C${f(length * 0.25)} ${f(-width)} ${f(length * 0.72)} ${f(-width)} ${f(length)} 0C${f(length * 0.72)} ${f(width)} ${f(length * 0.25)} ${f(width)} 0 0Z`;
}

/** Haste do ramo esquerdo como um arco de círculo (comando A do SVG). */
export function wreathStemPath(config: WreathConfig = defaultWreath): string {
  const { size, radius, stemStartDeg, endDeg } = config;
  const center = size / 2;
  const point = (deg: number) => `${Math.round((center + radius * Math.cos(rad(deg))) * 100) / 100} ${Math.round((center + radius * Math.sin(rad(deg))) * 100) / 100}`;
  // Ângulo crescente é sentido horário no SVG (sweep-flag 1); passou de 180° pede o arco grande.
  return `M${point(stemStartDeg)}A${radius} ${radius} 0 ${endDeg - stemStartDeg > 180 ? 1 : 0} 1 ${point(endDeg)}`;
}
