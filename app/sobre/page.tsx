import { pageMetadata } from "@/lib/seo";
import { Compass, ShieldPlus } from "lucide-react";
import PageHero from "@/components/PageHero";
import SectionHeading from "@/components/site/SectionHeading";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { socialLinks } from "@/lib/content";

export const metadata = pageMetadata("Sobre o DK-BH e como participar", "Conheça a história do Death Knights em Belo Horizonte, onde treinamos e como começar no Swordplay. Iniciantes recebem orientação e equipamentos.", "/sobre");

const values = [
  { title: "O que a gente faz", text: "Treina técnica, joga, disputa torneios, viaja para encontros e, no meio disso tudo, faz amigos.", Icon: Compass },
  { title: "Seguro para começar", text: "Todo equipamento é acolchoado e avaliado. Quem chega aprende no próprio ritmo, com acompanhamento desde o primeiro dia.", Icon: ShieldPlus },
];

const steps = [
  "Entre no nosso grupo do WhatsApp para receber os avisos.",
  "Confirme presença no próximo treino.",
  "Venha pelo menos três vezes para sentir como é.",
  "Depois, converse com a recepção: dá para virar membro ou continuar vindo quando quiser.",
];

export default function AboutPage() {
  return (
    <>
      <PageHero eyebrow="Death Knights" title="Quem somos" />

      <section className="section">
        <div className="container about-intro">
          <SectionHeading title="O grupo">
            <p>O Death Knights é um grupo de Swordplay: combate com espadas, escudos, lanças e arco e flecha, misturando esporte, estratégia e um pé na fantasia medieval. Em BH, a gente se encontra aos domingos no Parque Ecológico da Pampulha.</p>
          </SectionHeading>
          <SectionHeading title="Nossa história">
            <p>O DK nasceu em 2020, a partir do antigo Graal-RJ, e foi crescendo com novas divisões e encontros em vários estados do Brasil.</p>
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
              <p>Não precisa de experiência nem de equipamento próprio: a gente empresta tudo.</p>
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
              <h3>Quem vai te receber</h3>
              <p>A equipe de recepção apresenta o grupo, ensina os golpes básicos e fica com você nos primeiros treinos.</p>
            </div>
            <a className="button button-primary" href={socialLinks.whatsapp} target="_blank" rel="noreferrer">
              <WhatsAppIcon size={18} /> Entrar no grupo do WhatsApp
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
