import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Camera,
  Castle,
  Instagram,
  MessageCircle,
  ShieldCheck,
  Swords,
  Users,
  Youtube,
} from "lucide-react";
import CalendarSection from "@/components/CalendarSection";
import { socialLinks } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="container home-hero-layout">
          <div className="home-hero-content">
            <p className="eyebrow">Mais do que um esporte. Uma jornada.</p>
            <h1>
              Swordplay
              <span>com propósito</span>
            </h1>
            <p>
              Bem-vindo ao DK — Death Knights Swordplay. Aqui, técnica,
              estratégia e comunidade se encontram em uma experiência esportiva
              e recreativa.
            </p>
            <div className="hero-actions">
              <Link
                className="button button-primary"
                href="/sobre#como-participar"
              >
                Saiba como participar <ArrowRight size={18} />
              </Link>
            </div>
          </div>

          <aside className="hero-manifesto" aria-label="Valores do DK">
            <p>Pessoas reais</p>
            <p>Combate recreativo</p>
            <p>Amizades duradouras</p>
          </aside>
        </div>

        <div className="container hero-signature">
          <span>Disciplina hoje</span>
          <span>Guerreiros melhores amanhã</span>
        </div>
      </section>

      <section className="home-portals" aria-label="Principais áreas do site">
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
            <p>
              Treinos, práticas e jogos para desenvolver técnica, estratégia e
              espírito de equipe.
            </p>
            <span className="home-portal-link">
              Saiba mais <ArrowRight size={16} />
            </span>
          </Link>

          <Link className="home-portal home-portal-media" href="/midias">
            <div className="home-portal-heading">
              <span className="home-portal-icon">
                <Camera />
              </span>
              <h2>Mídias</h2>
            </div>
            <p>
              Fotos, vídeos e publicações que registram a jornada do DK dentro e
              fora dos treinos.
            </p>
            <span className="home-portal-link">
              Saiba mais <ArrowRight size={16} />
            </span>
          </Link>

          <Link className="home-portal home-portal-events" href="/eventos">
            <div className="home-portal-heading">
              <span className="home-portal-icon">
                <CalendarDays />
              </span>
              <h2>Eventos</h2>
            </div>
            <p>
              Encontros internos, grandes batalhas, eventos geek e experiências
              para aniversários.
            </p>
            <span className="home-portal-link">
              Saiba mais <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </section>

      <section className="newcomer-strip">
        <div className="newcomer-photo" aria-hidden="true" />
        <div className="newcomer-content">
          <div className="newcomer-copy">
            <p className="eyebrow">Para todos os níveis</p>
            <h2>Iniciantes também são bem-vindos</h2>
            <p>
              Não é preciso ter experiência prévia. Nossa equipe acompanha os
              primeiros passos e disponibiliza equipamentos para uma
              participação segura e divertida.
            </p>
            <small>
              Atividades normalmente aos domingos • Parque Ecológico da Pampulha
            </small>
          </div>

          <div className="newcomer-values" aria-label="Diferenciais do DK">
            <div>
              <Users />
              <span>
                Comunidade<strong>acolhedora</strong>
              </span>
            </div>
            <div>
              <BarChart3 />
              <span>
                Evolução<strong>constante</strong>
              </span>
            </div>
            <div>
              <ShieldCheck />
              <span>
                Ambiente<strong>seguro</strong>
              </span>
            </div>
            <div>
              <Castle />
              <span>
                Tradição<strong>viva</strong>
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="home-edition-bar">
        <div className="container home-edition-inner">
          <p className="home-edition-brand">DK — Death Knights Swordplay</p>
          <p className="home-edition-message">
            Pessoas reais. Combates recreativos. Amizades duradouras.
          </p>
          <div className="home-edition-social" aria-label="Redes sociais do DK">
            <a
              href={socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram do DK"
            >
              <Instagram />
            </a>
            <a
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noreferrer"
              aria-label="WhatsApp do DK"
            >
              <MessageCircle />
            </a>
            {socialLinks.youtube ? (
              <a
                href={socialLinks.youtube}
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube do DK"
              >
                <Youtube />
              </a>
            ) : null}
            <span>Mais que espadas. Pessoas.</span>
          </div>
        </div>
      </div>

      <CalendarSection />
    </>
  );
}
