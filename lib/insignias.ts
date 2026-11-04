import type { DkRank, DocumentTrack, GraduationLevel } from "@/lib/types";

const base = "/images/insignias";

export const rankIcons: Record<DkRank, string | null> = {
  recruta: null,
  soldado: `${base}/patentes/soldado.webp`,
  cabo: `${base}/patentes/cabo.webp`,
  terceiro_sargento: `${base}/patentes/terceiro-sargento.webp`,
  segundo_sargento: `${base}/patentes/segundo-sargento.webp`,
  primeiro_sargento: `${base}/patentes/primeiro-sargento.webp`,
  subtenente: `${base}/patentes/subtenente.webp`,
  tenente: `${base}/patentes/tenente.webp`,
  capitao: `${base}/patentes/capitao.webp`,
  major: `${base}/patentes/major.webp`,
  tenente_coronel: `${base}/patentes/tenente-coronel.webp`,
  coronel: `${base}/patentes/coronel.webp`,
  general_brigada: `${base}/patentes/general-brigada.webp`,
  general_divisao: `${base}/patentes/general-divisao.webp`,
  general_exercito: `${base}/patentes/general-exercito.webp`,
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

export function getGraduationTrack(order?: string | null): DocumentTrack | null {
  const value = normalize(order || "");
  const cavalry = /\b(cavalaria|cavaleir[oa]s?)\b/.test(value);
  const archery = /\b(arquearia|arqueir[oa]s?)\b/.test(value);
  if (cavalry === archery) return null;
  return cavalry ? "cavalaria" : "arquearia";
}

export function getGraduationIcon(level: GraduationLevel, track: DocumentTrack | null) {
  if (level === "sem_graduacao" || !track) return null;
  if (track === "arquearia") return `${base}/graduacoes/arquearia-bronze-nocked.webp`;
  return `${base}/graduacoes/${track}-${level}.webp`;
}

export const buildOptions = ["Arqueiro", "Dual (Espadas, Adagas)", "Escudeiro Tank ou Pontuador", "Lanceiro de Ofício"];

export function getBuildIcon(build?: string | null): string | null {
  const value = normalize(build || "");
  if (/\b(arqueir[oa]|arquearia|archer)\b/.test(value)) return `${base}/builds/arqueiro.webp`;
  if (/\b(dual|duais|dual wield)\b/.test(value)) return `${base}/builds/dual.webp`;
  if (/\b(escudeir[oa]|tank|tanque|pontuador)\b/.test(value)) return `${base}/builds/escudeiro.webp`;
  if (/\b(lanceir[oa]|lanca|lance)\b/.test(value)) return `${base}/builds/lanceiro.webp`;
  return null;
}
