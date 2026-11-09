import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Seção recolhível de uma trilha (Cavalaria ou Arquearia) no perfil do membro.
 * Usa <details>, então abre e fecha com teclado e funciona sem JavaScript.
 */
export default function TrackSection({ title, icon, hint, defaultOpen = false, children }: {
  title: string;
  icon?: ReactNode;
  /** Resumo visível com a seção fechada (ex.: a graduação atual). */
  hint?: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="track-section" open={defaultOpen}>
      <summary>
        <span className="track-section-title">{icon}{title}</span>
        {hint && <span className="track-section-hint">{hint}</span>}
        <ChevronDown className="track-section-chevron" size={18} aria-hidden="true" />
      </summary>
      <div className="track-section-body">{children}</div>
    </details>
  );
}
