import { pageMetadata, jsonLd, siteUrl, siteDescription } from "@/lib/seo";
import Link from "next/link";
import { Suspense } from "react";
import {
  ArrowRight,
  CalendarDays,
  Camera,
  Flame,
  HeartHandshake,
  MapPinned,
  ShieldCheck,
  Swords,
  Tent,
  TrendingUp,
} from "lucide-react";
import CalendarSection from "@/components/CalendarSection";
import CalendarSkeleton from "@/components/CalendarSkeleton";
import { socialLinks } from "@/lib/content";

export const metadata = pageMetadata("Swordplay em Belo Horizonte | DK Death Knights", "Treine Swordplay e boffering com o DK em Belo Horizonte. Conheça os jogos, acompanhe o calendário e saiba como participar, mesmo sem experiência.", "/");

const portals = [
  { href: "/atividades/swordplay", className: "home-portal-activities", title: "Atividades", text: "Treinos, práticas e jogos para evoluir em equipe.", Icon: Swords },
  { href: "/midias", className: "home-portal-media", title: "Mídias", text: "Fotos, vídeos e publicações do DK.", Icon: Camera },
  { href: "/eventos", className: "home-portal-events", title: "Eventos", text: "Encontros, batalhas, eventos geek e aniversários.", Icon: Tent },
];

const virtues = [
  { title: "Comunidade", text: "acolhedora", Icon: HeartHandshake },
  { title: "Evolução", text: "constante", Icon: TrendingUp },
  { title: "Ambiente", text: "seguro", Icon: ShieldCheck },
  { title: "Tradição", text: "viva", Icon: Flame },
];

export default function HomePage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ "@context": "https://schema.org", "@graph": [
        { "@type": "SportsOrganization", "@id": `${siteUrl}/#organization`, name: "DK Death Knights", alternateName: "DK-BH", url: siteUrl, description: siteDescription, logo: `${siteUrl}/images/dk-emblem.webp`, sport: "Swordplay", areaServed: { "@type": "City", name: "Belo Horizonte" }, sameAs: [socialLinks.instagram, ...(socialLinks.youtube ? [socialLinks.youtube] : [])] },
        { "@type": "WebSite", "@id": `${siteUrl}/#website`, name: "DK Death Knights", url: siteUrl, inLanguage: "pt-BR", publisher: { "@id": `${siteUrl}/#organization` } },
      ] }) }} />
      <section className="home-hero">
        <div className="container home-hero-layout">
          <div className="home-hero-content">
            <p className="eyebrow">Death Knights · Belo Horizonte</p>
            <h1>
              Swordplay
              <span>com propósito</span>
            </h1>
            <p>Técnica, estratégia e comunidade em uma experiência esportiva e recreativa, em Belo Horizonte.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/sobre#como-participar">
                Como participar <ArrowRight size={18} />
              </Link>
              <Link className="button button-ghost" href="#calendario">
                <CalendarDays size={18} /> Ver calendário
              </Link>
            </div>
          </div>
        </div>
        <span className="battlement" aria-hidden="true" />
      </section>

      <section className="home-portals" aria-label="Áreas do site">
        <div className="container home-portal-grid numbered">
          {portals.map(({ href, className, title, text, Icon }) => (
            <Link key={href} className={`plate home-portal ${className}`} href={href}>
              <span className="plate-media portal-photo" aria-hidden="true" />
              <span className="numeral" aria-hidden="true" />
              <span className="home-portal-body">
                <span className="home-portal-heading">
                  <span className="glyph glyph--inline"><Icon /></span>
                  <h2>{title}</h2>
                </span>
                <p>{text}</p>
                <span className="home-portal-link">
                  Ver mais <ArrowRight size={16} />
                </span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="newcomer-strip">
        <div className="newcomer-photo" aria-hidden="true" />
        <div className="newcomer-content">
          <div className="newcomer-copy">
            <h2>Iniciantes são bem-vindos</h2>
            <span className="rule rule--start" aria-hidden="true" />
            <p>
              Não é preciso experiência. Nossa equipe acompanha seus primeiros passos e
              empresta os equipamentos para você participar com segurança.
            </p>
            <small>
              <MapPinned size={16} aria-hidden="true" /> Normalmente aos domingos • Parque Ecológico da Pampulha
            </small>
          </div>

          <ul className="newcomer-values">
            {virtues.map(({ title, text, Icon }) => (
              <li className="virtue reveal" key={title}>
                <span className="crest"><Icon aria-hidden="true" /></span>
                <span><strong>{title}</strong>{text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* O calendário consulta o banco e a sessão; o resto da home não espera por ele. */}
      <Suspense fallback={<CalendarSkeleton />}>
        <CalendarSection />
      </Suspense>
    </>
  );
}
