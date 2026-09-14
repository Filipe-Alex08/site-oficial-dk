import type { Metadata } from "next";
import { Award, BookOpenCheck, ShieldCheck } from "lucide-react";
import PageHero from "@/components/PageHero";

export const metadata: Metadata = { title: "Graduações" };

export default function GraduationPage() {
  return (
    <>
      <PageHero
        eyebrow="Atividades"
        title="Graduações"
        description="Um caminho de evolução que reconhece conhecimento, participação, desenvolvimento e responsabilidade dentro do DK."
        variant="training"
      />
      <section className="section">
        <div className="container">
          <div className="card-grid">
            <article className="card graduation bronze">
              <span className="card-icon">
                <Award />
              </span>
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
              <span className="card-icon">
                <ShieldCheck />
              </span>
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
              <span className="card-icon">
                <BookOpenCheck />
              </span>
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
          <div className="info-band">
            <strong>Informações internas</strong>
            <p>
              Os critérios completos de progressão, requisitos de exame,
              avaliações e registros individuais são de acesso restrito e ficam
              disponíveis apenas para membros autorizados do DK.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
