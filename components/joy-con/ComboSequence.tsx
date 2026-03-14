"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ComboStep, ControllerMode } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import JoyConHandheld from "./JoyConHandheld";
import JoyConSingle from "./JoyConSingle";

interface ComboSequenceProps {
  steps: ComboStep[];
  mode: ControllerMode;
}

export default function ComboSequence({ steps, mode }: ComboSequenceProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stepCount = steps.length;
  const step = steps[currentStep];

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const restart = useCallback(() => {
    clearTimer();
    setCurrentStep(0);
    setIsPlaying(true);
  }, [clearTimer]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => (prev - 1 + stepCount) % stepCount);
  }, [stepCount]);

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => (prev + 1) % stepCount);
  }, [stepCount]);

  useEffect(() => {
    if (!isPlaying || stepCount === 0) return;
    const duration = step?.duration ?? 1000;
    timerRef.current = setTimeout(() => {
      setCurrentStep((prev) => (prev + 1) % stepCount);
    }, duration);
    return () => { clearTimer(); };
  }, [isPlaying, currentStep, stepCount, step?.duration, clearTimer]);

  if (stepCount === 0) {
    return <p className="text-sm text-muted">{t.controls.noComboSteps}</p>;
  }

  const activeButtons = step?.buttons ?? [];
  const direction = step?.direction;
  const inputType = step?.inputType;
  const tooltip = inputType
    ? (t.controls.inputTypes as Record<string, string>)[inputType]
    : undefined;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full">
        {mode === "handheld" ? (
          <JoyConHandheld activeButtons={activeButtons} direction={direction} inputType={inputType} tooltip={tooltip} />
        ) : (
          <JoyConSingle activeButtons={activeButtons} direction={direction} inputType={inputType} tooltip={tooltip} />
        )}
      </div>

      {/* Info tags */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {stepCount > 1 && (
          <span className="rounded-lg bg-surface px-2.5 py-1 font-mono text-xs text-muted">
            {t.controls.step} {currentStep + 1}/{stepCount}
          </span>
        )}
        {inputType && (
          <span className="rounded-lg bg-accent-subtle px-2.5 py-1 text-xs font-semibold text-accent">
            {inputType}
          </span>
        )}
        {inputType && direction && (
          <span className="text-xs text-muted font-bold">+</span>
        )}
        {direction && (
          <span className="rounded-lg bg-accent-subtle px-2.5 py-1 text-xs font-semibold text-accent">
            {(t.directions as Record<string, string>)[direction] ?? direction[0].toUpperCase() + direction.slice(1)}
          </span>
        )}
      </div>

      {/* Controls */}
      {stepCount > 1 && <div className="flex items-center gap-2">
        {!isPlaying && (
          <button
            onClick={goToPrevStep}
            className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-foreground hover:border-border-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t.controls.previousStep}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={togglePlayPause}
          className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-foreground hover:border-border-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={isPlaying ? t.controls.pauseAnimation : t.controls.playAnimation}
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
        </button>
        {!isPlaying && (
          <button
            onClick={goToNextStep}
            className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-foreground hover:border-border-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            aria-label={t.controls.nextStep}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
        <button
          onClick={restart}
          className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-foreground hover:border-border-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={t.controls.restartAnimation}
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>}
    </div>
  );
}
