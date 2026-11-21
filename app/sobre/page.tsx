import { pageMetadata } from "@/lib/seo";
import { Compass, ShieldPlus } from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/site/SectionHeading";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { socialLinks } from "@/lib/content";

export const metadata = pageMetadata("Sobre o DK-BH e como participar", "Conheça a história do Death Knights em Belo Horizonte, onde treinamos e como começar no Swordplay. Iniciantes recebem orientação e equipamentos.", "/sobre");

const values = [
  { title: "Proposta", text: "Promovemos desenvolvimento técnico, atividades recreativas, integração, trabalho em equipe e participação em eventos.", Icon: Compass },
  { title: "Segurança e acolhimento", text: "Os equipamentos são acolchoados e avaliados. Novos participantes recebem orientação e adaptação gradual às atividades.", Icon: ShieldPlus },
];

const steps = [
  "Entre no grupo de avisos e recepção.",
  "Confirme sua presença em uma atividade.",
  "Participe de pelo menos três treinos.",
  "Converse com a recepção sobre virar membro ou continuar esporadicamente.",
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="Death Knights" title="Sobre o DK-BH" />

      <section className="section">
        <div className="container about-intro">
          <SectionHeading title="O grupo">
            <p>O Death Knights é um grupo de Swordplay que reúne esporte, estratégia e combate medieval. As atividades regulares do DK em Belo Horizonte acontecem aos domingos, no Parque Ecológico da Pampulha.</p>
          </SectionHeading>
          <SectionHeading title="Nossa história">
            <p>Fundado em 2020, o DK nasceu a partir do antigo Graal-RJ e cresceu por meio de divisões e encontros em diferentes estados do Brasil.</p>
          </SectionHeading>
          {values.map(({ title, text, Icon }) => (
            <article className="plate plate--quiet reveal" key={title}>
              <span className="glyph"><Icon /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="como-participar">
        <div className="container">
          <div className="about-how">
            <SectionHeading eyebrow="Primeiros passos" title="Como participar">
              <p>Você não precisa de experiência nem de equipamento próprio: nós emprestamos tudo para você participar com segurança.</p>
            </SectionHeading>

            <ol className="step-path numbered">
              {steps.map((step) => (
                <li className="reveal" key={step}>
                  <span className="step-marker"><span className="numeral" aria-hidden="true" /></span>
                  <p>{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="plate plate--feature join-cta">
            <div>
              <h3>Equipe de recepção</h3>
              <p>A equipe de recepção apresenta o grupo, ensina as técnicas básicas e acompanha seus primeiros treinos. Você pode se tornar membro ou participar quando quiser.</p>
            </div>
            <a className="button button-primary" href={socialLinks.whatsapp} target="_blank" rel="noreferrer">
              <WhatsAppIcon size={18} /> Falar pelo WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
