import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

/** Cartão centralizado das telas de login e cadastro. */
export default function AuthShell({
  title,
  description,
  notice,
  wide = false,
  children,
}: {
  title: string;
  description?: string;
  notice?: string | null;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="auth-page">
      <div className={"auth-card" + (wide ? " auth-card-wide" : "")}>
        <Link className="auth-brand" href="/" aria-label="Voltar ao site">
          <Image src="/images/dk-emblem.webp" alt="" width={56} height={56} />
        </Link>
        <h1>{title}</h1>
        {description && <p className="auth-description">{description}</p>}
        {notice && <p className="form-message error" role="alert">{notice}</p>}
        {children}
      </div>
    </section>
  );
}
