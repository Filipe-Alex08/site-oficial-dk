import type { Metadata } from "next";
import Link from "next/link";
import { HeartHandshake, MapPin, ShieldCheck, Swords, Users } from "lucide-react";
import PageHero from "@/components/PageHero";
import { socialLinks } from "@/lib/content";

export const metadata: Metadata = { title: "Sobre o DK-BH" };

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Quem somos"
        title="Sobre o DK-BH"
        description="Conheça a história, a proposta e o caminho para participar dos Cavaleiros da Morte."
      />
      <section className="section">
        <div className="container">
          <div className="card-grid about-grid">
            <article className="card"><span className="card-icon"><Swords /></span><h3>O que é o DK-BH</h3><p>O Death Knights é um grupo de Swordplay que reúne esporte, estratégia, combate medieval.</p></article>
            <article className="card"><span className="card-icon"><Users /></span><h3>Nossa história</h3><p>Fundado em 2020, o DK nasceu a partir do antigo Graal-RJ e cresceu por meio de divisões e encontros em diferentes estados do Brasil.</p></article>
            <article className="card"><span className="card-icon"><MapPin /></span><h3>Onde treinamos</h3><p>As atividades regulares do DK em Belo Horizonte acontecem aos domingos, no Parque Ecológico da Pampulha.</p></article>
            <article className="card"><span className="card-icon"><HeartHandshake /></span><h3>Proposta</h3><p>Promovemos desenvolvimento técnico, atividades recreativas, integração, trabalho em equipe e participação em eventos.</p></article>
            <article className="card"><span className="card-icon"><ShieldCheck /></span><h3>Segurança e acolhimento</h3><p>Os equipamentos são acolchoados e avaliados. Novos participantes recebem orientação e adaptação gradual às atividades.</p></article>
          </div>

          <div className="join-panel" id="como-participar">
            <div>
              <p className="eyebrow">Primeiros passos</p>
              <h2>Como participar</h2>
              <p>
                Você não precisa ter experiência nem equipamento próprio para conhecer o grupo.
                <br />
                Iremos disponibilizar equipamentos para que você possa participar das atividades de forma segura e divertida.
                <br />
                Nossa equipe de recepção irá te orientar, instruir e passar as técnicas de combate, além de apresentar o grupo, para que você possa se sentir à vontade e aproveitar a experiência.
                <br />
                O grupo é aberto a novos participantes, que podem se integrar como membros ou participar de forma esporádica.
              </p>
              
            </div>
            <ol className="join-steps">
              <li><span>01</span><p>Entre no grupo de avisos e recepção.</p></li>
              <li><span>02</span><p>Confirme sua presença em uma atividade.</p></li>
              <li><span>03</span><p>Participe de pelo menos três treinos.</p></li>
              <li><span>04</span><p>Converse com a recepção sobre ingresso como membro ou participação esporádica.</p></li>
            </ol>
            <a className="button button-primary" href={socialLinks.whatsapp} target="_blank" rel="noreferrer">Falar com a equipe de recepção</a>
          </div>
        </div>
      </section>
    </>
  );
}
