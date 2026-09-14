import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Shield, Swords } from "lucide-react";
import CalendarSection from "@/components/CalendarSection";

export default function HomePage() {
  return (
    <>
      <section className="home-hero">
        <div className="hero-emblem" aria-hidden="true"><Swords /></div>
        <div className="container home-hero-content">
          <p className="eyebrow">Swordplay • Belo Horizonte</p>
          <h1>Cavaleiros da Morte</h1>
          <p>
            Batalhas, técnica e comunidade. Conheça o DK e descubra uma atividade
            que une esporte, estratégia e diversão.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/sobre">
              Conheça o DK <ArrowRight size={18} />
            </Link>
            <Link className="button button-ghost" href="/sobre#como-participar">
              Como participar
            </Link>
          </div>
        </div>
        <div className="hero-stats container">
          <div><Shield /><span><strong>Desde 2012</strong><small>História e comunidade</small></span></div>
          <div><CalendarDays /><span><strong>Aos domingos</strong><small>Atividades regulares</small></span></div>
          <div><MapPin /><span><strong>Belo Horizonte</strong><small>Parque Ecológico da Pampulha</small></span></div>
        </div>
      </section>

      <section className="section">
        <div className="container split-intro">
          <div>
            <p className="eyebrow">Bem-vindos ao DK</p>
            <h2>Um campo aberto para aprender, evoluir e fazer parte</h2>
          </div>
          <div>
            <p>
              O DK reúne pessoas interessadas em Swordplay, combates recreativos,
              trabalho em equipe e experiências inspiradas no universo medieval.
            </p>
            <Link className="text-link" href="/sobre">Conheça nossa história <ArrowRight size={16} /></Link>
          </div>
        </div>
      </section>

      <CalendarSection />
    </>
  );
}
