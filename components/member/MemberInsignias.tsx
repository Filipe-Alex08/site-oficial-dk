import { BuildInsignia, GraduationInsignias, RankInsignia } from "@/components/member/Insignia";
import { getBuildIcon, getBuildKey } from "@/lib/insignias";
import { rankLabels, rankShortLabels } from "@/lib/member-access";
import type { NoteCounterpart } from "@/lib/types";

/**
 * Patente (abreviada com `short`), graduações por trilha e builds, tudo numa linha: ícones com o
 * nome no título. Só builds reconhecidas têm ícone, e a secundária não repete a principal.
 */
export default function MemberInsignias({ member, short = false }: { member: NoteCounterpart; short?: boolean }) {
  const primary = getBuildIcon(member.primary_build) ? member.primary_build : null;
  const secondary = member.secondary_build && getBuildIcon(member.secondary_build) && getBuildKey(member.secondary_build) !== getBuildKey(member.primary_build) ? member.secondary_build : null;
  return (
    <span className="m-insignias">
      <span className="m-insignias-rank"><RankInsignia rank={member.rank} variant="icon" /><span>{short ? rankShortLabels[member.rank] : rankLabels[member.rank]}</span></span>
      <GraduationInsignias profile={member} variant="icon" />
      {primary && <BuildInsignia build={primary} variant="icon" />}
      {secondary && <BuildInsignia build={secondary} variant="icon" />}
    </span>
  );
}
