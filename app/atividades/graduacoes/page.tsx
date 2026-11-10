import { pageMetadata } from "@/lib/seo";
import { GraduationInsignia } from "@/components/member/Insignia";
import PageHero from "@/components/PageHero";
import styles from "./graduacoes.module.css";


export const metadata = pageMetadata("Graduações do DK: Bronze, Prata e Ouro", "Conheça as graduações Bronze, Prata e Ouro do DK e o caminho de evolução em Cavalaria e Arquearia, da iniciação ao domínio técnico.", "/atividades/graduacoes");

export default function GraduationPage() {
  return (
    <>
      <PageHero
        title="Graduações"
        description="O caminho de evolução dentro do DK: Bronze, Prata e Ouro."
        variant="training"
      />
      <section className="section">
        <div className="container">
          <section aria-labelledby="graduation-levels-title">
            <h2 id="graduation-levels-title" className={styles.visuallyHidden}>
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

            <div className="info-band">
              <strong>Recruta</strong>
              <p>
                Antes da graduação de Bronze, todo novo participante passa por uma
                fase inicial de aprendizado, na qual desenvolve as primeiras
                noções de segurança, movimentação, defesa, ataque e utilização dos
                equipamentos.
              </p>
            </div>
          </section>

          <section className={styles.tracksSection} aria-labelledby="graduation-tracks-title">
            <div className="section-heading">
              <h2 id="graduation-tracks-title">Cavalaria e Arquearia</h2>
              <p>
                As graduações de Bronze, Prata e Ouro acompanham o desenvolvimento
                do integrante em duas trilhas. Cada uma trabalha equipamentos,
                funções e habilidades próprias, sempre priorizando segurança,
                controle técnico e atuação coletiva.
              </p>
            </div>

            <div className={styles.trackGrid}>
              <article className="card">
                <div className="graduation-insignias">
                  <GraduationInsignia level="bronze" track="cavalaria" variant="badge" />
                  <GraduationInsignia level="prata" track="cavalaria" variant="badge" />
                  <GraduationInsignia level="ouro" track="cavalaria" variant="badge" />
                </div>
                <h3>Cavalaria</h3>
                <p>
                  No DK, a Cavalaria reúne as categorias de combate corpo a corpo.
                  O desenvolvimento parte do manejo seguro do equipamento e avança
                  para o domínio de distância, movimentação, leitura do adversário
                  e integração com as formações de campo.
                </p>
                <div className="detail-list">
                  <div className="detail-item">
                    <strong>Defensores e escudistas</strong>
                    <span>
                      Utilizam escudos nórdicos, escudos torre ou broquéis,
                      combinados com espada ou lança. A evolução começa pela
                      postura, cobertura e proteção pessoal, avançando para o
                      controle de espaços, a proteção de aliados e a sustentação
                      das formações.
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Lanceiros e armas de haste</strong>
                    <span>
                      Trabalham alcance, controle da ponta e manutenção da
                      distância. O desenvolvimento inclui ataques seguros e
                      precisos, apoio à linha de frente, leitura de oportunidades
                      e coordenação com escudeiros e outros lanceiros.
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Especialistas em duas armas (Dual)</strong>
                    <span>
                      Utilizam duas espadas ou adagas acolchoadas. A progressão
                      desenvolve coordenação entre as mãos, alternância entre
                      ataque e defesa, ritmo, mobilidade e capacidade de pressionar
                      o adversário sem perder o controle técnico.
                    </span>
                  </div>
                  <div className="detail-item">
                    <strong>Guerreiros e espada longa</strong>
                    <span>
                      Utilizam um equipamento de maior alcance, normalmente
                      controlado com as duas mãos. O aprendizado evolui do manejo
                      básico e das defesas para transições mais eficientes,
                      controle de distância, movimentação e domínio do espaço ao
                      redor.
                    </span>
                  </div>
                </div>
              </article>

              <article className="card">
                <div className="graduation-insignias">
                  <GraduationInsignia level="bronze" track="arquearia" variant="badge" />
                  <GraduationInsignia level="prata" track="arquearia" variant="badge" />
                  <GraduationInsignia level="ouro" track="arquearia" variant="badge" />
                </div>
                <h3>Arquearia</h3>
                <p>
                  A Arquearia desenvolve o uso do arco e das flechas adaptadas ao
                  Swordplay.
                </p>
                <p>
                  O primeiro estágio envolve conhecer o equipamento e utilizá-lo
                  corretamente, aprendendo sobre postura, encaixe da flecha,
                  puxada, ancoragem, mira e soltura controlada. Também é
                  necessário respeitar a linha de disparo e compreender os
                  cuidados de segurança relacionados ao uso das flechas.
                </p>
                <p>
                  Com o avanço técnico, o arqueiro trabalha agrupamento, leitura
                  do alvo e adaptação a diferentes distâncias, posições e
                  ângulos, mantendo calma e controle durante a execução.
                </p>
              </article>
            </div>
          </section>

          <div className="info-band">
            <strong>Critérios completos</strong>
            <p>Requisitos de exame e progressão são exclusivos para membros.</p>
          </div>
        </div>
      </section>
    </>
  );
}
