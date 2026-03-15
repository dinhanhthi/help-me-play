import { getAllGames, getCharacters, getCharacter, getGameMeta, getMoves } from "@/lib/data";
import type { Move } from "@/lib/types";
import CharacterPageClient from "./CharacterPageClient";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface CharacterPageProps {
  params: Promise<{ gameSlug: string; characterSlug: string }>;
}

export function generateStaticParams() {
  const games = getAllGames();
  const params: { gameSlug: string; characterSlug: string }[] = [];

  for (const game of games) {
    const characters = getCharacters(game.slug);
    for (const character of characters) {
      params.push({ gameSlug: game.slug, characterSlug: character.slug });
    }
  }

  return params;
}

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { gameSlug, characterSlug } = await params;

  const character = getCharacter(gameSlug, characterSlug);
  if (!character) {
    notFound();
  }

  const gameMeta = getGameMeta(gameSlug);

  let moves: Move[];
  try {
    moves = getMoves(gameSlug, characterSlug);
  } catch {
    moves = [];
  }

  return (
    <Suspense>
      <CharacterPageClient
        characterName={character.name}
        characterDescription={character.description}
        characterPortrait={character.portrait}
        gameTitle={gameMeta.title}
        moves={moves}
        gameSlug={gameSlug}
        characterSlug={characterSlug}
      />
    </Suspense>
  );
}
