import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type Crumb = { label: string; href?: string };

/** Cabeçalho das páginas internas: caminho de volta + título + ação opcional. */
export default function AppPageHeader({
  title,
  crumbs = [],
  description,
  action,
}: {
  title: string;
  crumbs?: Crumb[];
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="page-header">
      <div className="container page-header-inner">
        <div>
          {crumbs.length > 0 && (
            <nav className="breadcrumb" aria-label="Você está em">
              {crumbs.map((crumb, index) => (
                <span key={`${crumb.label}-${index}`} className="breadcrumb-item">
                  {crumb.href ? <Link href={crumb.href}>{crumb.label}</Link> : crumb.label}
                  <ChevronRight size={14} aria-hidden="true" />
                </span>
              ))}
              <span aria-current="page">{title}</span>
            </nav>
          )}
          <h1>{title}</h1>
          {description && <p>{description}</p>}
        </div>
        {action && <div className="page-header-action">{action}</div>}
      </div>
    </header>
  );
}
