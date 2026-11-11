import { pageMetadata, jsonLd, siteUrl, siteDescription } from "@/lib/seo";
import Link from "next/link";
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
import { socialLinks } from "@/lib/content";

// O calendário contém avisos urgentes e dados diferentes para visitantes e
// membros autenticados. A página precisa refletir cada alteração sem depender
// de uma nova compilação ou de uma versão estática em cache.
export const dynamic = "force-dynamic";

export const metadata = pageMetadata("Swordplay em Belo Horizonte | DK Death Knights", "Treine Swordplay e boffering com o DK em Belo Horizonte. Conheça os jogos, acompanhe o calendário e saiba como participar, mesmo sem experiência.", "/");

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
      </section>

      <section className="home-portals" aria-label="Áreas do site">
        <div className="container home-portal-grid">
          <Link
            className="home-portal home-portal-activities"
            href="/atividades/swordplay"
          >
            <div className="home-portal-heading">
              <span className="home-portal-icon">
                <Swords />
              </span>
              <h2>Atividades</h2>
            </div>
            <p>Treinos, práticas e jogos para evoluir em equipe.</p>
            <span className="home-portal-link">
              Ver mais <ArrowRight size={16} />
            </span>
          </Link>

          <Link className="home-portal home-portal-media" href="/midias">
            <div className="home-portal-heading">
              <span className="home-portal-icon">
                <Camera />
              </span>
              <h2>Mídias</h2>
            </div>
            <p>Fotos, vídeos e publicações do DK.</p>
            <span className="home-portal-link">
              Ver mais <ArrowRight size={16} />
            </span>
          </Link>

          <Link className="home-portal home-portal-events" href="/eventos">
            <div className="home-portal-heading">
              <span className="home-portal-icon">
                <Tent />
              </span>
              <h2>Eventos</h2>
            </div>
            <p>Encontros, batalhas, eventos geek e aniversários.</p>
            <span className="home-portal-link">
              Ver mais <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </section>

      <section className="newcomer-strip">
        <div className="newcomer-photo" aria-hidden="true" />
        <div className="newcomer-content">
          <div className="newcomer-copy">
            <h2>Iniciantes são bem-vindos</h2>
            <p>
              Não é preciso experiência. Nossa equipe acompanha seus primeiros passos e
              empresta os equipamentos para você participar com segurança.
            </p>
            <small>
              <MapPinned size={16} aria-hidden="true" /> Normalmente aos domingos • Parque Ecológico da Pampulha
            </small>
          </div>

          <div className="newcomer-values">
            <div><HeartHandshake /><span><strong>Comunidade</strong>acolhedora</span></div>
            <div><TrendingUp /><span><strong>Evolução</strong>constante</span></div>
            <div><ShieldCheck /><span><strong>Ambiente</strong>seguro</span></div>
            <div><Flame /><span><strong>Tradição</strong>viva</span></div>
          </div>
        </div>
      </section>

      <CalendarSection />
    </>
  );
}
