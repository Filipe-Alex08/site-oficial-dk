import Link from "next/link";
import PageHero from "@/components/PageHero";
import { pageMetadata } from "@/lib/seo";
import { socialLinks } from "@/lib/content";

export const metadata = pageMetadata(
  "Termos de Serviço",
  "Regras de uso do site do DK Death Knights e da área do membro.",
  "/termos",
);

export default function TermsPage() {
  return (
    <>
      <PageHero title="Termos de Serviço" description="Última atualização: 18 de novembro de 2026." />
      <section className="section">
        <div className="container">
          <div className="prose">
            <h2>Aceitação</h2>
            <p>
              Ao acessar o site do <strong>DK — Death Knights</strong> ou criar uma conta, você concorda com estes termos e com a nossa <Link href="/privacidade">Política de Privacidade</Link>. Se não concordar, não use a área do membro. As páginas públicas continuam livres para consulta.
            </p>

            <h2>O que é o site</h2>
            <p>
              O site apresenta o grupo, as atividades de Swordplay em Belo Horizonte, eventos e mídias, e oferece uma área restrita aos membros, com agenda de presenças, documentos, graduações e simulados. O site não substitui a convivência e as orientações dadas presencialmente nos treinos.
            </p>

            <h2>Conta de membro</h2>
            <ul>
              <li>O cadastro depende de convite e de aprovação da equipe. Podemos recusar ou revogar um acesso quando houver motivo razoável.</li>
              <li>Informe dados verdadeiros e mantenha-os atualizados.</li>
              <li>Você é responsável por guardar a sua senha e por tudo o que for feito com a sua conta. Avise a equipe se suspeitar de uso indevido.</li>
              <li>Não compartilhe a sua conta nem tente acessar a conta de outra pessoa.</li>
            </ul>

            <h2>Conduta</h2>
            <p>Pedimos que o espaço digital siga os mesmos valores do grupo: humildade, honra e respeito. Não é permitido:</p>
            <ul>
              <li>Ofender, assediar, discriminar ou expor outras pessoas;</li>
              <li>Tentar burlar a segurança, acessar áreas sem permissão ou sobrecarregar o site;</li>
              <li>Coletar dados de outros membros em massa ou divulgar conteúdo restrito (como documentos internos) fora do grupo;</li>
              <li>Usar o site para fins ilegais ou para enviar spam.</li>
            </ul>
            <p>
              Quem descumprir estas regras pode ter a conta suspensa ou encerrada, sem prejuízo de outras medidas previstas nas regras do grupo.
            </p>

            <h2>Atividades presenciais</h2>
            <p>
              Confirmar presença pelo site não dispensa o cumprimento das regras de segurança e das orientações da equipe durante os treinos e eventos. Os equipamentos do grupo são acolchoados, mas o Swordplay é uma atividade física com contato: participe de acordo com as suas condições de saúde e siga sempre as instruções dos responsáveis.
            </p>

            <h2>Conteúdo e propriedade intelectual</h2>
            <p>
              O nome, o brasão, os textos, as imagens e o código do site pertencem ao DK ou aos respectivos autores, e não podem ser copiados ou usados comercialmente sem autorização. Ao enviar conteúdo (como a foto de perfil), você declara ter direito de usá-lo e nos autoriza a exibi-lo no site conforme a finalidade em que foi enviado.
            </p>
            <p>
              As marcas de terceiros citadas, como Instagram, WhatsApp e Google, pertencem aos seus donos e são mencionadas apenas para identificação.
            </p>

            <h2>Disponibilidade e responsabilidade</h2>
            <p>
              O site é mantido de forma voluntária e oferecido como está. Podemos alterá-lo, suspendê-lo ou tirá-lo do ar para manutenção ou por motivo de segurança, sem garantia de disponibilidade contínua. Na extensão permitida em lei, o grupo não responde por indisponibilidades, por perdas decorrentes de uso indevido da conta pelo próprio usuário nem por conteúdo de sites de terceiros para os quais o site aponte.
            </p>

            <h2>Encerramento da conta</h2>
            <p>
              Você pode pedir a exclusão da sua conta a qualquer momento pelos canais abaixo. O tratamento dos seus dados segue a <Link href="/privacidade">Política de Privacidade</Link>.
            </p>

            <h2>Mudanças nos termos</h2>
            <p>
              Podemos atualizar estes termos. A data no topo indica a última revisão, e o uso continuado do site depois da mudança significa que você a aceita. Mudanças relevantes serão avisadas na área do membro ou nos canais do grupo.
            </p>

            <h2>Lei aplicável e contato</h2>
            <p>
              Estes termos seguem as leis do Brasil. Dúvidas ou pedidos podem ser feitos pelo{" "}
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer">Instagram</a> ou pelo{" "}
              <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer">grupo de recepção no WhatsApp</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
