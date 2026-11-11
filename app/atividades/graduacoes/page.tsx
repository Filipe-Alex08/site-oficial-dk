import { pageMetadata } from "@/lib/seo";
import { ShieldHalf, Target } from "lucide-react";
import { GraduationInsignia } from "@/components/member/Insignia";
import PageHero from "@/components/PageHero";


export const metadata = pageMetadata("Graduações do DK: Bronze, Prata e Ouro", "Conheça as graduações Bronze, Prata e Ouro do DK e o caminho de evolução em Cavalaria e Arquearia, da iniciação ao domínio técnico.", "/atividades/graduacoes");

export default function GraduationPage() {
  return (
    <>
      <PageHero
        title="Graduações"
        description="O caminho de evolução dentro do DK: Bronze, Prata e Ouro."
        variant="training"
      />
      <section className="section section-stacked" aria-labelledby="graduation-levels-title">
        <div className="container">
          <h2 id="graduation-levels-title" className="sr-only">
            Níveis de graduação
          </h2>
          <div className="card-grid">
            <article className="card graduation bronze">
              <div className="graduation-insignias"><GraduationInsignia level="bronze" track="cavalaria" variant="badge" /><GraduationInsignia level="bronze" track="arquearia" variant="badge" /></div>
              <h3>Bronze</h3>
              <p>
                Representa o integrante que já superou a fase inicial e adquiriu
                uma base sólida dentro do DK. Conhece as regras do grupo, a
                estrutura de graduação e os princípios básicos de combate.
                Possui noções de defesa, ataque, postura e movimentação, além de
                compreender o equipamento que utiliza, suas características,
                finalidade e forma correta de manejo.
              </p>
            </article>
            <article className="card graduation silver">
              <div className="graduation-insignias"><GraduationInsignia level="prata" track="cavalaria" variant="badge" /><GraduationInsignia level="prata" track="arquearia" variant="badge" /></div>
              <h3>Prata</h3>
              <p>
                Representa um nível intermediário de domínio técnico. O
                integrante já demonstra maior controle sobre seu equipamento,
                consegue utilizá-lo com eficiência em diferentes situações e
                apresenta boa adaptação de distância, movimentação e velocidade.
                Também possui maior segurança na execução das técnicas e
                capacidade de responder melhor às diferentes situações de
                combate.
              </p>
            </article>
            <article className="card graduation gold">
              <div className="graduation-insignias"><GraduationInsignia level="ouro" track="cavalaria" variant="badge" /><GraduationInsignia level="ouro" track="arquearia" variant="badge" /></div>
              <h3>Ouro</h3>
              <p>
                Representa um nível avançado de experiência, domínio técnico e
                atuação coletiva. O integrante demonstra capacidade de combater
                em equipe, proteger aliados, enfrentar múltiplos adversários e
                contribuir estrategicamente para o grupo. Além da habilidade em
                campo, espera-se maturidade, responsabilidade e participação no
                desenvolvimento de outros integrantes do DK.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section section-continued" aria-labelledby="graduation-tracks-title">
        <div className="container">
          <header className="section-heading">
            <h2 id="graduation-tracks-title">Cavalaria e Arquearia</h2>
            <p>
              Cada graduação é conquistada separadamente em duas trilhas, com
              equipamentos e funções próprios.
            </p>
          </header>

          <div className="track-list">
            <article className="card">
              <span className="card-icon">
                <ShieldHalf />
              </span>
              <h3>Cavalaria</h3>
              <p>
                Reúne as categorias de combate corpo a corpo e a atuação nas
                formações de campo.
              </p>
              <div className="detail-list">
                <div className="detail-item">
                  <strong>Defensores e escudistas</strong>
                  <span>
                    Escudos nórdicos, escudos torre ou broquéis, combinados com
                    espada ou lança. Foco em postura, cobertura, proteção de
                    aliados e sustentação das formações.
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Lanceiros e armas de haste</strong>
                  <span>
                    Alcance, controle da ponta e manutenção da distância.
                    Ataques seguros e precisos, apoio à linha de frente e
                    coordenação com escudistas e outros lanceiros.
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Especialistas em duas armas (Dual)</strong>
                  <span>
                    Duas espadas ou adagas acolchoadas. Coordenação entre as
                    mãos, alternância entre ataque e defesa, ritmo e mobilidade
                    para pressionar o adversário sem perder o controle técnico.
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Guerreiros e espada longa</strong>
                  <span>
                    Espada longa, de maior alcance e normalmente empunhada com as
                    duas mãos. Defesas, transições eficientes, controle de
                    distância e domínio do espaço ao redor.
                  </span>
                </div>
              </div>
            </article>

            <article className="card">
              <span className="card-icon">
                <Target />
              </span>
              <h3>Arquearia</h3>
              <p>
                Uso do arco e das flechas adaptadas ao Swordplay, sempre dentro
                das regras de segurança.
              </p>
              <div className="detail-list">
                <div className="detail-item">
                  <strong>Fundamentos</strong>
                  <span>
                    Postura, encaixe da flecha, puxada, ancoragem, mira e
                    soltura controlada, além do respeito à linha de disparo e
                    aos cuidados de segurança com as flechas.
                  </span>
                </div>
                <div className="detail-item">
                  <strong>Evolução técnica</strong>
                  <span>
                    Agrupamento, leitura do alvo e adaptação a diferentes
                    distâncias, posições e ângulos, mantendo calma e controle
                    durante a execução.
                  </span>
                </div>
              </div>
            </article>
          </div>

          <div className="info-band">
            <strong>Critérios completos</strong>
            <p>Requisitos de exame e progressão são exclusivos para membros.</p>
          </div>
        </div>
      </section>
    </>
  );
}
