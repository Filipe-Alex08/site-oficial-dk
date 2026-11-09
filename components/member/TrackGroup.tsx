import type { ReactNode } from "react";

/**
 * Bloco de uma trilha (Cavalaria ou Arquearia) no perfil do membro. O nível
 * da graduação define a cor da faixa superior, como nos cards de Graduações.
 */
export default function TrackGroup({ title, icon, tier, children }: {
  title: string;
  icon?: ReactNode;
  tier?: "bronze" | "prata" | "ouro";
  children: ReactNode;
}) {
  return (
    <div className="track-group" role="group" aria-label={title} data-tier={tier}>
      <h3 className="track-group-title">{icon}{title}</h3>
      {children}
    </div>
  );
}
