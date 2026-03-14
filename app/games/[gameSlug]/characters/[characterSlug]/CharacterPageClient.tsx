"use client";

import { useState } from "react";
import type { ControllerMode, Move } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";
import { localize } from "@/lib/i18n";
import ModeToggle from "@/components/ui/ModeToggle";
import ComboSequence from "@/components/joy-con/ComboSequence";
import MediaEmbed from "@/components/media/MediaEmbed";
import { inputTypeColors } from "@/components/joy-con/ControllerShell";

interface CharacterPageClientProps {
  characterName: string;
  characterDescription?: string;
  moves: Move[];
  gameSlug: string;
  characterSlug: string;
}

const categoryColors: Record<string, string> = {
  special: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  smash: "bg-red-500/10 text-red-400 border-red-500/20",
  tilt: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  throw: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  other: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const GITHUB_BASE = "https://github.com/dinhanhthi/help-me-play/edit/main";

export default function CharacterPageClient({
  characterName,
  characterDescription,
  moves,
  gameSlug,
  characterSlug,
}: CharacterPageClientProps) {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<ControllerMode>("handheld");
  const editUrl = `${GITHUB_BASE}/data/${gameSlug}/moves/${characterSlug}.json`;

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

      <div className="mb-8 flex flex-wrap items-center gap-6">
        <ModeToggle mode={mode} onChange={setMode} />
        {/* Input type legend */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-muted">{t.controls.inputTypeLegend}:</span>
          {Object.entries(inputTypeColors).map(([type, color]) => (
            <div key={type} className="group relative flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted">{type}</span>
              <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-max max-w-[200px] rounded-lg bg-surface border border-border px-3 py-2 text-xs text-foreground shadow-lg group-hover:block">
                {(t.controls.inputTypes as Record<string, string>)[type]}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {moves.map((move) => {
          const comboSteps = move.combos[mode] ?? [];
          const colorClass = categoryColors[move.category] ?? categoryColors["other"];

          return (
            <div key={move.id} className="overflow-hidden rounded-2xl border border-border bg-card">
              {/* Move header */}
              <div className="border-b border-border px-5 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-base font-semibold">
                    {localize(move.name, locale)}
                  </h2>
                  <span
                    className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${colorClass}`}
                  >
                    {move.category}
                  </span>
                </div>
                {localize(move.description, locale) && (
                  <p className="mt-1.5 text-sm text-muted leading-relaxed">
                    {localize(move.description, locale)}
                  </p>
                )}
              </div>

              {/* Side-by-side */}
              <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 md:items-center">
                <div className="order-2 md:order-1">
                  <ComboSequence steps={comboSteps} mode={mode} />
                </div>
                <div className="order-1 md:order-2">
                  <MediaEmbed
                    url={move.mediaUrl}
                    title={localize(move.name, locale) ?? move.id}
                    editUrl={editUrl}
                  />
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
