import Link from "next/link";
import PageHero from "@/components/PageHero";
import { pageMetadata } from "@/lib/seo";
import { socialLinks } from "@/lib/content";

export const metadata = pageMetadata(
  "Política de Privacidade",
  "Como o DK Death Knights coleta, usa e protege os dados de visitantes e membros do site, conforme a LGPD.",
  "/privacidade",
);

export default function PrivacyPage() {
  return (
    <>
      <PageHero title="Política de Privacidade" description="Última atualização: 18 de novembro de 2026." />
      <section className="section">
        <div className="container">
          <div className="prose">
            <h2>Quem somos</h2>
            <p>
              Este site é mantido pelo <strong>DK — Death Knights</strong>, grupo de Swordplay de Belo Horizonte (MG). Esta política explica quais dados pessoais tratamos, por quê, por quanto tempo e como você pode exercer seus direitos, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018, a LGPD).
            </p>

            <h2>Quem usa o site sem conta</h2>
            <p>
              Você pode navegar pelas páginas públicas (início, sobre, atividades, eventos e mídias) sem se cadastrar. Não usamos ferramentas de análise de audiência, pixels de publicidade nem cookies de rastreamento.
            </p>
            <p>
              Como em qualquer servidor web, o acesso gera registros técnicos temporários (endereço IP, página acessada, data e hora, tipo de navegador), usados para segurança, para limitar abusos e para corrigir erros. Esses registros são apagados automaticamente depois de 7 dias.
            </p>

            <h2>Dados dos membros</h2>
            <p>O cadastro é feito por convite. Para criar e manter a conta, tratamos:</p>
            <ul>
              <li><strong>Dados da conta:</strong> e-mail, senha (guardada somente de forma protegida pelo sistema de autenticação, nunca em texto legível), nome completo, apelido e o código de convite usado.</li>
              <li><strong>Dados do perfil no grupo:</strong> patente, graduação, casa, número de camisa, builds, foto de perfil e data de nascimento (opcional). Os demais membros aprovados veem apenas o dia e o mês do aniversário, nunca a data completa; o signo é calculado a partir dela.</li>
              <li><strong>Participação:</strong> confirmações de presença em atividades (resposta, número de convidados e observação), presenças registradas e resultados de simulados.</li>
              <li><strong>Registros de segurança e auditoria:</strong> ações administrativas importantes (por exemplo, aprovar um membro ou alterar um acesso) ficam registradas com o autor da ação, para dar transparência e permitir a correção de erros.</li>
            </ul>
            <p>
              Se você entrar com o Google, recebemos do Google apenas o seu nome e e-mail, para identificar a conta. Não temos acesso à sua senha do Google nem a outros dados da sua conta Google.
            </p>

            <h2>Para que usamos os dados</h2>
            <ul>
              <li>Criar e proteger a sua conta e permitir o acesso à área do membro;</li>
              <li>Organizar treinos, eventos, graduações e a vida do grupo;</li>
              <li>Controlar quem pode ver cada documento ou área;</li>
              <li>Prevenir fraudes, abusos e acessos indevidos;</li>
              <li>Enviar e-mails do próprio sistema, como redefinição de senha.</li>
            </ul>
            <p>
              As bases legais são a execução do vínculo com o grupo, o legítimo interesse na segurança do site e, quando aplicável, o seu consentimento. Não vendemos nem compartilhamos dados pessoais para fins de publicidade.
            </p>

            <h2>Cookies</h2>
            <p>Usamos somente cookies estritamente necessários ao funcionamento do site, que dispensam consentimento:</p>
            <ul>
              <li><strong>Sessão de login:</strong> mantém você conectado depois de entrar;</li>
              <li><strong>Troca rápida de contas (<code>dk-contas</code>):</strong> se você optar por salvar contas neste navegador, guardamos o necessário para alternar entre elas sem digitar a senha de novo. Esse cookie é inacessível a scripts da página e você pode removê-lo a qualquer momento saindo das contas salvas.</li>
            </ul>

            <h2>Com quem os dados passam</h2>
            <p>Para operar o site, dependemos de alguns serviços, que tratam dados apenas na medida necessária:</p>
            <ul>
              <li><strong>Infraestrutura própria do grupo,</strong> onde ficam o site e o banco de dados;</li>
              <li><strong>Cloudflare,</strong> que intermedia o tráfego entre você e o site (proteção e entrega);</li>
              <li><strong>Google,</strong> se você escolher entrar com a sua conta Google;</li>
              <li><strong>Provedor de envio de e-mail,</strong> para as mensagens automáticas do sistema.</li>
            </ul>
            <p>
              Também podemos divulgar dados quando houver obrigação legal ou ordem de autoridade competente. Alguns desses serviços podem processar dados fora do Brasil, com as garantias previstas na LGPD.
            </p>

            <h2>Conteúdo público</h2>
            <p>
              A página de mídias reúne publicações e fotos de treinos e eventos, algumas importadas do Instagram oficial do grupo (<a href={socialLinks.instagram} target="_blank" rel="noreferrer">@dkbhmg</a>). Se você aparece em uma imagem e quer que ela seja removida, fale conosco pelos canais abaixo.
            </p>

            <h2>Por quanto tempo guardamos</h2>
            <ul>
              <li>Dados da conta e do perfil: enquanto você for membro e até a exclusão da conta;</li>
              <li>Registros técnicos de acesso: 7 dias;</li>
              <li>Registros de auditoria administrativa: pelo tempo necessário à segurança e à prestação de contas do grupo.</li>
            </ul>

            <h2>Seus direitos</h2>
            <p>
              Pela LGPD (art. 18), você pode pedir a confirmação de que tratamos seus dados, o acesso a eles, a correção de dados incompletos ou desatualizados, a anonimização ou eliminação de dados desnecessários, a portabilidade, informações sobre compartilhamento e a revogação de consentimento. Você pode corrigir parte dos seus dados diretamente na área do membro.
            </p>
            <p>
              Dados de menores de 18 anos só são tratados com o consentimento de um dos pais ou do responsável legal (LGPD, art. 14).
            </p>

            <h2>Segurança</h2>
            <p>
              Adotamos medidas como conexão criptografada, senhas protegidas, controle de acesso por nível, limitação de tentativas de cadastro e login e registro de ações administrativas. Nenhum sistema é totalmente imune a falhas; se ocorrer um incidente que possa afetar você, avisaremos pelos canais do grupo.
            </p>

            <h2>Como falar conosco</h2>
            <p>
              Para exercer seus direitos ou tirar dúvidas sobre esta política, fale com a equipe pelo{" "}
              <a href={socialLinks.instagram} target="_blank" rel="noreferrer">Instagram</a> ou pelo{" "}
              <a href={socialLinks.whatsapp} target="_blank" rel="noreferrer">grupo de recepção no WhatsApp</a>. Você também pode recorrer à Autoridade Nacional de Proteção de Dados (ANPD).
            </p>

            <h2>Mudanças nesta política</h2>
            <p>
              Podemos atualizar este texto quando o site mudar. A data no topo mostra a última revisão. Veja também os nossos <Link href="/termos">Termos de Serviço</Link>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
