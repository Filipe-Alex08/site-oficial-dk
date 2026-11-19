import type { ReactNode } from "react";

/** Cartão padrão do painel: cabeçalho (título, descrição, ações), corpo e rodapé opcionais. */
export default function Panel({ title, description, actions, footer, children, flush = false, className = "", id }: {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  /** Sem padding no corpo: para tabelas e listas que vão de ponta a ponta. */
  flush?: boolean;
  className?: string;
  id?: string;
}) {
  return <section className={`admin-panel ${className}`.trim()} id={id}>
    {(title || actions) && <div className="admin-panel-head">
      <div>{title && <h3>{title}</h3>}{description && <p>{description}</p>}</div>
      {actions && <div className="admin-panel-actions">{actions}</div>}
    </div>}
    {children != null && <div className={flush ? "admin-panel-flush" : "admin-panel-body"}>{children}</div>}
    {footer && <div className="admin-panel-foot">{footer}</div>}
  </section>;
}
