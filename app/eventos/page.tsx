import { pageMetadata } from "@/lib/seo";
import {
  ArrowUpRight,
  CakeSlice,
  Drama,
  Dumbbell,
  Earth,
  GraduationCap,
  Map,
  Network,
  PartyPopper,
  Presentation,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/site/SectionHeading";
import SubNav from "@/components/site/SubNav";
import { socialLinks } from "@/lib/content";

type EventKind = { title: string; text: string; Icon: LucideIcon };

const internalEvents: EventKind[] = [
  {
    title: "Treinos especiais",
    text: "Atividades com propostas diferentes dos treinos regulares, podendo incluir desafios específicos, novas dinâmicas, convidados ou programações temáticas.",
    Icon: Dumbbell,
  },
  {
    title: "Confraternizações",
    text: "Momentos para reunir os membros fora do ritmo das batalhas, fortalecer amizades, integrar novos participantes e aproximar ainda mais a comunidade do DK.",
    Icon: PartyPopper,
  },
  {
    title: "Exames",
    text: "Avaliações voltadas ao desenvolvimento dos integrantes, considerando conhecimentos, habilidades e evolução dentro do sistema de graduações do DK.",
    Icon: GraduationCap,
  },
  {
    title: "Torneios",
    text: "Disputas internas organizadas em diferentes formatos, criadas para testar habilidades, estratégias e proporcionar novos desafios entre os participantes.",
    Icon: Trophy,
  },
  {
    title: "Atividades entre divisões",
    text: "Encontros que reúnem integrantes de diferentes regiões do DK, promovendo integração, troca de experiências e atividades em conjunto entre as divisões.",
    Icon: Network,
  },
];

const externalEvents = [
  {
    title: "Eventos estaduais",
    Icon: Map,
    text: "Grandes encontros realizados em Minas Gerais e em outros estados, reunindo diferentes grupos de Swordplay em um mesmo campo. São grandes batalhas, troca de experiências, novas amizades e muita integração.",
    examples: ["Encontro Mineiro de Swordplay", "Encontro Carioca de Swordplay", "Encontro Paulista de Swordplay", "Encontro da Aliança da Estrada Real", "Guerra das Facções"],
  },
  {
    title: "Eventos regionais",
    Icon: Earth,
    text: "Encontros ainda maiores, capazes de reunir grupos de várias cidades, estados e regiões. São eventos marcados por batalhas intensas, estratégias coletivas e pela oportunidade de lutar ao lado — ou contra — jogadores de diferentes partes do país.",
    examples: ["Apocalipse", "Odisseia"],
  },
];

const hostedOptions: EventKind[] = [
  { title: "Stands e demonstrações", text: "Exposição de equipamentos, orientação e experiências para o público.", Icon: Presentation },
  { title: "Eventos temáticos", text: "Atividades para encontros ligados a RPG, fantasia, cultura medieval e geek.", Icon: Drama },
  { title: "Aniversários", text: "Atividades recreativas preparadas conforme a faixa etária, o espaço e o número de participantes.", Icon: CakeSlice },
];

const anchors = [
  { id: "internos", label: "Eventos internos" },
  { id: "externos", label: "Eventos externos" },
  { id: "eventos-e-aniversarios", label: "Eventos e aniversários" },
];

export const metadata = pageMetadata("Eventos de Swordplay em Belo Horizonte", "Conheça os encontros do DK, eventos externos e experiências de Swordplay para eventos geek e aniversários em Belo Horizonte.", "/eventos");

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Death Knights"
        title="Eventos do DK"
        description="O que o grupo organiza, onde participamos e como levar o DK ao seu evento."
        variant="events"
      />
      <SubNav kind="anchors" label="Seções da página de eventos" items={anchors} />

      <section className="section event-section" id="internos">
        <div className="container">
          <SectionHeading eyebrow="Comunidade do DK" title="Eventos internos" />
          <div className="plate-grid numbered">
            {internalEvents.map(({ title, text, Icon }) => (
              <article className="plate reveal" key={title}>
                <span className="numeral" aria-hidden="true" />
                <span className="glyph"><Icon /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-band event-section" id="externos">
        <div className="container">
          <SectionHeading eyebrow="Integração entre grupos" title="Eventos externos" />
          <div className="plate-grid plate-grid--2">
            {externalEvents.map(({ title, text, Icon, examples }) => (
              <article className="plate plate--quiet reveal" key={title}>
                <span className="glyph"><Icon /></span>
                <h3>{title}</h3>
                <p>{text}</p>
                <div className="event-examples">
                  <strong>Exemplos</strong>
                  <ul className="pennants">
                    {examples.map((example) => <li className="pennant" key={example}>{example}</li>)}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section event-section" id="eventos-e-aniversarios">
        <div className="container event-article">
          <SectionHeading eyebrow="Leve o DK para o seu evento" title="Eventos geek e aniversários">
            <p className="lead">
              Levamos stands, demonstrações e oficinas de Swordplay para eventos de RPG, cultura geek, temática medieval e aniversários, adaptados ao espaço e ao público.
            </p>
          </SectionHeading>

          <div className="event-options">
            {hostedOptions.map(({ title, text, Icon }) => (
              <article className="plate plate--quiet reveal" key={title}>
                <span className="glyph"><Icon /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>

          <div className="plate plate--feature contact-banner reveal">
            <span className="glyph"><Sparkles /></span>
            <div>
              <h2>Quer levar o DK?</h2>
              <p>Chame no Instagram com o tipo de evento, data e local.</p>
            </div>
            <a className="button button-primary" href={socialLinks.instagram} target="_blank" rel="noreferrer">
              Falar pelo Instagram <ArrowUpRight size={18} />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
