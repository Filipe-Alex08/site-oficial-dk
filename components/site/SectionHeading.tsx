import type { ReactNode } from "react";

/** Título de seção: sobretítulo opcional, h2 e o divisor de lâmina. O texto de abertura entra como filho. */
export default function SectionHeading({
  title,
  eyebrow,
  id,
  className = "",
  children,
}: {
  title: string;
  eyebrow?: string;
  id?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header className={`section-head ${className}`.trim()}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 id={id}>{title}</h2>
      <span className="rule rule--start" aria-hidden="true" />
      {children}
    </header>
  );
}
