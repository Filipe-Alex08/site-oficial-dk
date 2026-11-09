import type { Metadata } from "next";
import { notFound } from "next/navigation";
import GamesSection from "@/components/GamesSection";
import PageHero from "@/components/PageHero";
import { games } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

// Mesma tela da lista de jogos: o modal do jogo abre sozinho porque o
// GameCard compara a URL com o slug do jogo.
type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return games.map((game) => ({ slug: game.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const game = games.find((item) => item.slug === slug);
  if (!game) notFound();
  return pageMetadata(`${game.name}: regras e objetivos`, game.summary, `/atividades/jogos/${game.slug}`);
}

export default async function GamePage({ params }: Props) {
  const { slug } = await params;
  if (!games.some((item) => item.slug === slug)) notFound();

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
