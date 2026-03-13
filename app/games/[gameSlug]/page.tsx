import { getAllGames, getGameMeta, getCharacters } from "@/lib/data";
import GamePageClient from "./GamePageClient";

interface GamePageProps {
  params: Promise<{ gameSlug: string }>;
}

export function generateStaticParams() {
  const games = getAllGames();
  return games.map((game) => ({ gameSlug: game.slug }));
}

export default async function GamePage({ params }: GamePageProps) {
  const { gameSlug } = await params;
  const meta = getGameMeta(gameSlug);
  const characters = getCharacters(gameSlug);

  return (
    <GamePageClient
      gameSlug={gameSlug}
      gameTitle={meta.title}
      characters={characters}
      tips={meta.tips ?? []}
    />
  );
}
