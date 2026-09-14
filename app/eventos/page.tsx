import type { Metadata } from "next";
import {
  ArrowUpRight,
  Award,
  CakeSlice,
  Castle,
  Map,
  Network,
  PartyPopper,
  Presentation,
  Shield,
  Sparkles,
  Swords,
  Users,
} from "lucide-react";
import PageHero from "@/components/PageHero";
import { socialLinks } from "@/lib/content";

export const metadata: Metadata = {
  title: "Eventos",
  description:
    "Eventos internos, encontros externos e experiências do DK para eventos e aniversários.",
};

const internalEvents = [
  [
    "Treinos especiais",
    "Atividades com propostas diferentes dos treinos regulares, podendo incluir desafios específicos, novas dinâmicas, convidados ou programações temáticas.",
    Swords,
  ],
  [
    "Confraternizações",
    "Momentos para reunir os membros fora do ritmo das batalhas, fortalecer amizades, integrar novos participantes e aproximar ainda mais a comunidade do DK.",
    PartyPopper,
  ],
  [
    "Exames",
    "Avaliações voltadas ao desenvolvimento dos integrantes, considerando conhecimentos, habilidades e evolução dentro do sistema de graduações do DK.",
    Award,
  ],
  [
    "Torneios",
    "Disputas internas organizadas em diferentes formatos, criadas para testar habilidades, estratégias e proporcionar novos desafios entre os participantes.",
    Shield,
  ],
  [
    "Atividades entre divisões",
    "Encontros que reúnem integrantes de diferentes regiões do DK, promovendo integração, troca de experiências e atividades em conjunto entre as divisões.",
    Users,
  ],
] as const;

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Encontros e experiências"
        title="Eventos do DK"
        description="Conheça os eventos organizados pelo grupo, nossa participação em encontros de Swordplay e as experiências que levamos a eventos e aniversários."
        variant="events"
      >
        <nav
          className="page-anchor-nav"
          aria-label="Seções da página de eventos"
        >
          <a href="#internos">Eventos internos</a>
          <a href="#externos">Eventos externos</a>
          <a href="#eventos-e-aniversarios">Eventos e aniversários</a>
        </nav>
      </PageHero>

      <section className="section event-section" id="internos">
        <div className="container">
          <header className="section-heading">
            <div>
              <p className="eyebrow">Comunidade do DK</p>
              <h2>Eventos internos</h2>
            </div>
            <p>
              Atividades organizadas pelo DK para integrar, desenvolver e reunir
              seus membros.
            </p>
          </header>

          <div className="event-card-grid event-card-grid-internal">
            {internalEvents.map(([title, text, Icon]) => (
              <article className="card" key={title}>
                <span className="card-icon">
                  <Icon />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        className="section event-section event-section-alt"
        id="externos"
      >
        <div className="container">
          <header className="section-heading">
            <div>
              <p className="eyebrow">Integração entre grupos</p>
              <h2>Eventos externos</h2>
            </div>
            <p>
              O DK também participa de encontros organizados por outros grupos e
              comunidades.
            </p>
          </header>

          <div className="event-card-grid event-card-grid-external">
            <article className="card event-list-card">
              <span className="card-icon">
                <Map />
              </span>
              <h3>Eventos estaduais</h3>
              <p>
                Grandes encontros realizados em Minas Gerais e em outros
                estados, reunindo diferentes grupos de Swordplay em um mesmo
                campo. São grandes batalhas, troca de experiências, novas
                amizades e muita integração.
              </p>
              <div className="event-examples">
                <strong>Exemplos</strong>
                <ul>
                  <li>Encontro Mineiro de Swordplay</li>
                  <li>Encontro Carioca de Swordplay</li>
                  <li>Encontro Paulista de Swordplay</li>
                  <li>Encontro da Aliança da Estrada Real</li>
                  <li>Guerra das Facções</li>
                </ul>
              </div>
            </article>

            <article className="card event-list-card">
              <span className="card-icon">
                <Network />
              </span>
              <h3>Eventos regionais</h3>
              <p>
                Encontros ainda maiores, capazes de reunir grupos de várias
                cidades, estados e regiões. São eventos marcados por batalhas
                intensas, estratégias coletivas e pela oportunidade de lutar ao
                lado — ou contra — jogadores de diferentes partes do país.
              </p>
              <div className="event-examples">
                <strong>Exemplos</strong>
                <ul>
                  <li>Apocalipse</li>
                  <li>Odisseia</li>
                </ul>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section event-section" id="eventos-e-aniversarios">
        <div className="container event-article">
          <header className="section-heading">
            <div>
              <p className="eyebrow">Leve o DK para o seu evento</p>
              <h2>Eventos geek e aniversários</h2>
            </div>
            <p>
              Stands, apresentações e experiências adaptadas ao público, à
              proposta e ao espaço disponível.
            </p>
          </header>

          <div className="event-introduction">
            <p className="lead">
              O DK possui diferentes formatos de stands e atividades voltadas à
              divulgação e à prática do Swordplay.
            </p>
            <p>
              Nossa equipe pode levar uma ou mais experiências para eventos de
              cultura alternativa, RPG, temática medieval, cultura geek ou
              esportiva.
            </p>
            <p>
              As atividades podem ser adaptadas conforme o espaço, o público e a
              proposta do evento, incluindo apresentações, demonstrações,
              oficinas, duelos e experiências acompanhadas pela equipe do DK.
            </p>
          </div>

          <div className="event-options">
            <article>
              <Presentation />
              <h3>Stands e demonstrações</h3>
              <p>
                Exposição de equipamentos, orientação e experiências para o
                público.
              </p>
            </article>
            <article>
              <Castle />
              <h3>Eventos temáticos</h3>
              <p>
                Atividades para encontros ligados a RPG, fantasia, cultura
                medieval e geek.
              </p>
            </article>
            <article>
              <CakeSlice />
              <h3>Aniversários</h3>
              <p>
                Atividades recreativas preparadas conforme a faixa etária, o
                espaço e o número de participantes.
              </p>
            </article>
          </div>

          <div className="contact-banner">
            <Sparkles />
            <div>
              <h2>Quer levar o DK?</h2>
              <p>
                Informe pelo Instagram o tipo de evento, a data, o local e a
                atividade desejada.
              </p>
            </div>
            <a
              className="button button-primary"
              href={socialLinks.instagram}
              target="_blank"
              rel="noreferrer"
            >
              Falar pelo Instagram <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
