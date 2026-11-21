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
    text: "O Swordplay é uma atividade esportiva e recreativa inspirada em combates históricos e fantásticos. Os participantes utilizam réplicas acolchoadas de equipamentos medievais desenvolvidas para a prática.",
  },
  {
    title: "O que é Boffering?",
    text: "Boffering é o uso de equipamentos macios e acolchoados em atividades simuladas. A proposta permite treinar movimentos, posicionamento e estratégia de maneira controlada.",
  },
];

const equipment = [
  { title: "Equipamentos de mão", text: "Equipamentos curtos, equipamentos longos e combinações de duas armas.", Icon: Sword },
  { title: "Defesa", text: "Escudos nórdicos, escudos torre, escudos broquel.", Icon: RoundShieldIcon },
  { title: "Longo alcance", text: "Lanças e arquearia adaptadas ao padrão da atividade.", Icon: SpearIcon },
];

const rules = [
  { title: "Equipamento", text: "Somente poderão ser utilizados equipamentos que estejam de acordo com os padrões de construção e segurança estabelecidos. Consulte a equipe de segurança para informações sobre equipamentos." },
  { title: "Conduta", text: "Todos os participantes devem seguir as orientações dos responsáveis e as regras apresentadas antes e durante cada atividade." },
  { title: "Respeito", text: "Todos devem ser tratados com respeito e igualdade, preservando sempre a segurança, o bem-estar e os limites de cada participante." },
];

export default function SwordplayPage() {
  return (
    <>
      <PageHero
        eyebrow="Atividades"
        title="Swordplay e Boffering"
        description="Combate esportivo com equipamentos acolchoados."
        variant="training"
      />
      <SubNav kind="activities" />

      <section className="section">
        <div className="container plate-grid plate-grid--2">
          {concepts.map(({ title, text }) => (
            <article className="plate plate--quiet concept reveal" key={title}>
              <h2>{title}</h2>
              <p className="dropcap">{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section section-band">
        <div className="container">
          <SectionHeading title="Equipamentos utilizados" />
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
          <SectionHeading title="Regras básicas" />
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
