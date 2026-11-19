import { GraduationInsignia } from "@/components/member/Insignia";
import { graduationLabels } from "@/lib/member-access";
import type { NoteSeal as NoteSealData } from "@/lib/member-notes";

const trackNames = { cavalaria: "Cavalaria", arquearia: "Arquearia" } as const;

/**
 * Selo de uma anotação escrita por um comandante para alguém da mesma trilha.
 * A medalha leva o estandarte de comandante e a cor segue o nível do comandante
 * (bronze, prata ou ouro), a mesma dos blocos de trilha do perfil.
 */
export default function NoteSeal({ seal }: { seal: NoteSealData }) {
  const label = `Comandante de ${trackNames[seal.track]} · ${graduationLabels[seal.level]}`;
  return (
    <span className="m-memo-seal" data-tier={seal.level} title={`Selo do Comandante: ${label}`}>
      <span aria-hidden="true"><GraduationInsignia level={seal.level} track={seal.track} variant="icon" commander /></span>
      <span><small>Selo do Comandante</small>{trackNames[seal.track]} {graduationLabels[seal.level]}</span>
    </span>
  );
}
