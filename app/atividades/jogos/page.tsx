import { pageMetadata } from "@/lib/seo";
import GamesSection from "@/components/GamesSection";
import PageHero from "@/components/PageHero";

export const metadata = pageMetadata("Jogos de Swordplay: regras e objetivos", "Veja como jogar Trollball, Captura da Bandeira, Archery Tag e outros jogos de Swordplay do DK. Consulte regras, equipes, equipamentos e segurança.", "/atividades/jogos");

export default function GamesPage() {
  return (
    <>
      <PageHero
        title="Jogos de Swordplay"
        description="Objetivos, regras e equipamentos de cada jogo."
        variant="training"
      />
      <GamesSection />
    </>
  );
}
