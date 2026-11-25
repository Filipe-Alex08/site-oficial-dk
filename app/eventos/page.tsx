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
    text: "Para sair da rotina do domingo: desafios diferentes, dinâmicas novas, convidados ou uma programação temática.",
    Icon: Dumbbell,
  },
  {
    title: "Confraternizações",
    text: "Um respiro das batalhas para juntar a turma, fortalecer amizades e enturmar quem chegou agora.",
    Icon: PartyPopper,
  },
  {
    title: "Exames",
    text: "A hora de mostrar o quanto você evoluiu: conhecimento, habilidade e progresso dentro das graduações do DK.",
    Icon: GraduationCap,
  },
  {
    title: "Torneios",
    text: "Disputas entre a gente, em vários formatos, para colocar habilidade e estratégia à prova.",
    Icon: Trophy,
  },
  {
    title: "Atividades entre divisões",
    text: "O DK de várias regiões no mesmo lugar, treinando junto, trocando experiência e se conhecendo.",
    Icon: Network,
  },
];

const externalEvents = [
  {
    title: "Eventos estaduais",
    Icon: Map,
    text: "Encontros em Minas e em outros estados que juntam vários grupos de Swordplay no mesmo campo. Tem batalha grande, troca de experiência e muita amizade nova.",
    examples: ["Encontro Mineiro de Swordplay", "Encontro Carioca de Swordplay", "Encontro Paulista de Swordplay", "Encontro da Aliança da Estrada Real", "Guerra das Facções"],
  },
  {
    title: "Eventos regionais",
    Icon: Earth,
    text: "Os maiores. Gente de várias cidades, estados e regiões, batalhas intensas, estratégia em grupo e a chance de lutar ao lado (ou contra) jogadores de todo canto do país.",
    examples: ["Apocalipse", "Odisseia"],
  },
];

const hostedOptions: EventKind[] = [
  { title: "Stands e demonstrações", text: "Equipamentos à mostra, gente para explicar e o público experimentando.", Icon: Presentation },
  { title: "Eventos temáticos", text: "Atividades para encontros de RPG, fantasia, cultura medieval e geek.", Icon: Drama },
  { title: "Aniversários", text: "Brincadeiras montadas de acordo com a idade, o espaço e o número de convidados.", Icon: CakeSlice },
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
        description="Os encontros do grupo, as batalhas ao lado de outros grupos e o DK no seu evento."
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
              A gente leva stand, demonstração e oficina de Swordplay para eventos de RPG, geek, medievais e aniversários, tudo ajustado ao seu espaço e ao seu público.
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
              <p>Chama a gente no Instagram e conta o tipo de evento, a data e o local.</p>
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
