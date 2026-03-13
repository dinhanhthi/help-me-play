"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import Tabs from "@/components/ui/Tabs";
import CharacterCard from "@/components/layout/CharacterCard";
import type { Character } from "@/lib/types";

interface GamePageClientProps {
  gameSlug: string;
  gameTitle: string;
  characters: Character[];
  tips: string[];
}

export default function GamePageClient({
  gameSlug,
  gameTitle,
  characters,
  tips,
}: GamePageClientProps) {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState("characters");

  const tabs = [
    { id: "characters", label: t.game.tabCharacters },
    { id: "tips", label: t.game.tabTips },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <h1 className="mb-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {gameTitle}
      </h1>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab}>
        {activeTab === "characters" && (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
            {characters.map((character) => (
              <CharacterCard key={character.slug} character={character} gameSlug={gameSlug} />
            ))}
          </div>
        )}

        {activeTab === "tips" && (
          <div>
            {tips.length > 0 ? (
              <ul className="space-y-3">
                {tips.map((tip, index) => (
                  <li
                    key={index}
                    className="rounded-xl border border-border bg-card p-4 text-sm leading-relaxed text-foreground"
                  >
                    {tip}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">{t.game.noTips}</p>
            )}
          </div>
        )}
      </Tabs>
    </div>
  );
}
