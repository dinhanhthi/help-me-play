"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { ChessKnight } from "lucide-react";
import type { Character } from "@/lib/types";

interface CharacterCardProps {
  character: Character;
  gameSlug: string;
}

export default function CharacterCard({ character, gameSlug }: CharacterCardProps) {
  const [portraitLoaded, setPortraitLoaded] = useState(false);

  return (
    <Link
      href={`/games/${gameSlug}/characters/${character.slug}`}
      className="group block text-center transition-all duration-200"
    >
      <div className="relative mx-auto mb-3 h-[200px]">
        {character.portrait ? (
          <>
            {!portraitLoaded && (
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface animate-pulse">
                <ChessKnight className="h-14 w-14 text-muted" />
              </div>
            )}
            <Image
              src={character.portrait}
              alt={character.name}
              fill
              onLoad={() => setPortraitLoaded(true)}
              className={`object-contain transition-all duration-200 group-hover:scale-105 ${portraitLoaded ? "opacity-100" : "opacity-0"}`}
            />
          </>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ChessKnight className="h-10 w-10 text-muted" />
          </div>
        )}
      </div>
      <h3 className="font-display text-base font-semibold group-hover:text-accent transition-colors">
        {character.name}
      </h3>
      {character.description && (
        <p className="mt-1 text-xs text-muted leading-relaxed">{character.description}</p>
      )}
      {character.tags && character.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-1.5">
          {character.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-accent-subtle px-2 py-0.5 text-[11px] font-medium text-accent"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}
