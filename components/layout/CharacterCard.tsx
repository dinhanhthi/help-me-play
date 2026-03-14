import Link from "next/link";
import type { Character } from "@/lib/types";

interface CharacterCardProps {
  character: Character;
  gameSlug: string;
}

export default function CharacterCard({ character, gameSlug }: CharacterCardProps) {
  return (
    <Link
      href={`/games/${gameSlug}/characters/${character.slug}`}
      className="group block text-center transition-all duration-200"
    >
      <div className="mx-auto mb-3">
        {character.portrait ? (
          <img
            src={character.portrait}
            alt={character.name}
            className="mx-auto h-[200px] w-auto object-contain transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-[200px] w-full items-center justify-center">
            <div className="h-16 w-16 rounded-full bg-accent-subtle" />
          </div>
        )}
      </div>
      <h3 className="font-display text-base font-semibold group-hover:text-accent transition-colors">
        {character.name}
      </h3>
      {character.description && (
        <p className="mt-1 text-xs text-muted leading-relaxed">
          {character.description}
        </p>
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
