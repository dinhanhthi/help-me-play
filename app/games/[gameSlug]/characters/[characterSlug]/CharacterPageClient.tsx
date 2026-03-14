"use client";

import { useState } from "react";
import type { ControllerMode, Move } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";
import ModeToggle from "@/components/ui/ModeToggle";
import ComboSequence from "@/components/joy-con/ComboSequence";
import MediaEmbed from "@/components/media/MediaEmbed";

interface CharacterPageClientProps {
  characterName: string;
  characterDescription?: string;
  moves: Move[];
}

const categoryColors: Record<string, string> = {
  special: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  smash: "bg-red-500/10 text-red-400 border-red-500/20",
  tilt: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  throw: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  other: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export default function CharacterPageClient({
  characterName,
  characterDescription,
  moves,
}: CharacterPageClientProps) {
  const { t } = useI18n();
  const [mode, setMode] = useState<ControllerMode>("handheld");

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {characterName}
        </h1>
        {characterDescription && (
          <p className="mt-2 text-sm text-muted leading-relaxed">{characterDescription}</p>
        )}
      </div>

      <div className="mb-8">
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      <div className="space-y-5">
        {moves.map((move) => {
          const comboSteps = move.combos[mode] ?? [];
          const colorClass = categoryColors[move.category] ?? categoryColors["other"];

          return (
            <div
              key={move.id}
              className="overflow-hidden rounded-2xl border border-border bg-card"
            >
              {/* Move header */}
              <div className="border-b border-border px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-base font-semibold">{move.name}</h2>
                  <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${colorClass}`}>
                    {move.category}
                  </span>
                </div>
                {move.description && (
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">{move.description}</p>
                )}
              </div>

              {/* Side-by-side */}
              <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
                <div>
                  <ComboSequence steps={comboSteps} mode={mode} />
                </div>
                <div>
                  <MediaEmbed url={move.mediaUrl} title={move.name} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {moves.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted">{t.character.noMoves}</p>
        </div>
      )}
    </div>
  );
}
