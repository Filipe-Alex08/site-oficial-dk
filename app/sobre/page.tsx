import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { HeartHandshake, MapPin, ShieldCheck, Swords, Users } from "lucide-react";
import PageHero from "@/components/PageHero";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { socialLinks } from "@/lib/content";


export const metadata = pageMetadata("Sobre o DK-BH e como participar", "Conheça a história do Death Knights em Belo Horizonte, onde treinamos e como começar no Swordplay. Iniciantes recebem orientação e equipamentos.", "/sobre");

export default function AboutPage() {
  return (
    <>
      <PageHero title="Sobre o DK-BH" />
      <section className="section">
        <div className="container">
          <div className="card-grid about-grid">
            <article className="card"><span className="card-icon"><Swords /></span><h3>O grupo</h3><p>O Death Knights é um grupo de Swordplay que reúne esporte, estratégia e combate medieval.</p></article>
            <article className="card"><span className="card-icon"><Users /></span><h3>Nossa história</h3><p>Fundado em 2020, o DK nasceu a partir do antigo Graal-RJ e cresceu por meio de divisões e encontros em diferentes estados do Brasil.</p></article>
            <article className="card"><span className="card-icon"><MapPin /></span><h3>Onde treinamos</h3><p>As atividades regulares do DK em Belo Horizonte acontecem aos domingos, no Parque Ecológico da Pampulha.</p></article>
            <article className="card"><span className="card-icon"><HeartHandshake /></span><h3>Proposta</h3><p>Promovemos desenvolvimento técnico, atividades recreativas, integração, trabalho em equipe e participação em eventos.</p></article>
            <article className="card"><span className="card-icon"><ShieldCheck /></span><h3>Segurança e acolhimento</h3><p>Os equipamentos são acolchoados e avaliados. Novos participantes recebem orientação e adaptação gradual às atividades.</p></article>
          </div>

          <div className="join-panel" id="como-participar">
            <div>
              <h2>Como participar</h2>
              <p>Você não precisa de experiência nem de equipamento próprio: nós emprestamos tudo para você participar com segurança.</p>
              <p>A equipe de recepção apresenta o grupo, ensina as técnicas básicas e acompanha seus primeiros treinos. Você pode se tornar membro ou participar quando quiser.</p>

            </div>
            <ol className="join-steps">
              <li><span>1</span><p>Entre no grupo de avisos e recepção.</p></li>
              <li><span>2</span><p>Confirme sua presença em uma atividade.</p></li>
              <li><span>3</span><p>Participe de pelo menos três treinos.</p></li>
              <li><span>4</span><p>Converse com a recepção sobre virar membro ou continuar esporadicamente.</p></li>
            </ol>
            <a className="button button-primary" href={socialLinks.whatsapp} target="_blank" rel="noreferrer"><WhatsAppIcon size={18} /> Falar com a equipe de recepção</a>
          </div>
        </div>
      </section>
    </>
  );
}
