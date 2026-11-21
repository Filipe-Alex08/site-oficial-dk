import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { activityNeighbours } from "@/lib/site-nav";

/** Fim de página de Atividades: segue para a anterior ou a próxima, na ordem do menu. */
export default function PageTrail({ href }: { href: string }) {
  const { prev, next } = activityNeighbours(href);
  if (!prev && !next) return null;
  return (
    <nav className="container page-trail" aria-label="Continuar em atividades">
      {prev && (
        <Link className="trail-link is-prev" href={prev.href} aria-label={`Anterior: ${prev.label}`}>
          <ArrowLeft aria-hidden="true" /> {prev.label}
        </Link>
      )}
      {next && (
        <Link className="trail-link is-next" href={next.href} aria-label={`Próxima: ${next.label}`}>
          {next.label} <ArrowRight aria-hidden="true" />
        </Link>
      )}
    </nav>
  );
}
