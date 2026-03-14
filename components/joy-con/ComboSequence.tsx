"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ComboStep, ControllerMode } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";
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

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full">
        {mode === "handheld" ? (
          <JoyConHandheld activeButtons={activeButtons} direction={direction} />
        ) : (
          <JoyConSingle activeButtons={activeButtons} direction={direction} />
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
            {direction[0].toUpperCase() + direction.slice(1)}
          </span>
        )}
      </div>

      {/* Controls */}
      {stepCount > 1 && <div className="flex items-center gap-2">
        <button
          onClick={togglePlayPause}
          className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-foreground hover:border-border-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={isPlaying ? t.controls.pauseAnimation : t.controls.playAnimation}
        >
          {isPlaying ? (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6,4 20,12 6,20" />
            </svg>
          )}
        </button>
        <button
          onClick={restart}
          className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-foreground hover:border-border-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          aria-label={t.controls.restartAnimation}
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </button>
      </div>}
    </div>
  );
}
