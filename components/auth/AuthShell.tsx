import Link from "next/link";
import type { ReactNode } from "react";

const authTabs = [
  { id: "login", label: "Entrar", href: "/area-do-membro/login" },
  { id: "cadastro", label: "Criar conta", href: "/area-do-membro/cadastro" },
] as const;

/** Moldura das telas de acesso: a foto de um lado e uma placa forjada com o formulário. */
export default function AuthShell({
  title,
  description,
  notice,
  wide = false,
  tabs,
  children,
}: {
  title: string;
  description?: string;
  notice?: string | null;
  wide?: boolean;
  tabs?: (typeof authTabs)[number]["id"];
  children: ReactNode;
}) {
  return (
    <section className={"auth-page" + (wide ? " auth-page-wide" : "")}>
      {/* Só a foto: a logo e o nome já estão no cabeçalho e no rodapé. */}
      <div className="auth-banner" aria-hidden="true">
        <span className="battlement" />
      </div>
      <div className="auth-stage">
        <div className="plate plate--feature auth-plate">
          {tabs && (
            <nav className="auth-tabs" aria-label="Acesso à área do membro">
              {authTabs.map((tab) => (
                <Link key={tab.id} href={tab.href} aria-current={tab.id === tabs ? "page" : undefined}>{tab.label}</Link>
              ))}
            </nav>
          )}
          {/* Com as abas, o nome da tela já está nelas: o título fica só para leitores de tela. */}
          <h1 className={tabs ? "sr-only" : undefined}>{title}</h1>
          {description && <p className="auth-description">{description}</p>}
          {notice && <p className="form-message error" role="alert">{notice}</p>}
          {children}
        </div>
      </div>
    </section>
  );
}
