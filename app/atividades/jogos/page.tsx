import { pageMetadata } from "@/lib/seo";
import GamesSection from "@/components/GamesSection";
import PageHero from "@/components/PageHero";
import PageTrail from "@/components/site/PageTrail";
import SubNav from "@/components/site/SubNav";

export const metadata = pageMetadata("Jogos de Swordplay: regras e objetivos", "Veja como jogar Trollball, Captura da Bandeira, Archery Tag e outros jogos de Swordplay do DK. Consulte regras, equipes, equipamentos e segurança.", "/atividades/jogos");

export default function GamesPage() {
  return (
    <>
      <PageHero
        eyebrow="Atividades"
        title="Jogos de Swordplay"
        description="Os jogos que rolam nos nossos treinos e como se joga cada um."
        variant="training"
      />
      <SubNav kind="activities" />
      <GamesSection />
      <PageTrail href="/atividades/jogos" />
    </>
  );
}
