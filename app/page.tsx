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
  { href: "/atividades/swordplay", className: "home-portal-activities", title: "Atividades", text: "Treinos, duelos e jogos, do primeiro golpe à batalha campal.", Icon: Swords },
  { href: "/midias", className: "home-portal-media", title: "Mídias", text: "Fotos e vídeos dos nossos treinos e encontros.", Icon: Camera },
  { href: "/eventos", className: "home-portal-events", title: "Eventos", text: "Encontros com outros grupos, grandes batalhas e o DK no seu evento.", Icon: Tent },
];

const virtues = [
  { title: "Comunidade", text: "que acolhe", Icon: HeartHandshake },
  { title: "Evolução", text: "a cada treino", Icon: TrendingUp },
  { title: "Segurança", text: "em primeiro lugar", Icon: ShieldCheck },
  { title: "Tradição", text: "desde 2020", Icon: Flame },
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
            <h1>
              Swordplay
              <span>todo domingo</span>
            </h1>
            <p>Combates com espadas e flechas acolchoadas, muita estratégia e uma turma que recebe bem quem chega. Treinamos em Belo Horizonte e qualquer pessoa pode começar.</p>
            <div className="hero-actions">
              <Link className="button button-primary" href="/sobre#como-participar">
                Quero participar <ArrowRight size={18} />
              </Link>
              <Link className="button button-ghost" href="#calendario">
                <CalendarDays size={18} /> Ver agenda
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
                  Conhecer <ArrowRight size={16} />
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
            <h2>Nunca segurou uma espada? Sem problema.</h2>
            <span className="rule rule--start" aria-hidden="true" />
            <p>
              Ninguém aqui começou sabendo. A gente empresta todo o equipamento, ensina o
              básico e acompanha seus primeiros treinos até você se sentir em casa.
            </p>
            <small>
              <MapPinned size={16} aria-hidden="true" /> Quase todo domingo • Parque Ecológico da Pampulha
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
