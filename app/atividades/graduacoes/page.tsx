import Link from "next/link";
import { Lock } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { GraduationInsignia } from "@/components/member/Insignia";
import PageHero from "@/components/PageHero";
import PageTrail from "@/components/site/PageTrail";
import SectionHeading from "@/components/site/SectionHeading";
import SubNav from "@/components/site/SubNav";

export const metadata = pageMetadata("Graduações do DK: Bronze, Prata e Ouro", "Conheça as graduações Bronze, Prata e Ouro do DK e o caminho de evolução em Cavalaria e Arquearia, da iniciação ao domínio técnico.", "/atividades/graduacoes");

const tiers = [
  {
    tone: "bronze",
    level: "bronze",
    title: "Bronze",
    text: "Representa o integrante que já superou a fase inicial e adquiriu uma base sólida dentro do DK. Conhece as regras do grupo, a estrutura de graduação e os princípios básicos de combate. Possui noções de defesa, ataque, postura e movimentação, além de compreender o equipamento que utiliza, suas características, finalidade e forma correta de manejo.",
  },
  {
    tone: "silver",
    level: "prata",
    title: "Prata",
    text: "Representa um nível intermediário de domínio técnico. O integrante já demonstra maior controle sobre seu equipamento, consegue utilizá-lo com eficiência em diferentes situações e apresenta boa adaptação de distância, movimentação e velocidade. Também possui maior segurança na execução das técnicas e capacidade de responder melhor às diferentes situações de combate.",
  },
  {
    tone: "gold",
    level: "ouro",
    title: "Ouro",
    text: "Representa um nível avançado de experiência, domínio técnico e atuação coletiva. O integrante demonstra capacidade de combater em equipe, proteger aliados, enfrentar múltiplos adversários e contribuir estrategicamente para o grupo. Além da habilidade em campo, espera-se maturidade, responsabilidade e participação no desenvolvimento de outros integrantes do DK.",
  },
] as const;

const tracks = [
  {
    title: "Cavalaria",
    emblem: "helm",
    text: "Reúne as categorias de combate corpo a corpo e a atuação nas formações de campo.",
    specs: [
      ["Defensores e escudistas", "Escudos nórdicos, escudos torre ou broquéis, combinados com espada ou lança. Foco em postura, cobertura, proteção de aliados e sustentação das formações."],
      ["Lanceiros e armas de haste", "Alcance, controle da ponta e manutenção da distância. Ataques seguros e precisos, apoio à linha de frente e coordenação com escudistas e outros lanceiros."],
      ["Especialistas em duas armas (Dual)", "Duas espadas ou adagas acolchoadas. Coordenação entre as mãos, alternância entre ataque e defesa, ritmo e mobilidade para pressionar o adversário sem perder o controle técnico."],
      ["Guerreiros e espada longa", "Espada longa, de maior alcance e normalmente empunhada com as duas mãos. Defesas, transições eficientes, controle de distância e domínio do espaço ao redor."],
    ],
  },
  {
    title: "Arquearia",
    emblem: "bow",
    text: "Uso do arco e das flechas adaptadas ao Swordplay, sempre dentro das regras de segurança.",
    specs: [
      ["Fundamentos", "Postura, encaixe da flecha, puxada, ancoragem, mira e soltura controlada, além do respeito à linha de disparo e aos cuidados de segurança com as flechas."],
      ["Evolução técnica", "Agrupamento, leitura do alvo e adaptação a diferentes distâncias, posições e ângulos, mantendo calma e controle durante a execução."],
    ],
  },
] as const;

export default function GraduationPage() {
  return (
    <>
      <PageHero
        eyebrow="Atividades"
        title="Graduações"
        description="O caminho de evolução dentro do DK: Bronze, Prata e Ouro."
        variant="training"
      />
      <SubNav kind="activities" />

      <section className="section section-stacked" aria-labelledby="graduation-levels-title">
        <div className="container">
          <h2 id="graduation-levels-title" className="sr-only">
            Níveis de graduação
          </h2>
          <div className="tier-path numbered">
            {tiers.map(({ tone }) => (
              <span className={`tier-node ${tone}`} key={tone} aria-hidden="true"><span className="numeral" /></span>
            ))}
            {tiers.map(({ tone, level, title, text }) => (
              <article className={`plate plate--tier ${tone} reveal`} key={tone}>
                <div className="graduation-insignias">
                  <GraduationInsignia level={level} track="cavalaria" variant="badge" />
                  <GraduationInsignia level={level} track="arquearia" variant="badge" />
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-continued" aria-labelledby="graduation-tracks-title">
        <div className="container">
          <SectionHeading id="graduation-tracks-title" title="Cavalaria e Arquearia">
            <p>Cada graduação é conquistada separadamente em duas trilhas, com equipamentos e funções próprios.</p>
          </SectionHeading>

          <div className="plate-grid plate-grid--2">
            {tracks.map(({ title, text, emblem, specs }) => (
              <article className="plate plate--quiet reveal" key={title}>
                <span className="glyph glyph--emblem" aria-hidden="true"><span className={`emblem emblem--${emblem}`} /></span>
                <h3>{title}</h3>
                <p>{text}</p>
                <dl className="spec-list">
                  {specs.map(([term, description]) => (
                    <div key={term}>
                      <dt>{term}</dt>
                      <dd>{description}</dd>
                    </div>
                  ))}
                </dl>
              </article>
            ))}
          </div>

          <div className="plate plate--feature locked reveal">
            <span className="glyph"><Lock /></span>
            <div>
              <strong>Critérios completos</strong>
              <p>Requisitos de exame e progressão são exclusivos para membros.</p>
            </div>
            <Link className="button button-primary" href="/area-do-membro/login">Área do membro</Link>
          </div>
        </div>
      </section>
      <PageTrail href="/atividades/graduacoes" />
    </>
  );
}
