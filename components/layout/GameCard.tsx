import Image from "next/image";
import Link from "next/link";
import type { Game } from "@/lib/types";

interface GameCardProps {
  game: Game;
}

export default function GameCard({ game }: GameCardProps) {
  return (
    <Link
      href={`/games/${game.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:border-border-hover hover:bg-card-hover"
    >
      <div className="relative aspect-video overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-surface">
          <div className="h-10 w-10 rounded-xl bg-accent-subtle" />
        </div>
        {game.coverImage && (
          <Image
            src={game.coverImage}
            alt={game.title}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-[1.03]"
          />
        )}
      </div>
      <div className="p-5">
        <h3 className="font-display text-base font-semibold group-hover:text-accent transition-colors">
          {game.title}
        </h3>
        <p className="mt-1.5 text-sm text-muted leading-relaxed">{game.description}</p>
      </div>
    </Link>
  );
}
