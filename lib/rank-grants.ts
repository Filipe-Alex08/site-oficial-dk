import { isGeneralAssessmentRank } from "@/lib/assessments";
import type { DkRank } from "@/lib/types";

/**
 * As patentes de General abrem as avaliações (com gabarito) e os documentos mais
 * restritos: só o ADM Principal as concede. Manter a patente atual ou rebaixar
 * não é conceder. Vale no servidor e nas opções do painel.
 */
export function canGrantRank(principal: boolean, currentRank: DkRank, nextRank: DkRank) {
  return principal || nextRank === currentRank || !isGeneralAssessmentRank(nextRank);
}
