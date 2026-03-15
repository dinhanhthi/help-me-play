"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, ChessKnight, Pause, Play, ChevronLeft, RotateCcw } from "lucide-react";
import type { ControllerMode, Move } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";
import { localize, type Locale } from "@/lib/i18n";
import ModeToggle from "@/components/ui/ModeToggle";
import ComboSequence, {
  type ComboSequenceHandle,
  type ComboSequenceState,
} from "@/components/joy-con/ComboSequence";
import MediaEmbed from "@/components/media/MediaEmbed";
import { inputTypeColors } from "@/components/joy-con/ControllerShell";
import { Tooltip } from "@/components/ui/Tooltip";

interface CharacterPageClientProps {
  characterName: string;
  characterDescription?: string;
  characterPortrait?: string;
  gameTitle: string;
  moves: Move[];
  gameSlug: string;
  characterSlug: string;
}

const categoryColors: Record<string, string> = {
  ground: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  tilt: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  smash: "bg-red-500/10 text-red-400 border-red-500/20",
  aerial: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  special: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  grab: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  other: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

const categoryOrder = ["ground", "tilt", "smash", "aerial", "special", "grab", "other"];

const GITHUB_BASE = "https://github.com/dinhanhthi/help-me-play/edit/main";

const btnClass =
  "cursor-pointer inline-flex h-7 w-7 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-foreground hover:border-border-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent";

function MoveCard({
  move,
  mode,
  colorClass,
  catLabels,
  catDescs,
  locale,
  editUrl,
  t,
}: {
  move: Move;
  mode: ControllerMode;
  colorClass: string;
  catLabels: Record<string, string>;
  catDescs: Record<string, string>;
  locale: Locale;
  editUrl: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
}) {
  const comboRef = useRef<ComboSequenceHandle>(null);
  const [comboState, setComboState] = useState<ComboSequenceState>({
    currentStep: 0,
    stepCount: 0,
    isPlaying: true,
  });

  const { currentStep, stepCount, isPlaying } = comboState;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Move header */}
      <div className="border-b border-border px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-base font-semibold">{localize(move.name, locale)}</h3>
          {catDescs[move.category] ? (
            <Tooltip text={catDescs[move.category]}>
              <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${colorClass}`}>
                {catLabels[move.category] ?? move.category}
              </span>
            </Tooltip>
          ) : (
            <span className={`rounded-lg border px-2 py-0.5 text-[11px] font-semibold ${colorClass}`}>
              {catLabels[move.category] ?? move.category}
            </span>
          )}
        </div>
        {localize(move.description, locale) && (
          <p className="mt-1.5 text-sm text-muted leading-relaxed">
            {localize(move.description, locale)}
          </p>
        )}
      </div>

      {/* Side-by-side */}
      <div className="grid grid-cols-1 gap-5 p-4 md:grid-cols-[auto_1fr] md:items-center">
        <div className="order-2 md:order-1 h-full">
          <ComboSequence
            ref={comboRef}
            methods={move.combos}
            mode={mode}
            onStateChange={setComboState}
          />
        </div>
        <div className="order-1 md:order-2 h-full">
          <MediaEmbed
            url={move.mediaUrl}
            sourceUrl={move.sourceUrl}
            title={localize(move.name, locale) ?? move.id}
            editUrl={editUrl}
          />
        </div>
      </div>

      {/* Card footer: step counter + controls */}
      <div className="border-t border-border px-4 py-2 flex flex-row gap-4 items-center justify-start h-11">
        <div className="h-6 font-mono text-xs text-muted flex items-center gap-1">
          {t.controls.step}{" "}
          <span className="font-semibold text-foreground">{currentStep + 1}</span>/{stepCount}
        </div>

        {stepCount > 1 && (
          <div className="flex items-center justify-start flex-1 min-w-0 gap-1.5">
            <button
              onClick={() => comboRef.current?.togglePlayPause()}
              className={btnClass}
              aria-label={isPlaying ? t.controls.pauseAnimation : t.controls.playAnimation}
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            </button>
            {!isPlaying && (
              <>
                <button
                  onClick={() => comboRef.current?.goToPrevStep()}
                  className={btnClass}
                  aria-label={t.controls.previousStep}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => comboRef.current?.goToNextStep()}
                  className={btnClass}
                  aria-label={t.controls.nextStep}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => comboRef.current?.restart()}
                  className={btnClass}
                  aria-label={t.controls.restartAnimation}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CharacterPageClient({
  characterName,
  characterDescription,
  characterPortrait,
  gameTitle,
  moves,
  gameSlug,
  characterSlug,
}: CharacterPageClientProps) {
  const { t, locale } = useI18n();
  const [mode, setMode] = useState<ControllerMode>("handheld");
  const [portraitLoaded, setPortraitLoaded] = useState(false);
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
  const [activeButtons, setActiveButtons] = useState<Set<string>>(new Set());
  const editUrl = `${GITHUB_BASE}/data/${gameSlug}/moves/${characterSlug}.json`;

  // Collect unique categories and buttons from data
  const { categories, buttons } = useMemo(() => {
    const cats = new Set<string>();
    const btns = new Set<string>();
    for (const move of moves) {
      cats.add(move.category);
      const steps = move.combos[0]?.[mode] ?? [];
      for (const step of steps) {
        for (const b of step.buttons) {
          // Only show face buttons, not sticks
          if (!b.includes("stick")) btns.add(b);
        }
      }
    }
    return {
      categories: categoryOrder.filter((c) => cats.has(c)),
      buttons: [...btns].sort(),
    };
  }, [moves, mode]);

  const toggleCategory = (cat: string) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  const toggleButton = (btn: string) => {
    setActiveButtons((prev) => {
      const next = new Set(prev);
      if (next.has(btn)) next.delete(btn);
      else next.add(btn);
      return next;
    });
  };

  // Filter moves
  const filteredMoves = useMemo(() => {
    return moves.filter((move) => {
      if (activeCategories.size > 0 && !activeCategories.has(move.category)) return false;
      if (activeButtons.size > 0) {
        const steps = move.combos[0]?.[mode] ?? [];
        const moveButtons = new Set(steps.flatMap((s) => s.buttons));
        const hasMatch = [...activeButtons].some((b) => moveButtons.has(b));
        if (!hasMatch) return false;
      }
      return true;
    });
  }, [moves, activeCategories, activeButtons, mode]);

  // Group filtered moves by category
  const groupedMoves = useMemo(() => {
    const groups: Record<string, Move[]> = {};
    for (const move of filteredMoves) {
      if (!groups[move.category]) groups[move.category] = [];
      groups[move.category].push(move);
    }
    return groups;
  }, [filteredMoves]);

  const catLabels = (t.character.categories ?? {}) as Record<string, string>;
  const catDescs = (t.character.categoryDescriptions ?? {}) as Record<string, string>;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
      <nav className="mb-4 flex items-center gap-1.5 text-sm text-muted">
        <Link href="/" className="transition-colors hover:text-accent">
          {t.header.home}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={`/games/${gameSlug}`} className="transition-colors hover:text-accent">
          {gameTitle}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">{characterName}</span>
      </nav>

      <div className="mb-6 flex items-center gap-4">
        <div className="relative shrink-0 h-16 w-16 sm:h-20 sm:w-20">
          {!portraitLoaded && (
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-surface">
              <ChessKnight className="h-8 w-8 text-muted animate-pulse" />
            </div>
          )}
          {characterPortrait && (
            <Image
              src={characterPortrait}
              alt={characterName}
              fill
              onLoad={() => setPortraitLoaded(true)}
              className={`rounded-xl object-contain transition-opacity ${portraitLoaded ? "opacity-100" : "opacity-0"}`}
            />
          )}
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {characterName}
          </h1>
          {characterDescription && (
            <p className="mt-1 text-sm text-muted leading-relaxed">{characterDescription}</p>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {categories.map((cat) => {
          const isActive = activeCategories.has(cat);
          const colorClass = categoryColors[cat] ?? categoryColors["other"];
          const btn = (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`cursor-pointer rounded-lg border px-2.5 py-1 text-xs font-semibold transition-all ${colorClass} ${isActive ? "opacity-100 ring-1 ring-current scale-105" : "opacity-60 hover:opacity-80"}`}
            >
              {catLabels[cat] ?? cat}
            </button>
          );
          return catDescs[cat] ? (
            <Tooltip key={cat} text={catDescs[cat]}>
              {btn}
            </Tooltip>
          ) : (
            btn
          );
        })}
        {buttons.map((btn) => {
          const isActive = activeButtons.has(btn);
          return (
            <button
              key={btn}
              onClick={() => toggleButton(btn)}
              className={`cursor-pointer rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-semibold uppercase transition-all ${isActive ? "opacity-100 text-foreground ring-1 ring-accent scale-105" : "opacity-60 text-muted hover:opacity-80"}`}
            >
              {btn}
            </button>
          );
        })}
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-6">
        <ModeToggle mode={mode} onChange={setMode} />
        {/* Input type legend */}
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-semibold text-muted">{t.controls.inputTypeLegend}:</span>
          {Object.entries(inputTypeColors).map(([type, color]) => (
            <Tooltip key={type} text={(t.controls.inputTypes as Record<string, string>)[type]}>
              <div className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-xs text-muted">{type}</span>
              </div>
            </Tooltip>
          ))}
        </div>
      </div>

      {/* Sections by category */}
      {categoryOrder
        .filter((cat) => groupedMoves[cat])
        .map((cat) => (
          <section key={cat} className="mb-10">
            <h2 className="font-display text-2xl font-bold tracking-tight">
              {catLabels[cat] ?? cat}
            </h2>
            {catDescs[cat] && <p className="mt-1 mb-4 text-sm text-muted">{catDescs[cat]}</p>}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {groupedMoves[cat].map((move) => (
                <MoveCard
                  key={move.id}
                  move={move}
                  mode={mode}
                  colorClass={categoryColors[move.category] ?? categoryColors["other"]}
                  catLabels={catLabels}
                  catDescs={catDescs}
                  locale={locale}
                  editUrl={editUrl}
                  t={t}
                />
              ))}
            </div>
          </section>
        ))}

      {filteredMoves.length === 0 && (
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <p className="text-sm text-muted">{t.character.noMoves}</p>
        </div>
      )}
    </div>
  );
}
