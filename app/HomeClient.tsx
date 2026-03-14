"use client";

import { useI18n } from "@/lib/i18n/context";
import GameCard from "@/components/layout/GameCard";
import type { Game } from "@/lib/types";

interface HomeClientProps {
  games: Game[];
}

export default function HomeClient({ games }: HomeClientProps) {
  const { t } = useI18n();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
      {/* Hero */}
      <section className="mb-14 text-center">
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
          {t.home.titlePart1} <span className="text-accent">{t.home.titlePart2}</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-muted leading-relaxed">
          {t.home.subtitle}
        </p>
      </section>

      {/* Games */}
      <section id="games">
        <h2 className="mb-5 font-display text-xl font-semibold">{t.home.gamesHeading}</h2>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <GameCard key={game.slug} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}
