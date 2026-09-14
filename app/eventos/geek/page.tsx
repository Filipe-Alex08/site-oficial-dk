import type { Metadata } from "next";
import { ArrowUpRight, CakeSlice, Castle, Presentation, Sparkles } from "lucide-react";
import PageHero from "@/components/PageHero";
import { socialLinks } from "@/lib/content";

export const metadata: Metadata = { title: "DK em Eventos Geek" };

export default function GeekEventsPage() {
  return (
    <>
      <PageHero eyebrow="Leve o DK para o seu evento" title="Swordplay para eventos e aniversários" description="Stands, apresentações e experiências adaptadas ao seu público e ao espaço disponível." />
      <section className="section">
        <div className="container event-article">
          <div className="prose">
            <p className="lead">O DK possui diferentes formatos de stands e atividades voltadas à divulgação e à prática do Swordplay.</p>
            <p>Nossa equipe pode levar uma ou mais experiências para eventos de cultura alternativa, RPG, temática medieval, cultura geek ou esportiva.</p>
            <p>As atividades podem ser adaptadas conforme o espaço, o público e a proposta do evento, incluindo apresentações, demonstrações, oficinas, duelos e experiências acompanhadas pela equipe do DK.</p>
          </div>
          <div className="event-options">
            <article><Presentation /><h3>Stands e demonstrações</h3><p>Exposição de equipamentos, orientação e experiências para o público.</p></article>
            <article><Castle /><h3>Eventos temáticos</h3><p>Atividades para encontros ligados a RPG, fantasia, cultura medieval e geek.</p></article>
            <article><CakeSlice /><h3>Aniversários</h3><p>Atividades recreativas preparadas conforme a faixa etária, o espaço e o número de participantes.</p></article>
          </div>
          <div className="contact-banner">
            <Sparkles />
            <div><h2>Quer levar o DK?</h2><p>Informe pelo Instagram o tipo de evento, data, local e atividade desejada.</p></div>
            <a className="button button-primary" href={socialLinks.instagram} target="_blank" rel="noreferrer">Falar pelo Instagram <ArrowUpRight size={18} /></a>
          </div>
        </div>
      </section>
    </>
  );
}
