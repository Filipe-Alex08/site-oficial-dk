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
    text: "Você já passou da fase inicial e tem uma base sólida. Conhece as regras do grupo, como as graduações funcionam e os princípios básicos de combate. Tem noção de defesa, ataque, postura e movimentação e entende o equipamento que usa: para que serve, suas características e como manejar do jeito certo.",
  },
  {
    tone: "silver",
    level: "prata",
    title: "Prata",
    text: "O nível intermediário. Você controla bem o seu equipamento, usa com eficiência em diferentes situações e ajusta distância, movimentação e velocidade. Executa as técnicas com mais segurança e responde melhor ao que acontece no combate.",
  },
  {
    tone: "gold",
    level: "ouro",
    title: "Ouro",
    text: "O nível avançado, de experiência, técnica e jogo coletivo. Você luta em equipe, protege aliados, encara vários adversários e pensa a estratégia do grupo. E não é só habilidade: esperamos maturidade, responsabilidade e que você ajude outros integrantes do DK a evoluir.",
  },
] as const;

const tracks = [
  {
    title: "Cavalaria",
    emblem: "helm",
    text: "O combate corpo a corpo e o trabalho nas formações de campo.",
    specs: [
      ["Defensores e escudistas", "Escudos nórdicos, torre ou broquéis, junto com espada ou lança. O foco é postura, cobertura, proteger aliados e segurar a formação."],
      ["Lanceiros e armas de haste", "Usar o alcance, controlar a ponta e manter a distância. Ataques seguros e precisos, apoiando a linha de frente em sintonia com escudistas e outros lanceiros."],
      ["Especialistas em duas armas (Dual)", "Duas espadas ou adagas acolchoadas. Pede coordenação entre as mãos, alternância entre ataque e defesa, ritmo e mobilidade para pressionar sem perder o controle técnico."],
      ["Guerreiros e espada longa", "A espada longa alcança mais e costuma ser usada com as duas mãos. Trabalha defesas, transições eficientes, controle de distância e domínio do espaço ao redor."],
    ],
  },
  {
    title: "Arquearia",
    emblem: "bow",
    text: "Arco e flechas adaptados ao Swordplay, sempre dentro das regras de segurança.",
    specs: [
      ["Fundamentos", "Postura, encaixe da flecha, puxada, ancoragem, mira e soltura controlada. E, sempre, respeito à linha de disparo e cuidado com as flechas."],
      ["Evolução técnica", "Agrupar os disparos, ler o alvo e se adaptar a diferentes distâncias, posições e ângulos, com calma e controle."],
    ],
  },
] as const;

export default function GraduationPage() {
  return (
    <>
      <PageHero
        eyebrow="Atividades"
        title="Graduações"
        description="Bronze, Prata e Ouro: o caminho de quem treina com a gente."
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
            <p>Você evolui em cada trilha separadamente: dá para ser Prata na Cavalaria e Bronze na Arquearia.</p>
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
              <strong>O que cai no exame</strong>
              <p>Os requisitos de cada graduação ficam na área do membro.</p>
            </div>
            <Link className="button button-primary" href="/area-do-membro/login">Entrar na área do membro</Link>
          </div>
        </div>
      </section>
      <PageTrail href="/atividades/graduacoes" />
    </>
  );
}
