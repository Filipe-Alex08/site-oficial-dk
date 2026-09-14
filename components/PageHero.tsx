import type { ReactNode } from "react";

export default function PageHero({
  eyebrow,
  title,
  description,
  variant = "default",
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  variant?: "default" | "training" | "events";
  children?: ReactNode;
}) {
  return (
    <section className={`page-hero page-hero--${variant}`}>
      <div className="container page-hero-inner">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="hero-description">{description}</p>
        {children && <div className="hero-actions">{children}</div>}
      </div>
    </section>
  );
}
