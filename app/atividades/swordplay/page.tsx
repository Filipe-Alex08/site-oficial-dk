import { pageMetadata } from "@/lib/seo";
import { Sword } from "lucide-react";
import PageHero from "@/components/PageHero";
import { RoundShieldIcon, SpearIcon } from "@/components/site/icons";
import PageTrail from "@/components/site/PageTrail";
import SectionHeading from "@/components/site/SectionHeading";
import SubNav from "@/components/site/SubNav";

export const metadata = pageMetadata("Swordplay e Boffering em Belo Horizonte", "Entenda o Swordplay e o boffering: equipamentos acolchoados, regras de segurança e combate esportivo medieval com o DK em Belo Horizonte.", "/atividades/swordplay");

const concepts = [
  {
    title: "O que é Swordplay?",
    text: "Pense numa batalha medieval, ou de fantasia, que você pode viver de verdade, com espadas, escudos e lanças feitos para o esporte. Isso é Swordplay: um combate em que valem técnica, leitura do adversário e trabalho em equipe.",
  },
  {
    title: "O que é Boffering?",
    text: "É o nome desse estilo de equipamento: armas macias e acolchoadas que permitem acertar o adversário com segurança. Com elas dá para treinar movimento, posição e estratégia de verdade.",
  },
];

const equipment = [
  { title: "Armas de mão", text: "Espadas curtas, espadas longas ou uma em cada mão.", Icon: Sword },
  { title: "Defesa", text: "Escudos nórdicos, escudos torre e broquéis.", Icon: RoundShieldIcon },
  { title: "Longo alcance", text: "Lanças e arcos com flechas adaptadas para o jogo.", Icon: SpearIcon },
];

const rules = [
  { title: "Equipamento", text: "Só entra em campo equipamento aprovado pelos nossos padrões de construção e segurança. Na dúvida, fale com a equipe de segurança." },
  { title: "Conduta", text: "Siga as orientações de quem está conduzindo a atividade e as regras combinadas antes e durante cada jogo." },
  { title: "Respeito", text: "Todo mundo é tratado com respeito e igualdade. Cuidar da segurança, do bem-estar e dos limites de quem luta com você faz parte do jogo." },
];

export default function SwordplayPage() {
  return (
    <>
      <PageHero
        eyebrow="Atividades"
        title="Swordplay e Boffering"
        description="Combate de verdade, com segurança e muita estratégia."
        variant="training"
      />
      <SubNav kind="activities" />

      <section className="section">
        <div className="container plate-grid plate-grid--2">
          {concepts.map(({ title, text }) => (
            <article className="plate plate--quiet concept reveal" key={title}>
              <h2>{title}</h2>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-band">
        <div className="container">
          <SectionHeading title="O que você vai empunhar" />
          <div className="plate-grid">
            {equipment.map(({ title, text, Icon }) => (
              <article className="plate reveal" key={title}>
                <span className="glyph"><Icon /></span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <SectionHeading title="O que vale sempre" />
          <ol className="conduct numbered">
            {rules.map(({ title, text }) => (
              <li className="reveal" key={title}>
                <span className="numeral" aria-hidden="true" />
                <div>
                  <strong>{title}</strong>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
      <PageTrail href="/atividades/swordplay" />
    </>
  );
}
