"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { ComboStep, ControllerMode } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from "lucide-react";
import { inputTypeColors } from "./ControllerShell";
import { Tooltip } from "@/components/ui/Tooltip";
import JoyConHandheld from "./JoyConHandheld";
import JoyConSingle from "./JoyConSingle";
import { cn } from "@/lib/cn";

const directionArrows: Record<string, string> = {
  left: "\u2190",
  right: "\u2192",
  up: "\u2191",
  down: "\u2193",
};

interface ComboSequenceProps {
  steps: ComboStep[];
  mode: ControllerMode;
}

export default function ComboSequence({ steps, mode }: ComboSequenceProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isGap, setIsGap] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stepCount = steps.length;
  const step = steps[currentStep];

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Check if two steps have identical buttons
  const stepsMatch = useCallback(
    (a: number, b: number) => {
      const sa = steps[a];
      const sb = steps[b];
      if (!sa || !sb) return false;
      return (
        sa.inputType === sb.inputType &&
        sa.direction === sb.direction &&
        sa.buttons.length === sb.buttons.length &&
        sa.buttons.every((btn, i) => btn === sb.buttons[i])
      );
    },
    [steps],
  );

  const restart = useCallback(() => {
    clearTimer();
    setIsGap(false);
    setCurrentStep(0);
  }, [clearTimer]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const goToPrevStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = (prev - 1 + stepCount) % stepCount;
      if (stepsMatch(prev, next) && next !== prev) {
        setIsGap(true);
      }
      return next;
    });
  }, [stepCount, stepsMatch]);

  const goToNextStep = useCallback(() => {
    setCurrentStep((prev) => {
      const next = (prev + 1) % stepCount;
      if (stepsMatch(prev, next) && next !== prev) {
        setIsGap(true);
      }
      return next;
    });
  }, [stepCount, stepsMatch]);

  // Brief gap (150ms) between identical consecutive steps — works in both play and pause modes
  useEffect(() => {
    if (!isGap) return;
    const gapTimer = setTimeout(() => {
      setIsGap(false);
    }, 150);
    return () => clearTimeout(gapTimer);
  }, [isGap]);

  useEffect(() => {
    if (!isPlaying || stepCount === 0 || isGap) return;

    const duration = step?.duration ?? 1000;
    timerRef.current = setTimeout(() => {
      const nextStep = (currentStep + 1) % stepCount;
      if (stepsMatch(currentStep, nextStep) && nextStep !== currentStep) {
        // Insert a visual gap before showing the next identical step
        setIsGap(true);
        setCurrentStep(nextStep);
      } else {
        setCurrentStep(nextStep);
      }
    }, duration);
    return () => {
      clearTimer();
    };
  }, [isPlaying, currentStep, stepCount, step?.duration, clearTimer, isGap, stepsMatch]);

  if (stepCount === 0) {
    return <p className="text-sm text-muted">{t.controls.noComboSteps}</p>;
  }

  const activeButtons = isGap ? [] : (step?.buttons ?? []);
  const direction = isGap ? undefined : step?.direction;
  const inputType = isGap ? undefined : step?.inputType;
  const tooltip = inputType
    ? (t.controls.inputTypes as Record<string, string>)[inputType]
    : undefined;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="w-full flex justify-center">
        {mode === "handheld" ? (
          <JoyConHandheld
            activeButtons={activeButtons}
            direction={direction}
            inputType={inputType}
            tooltip={tooltip}
          />
        ) : (
          <JoyConSingle
            activeButtons={activeButtons}
            direction={direction}
            inputType={inputType}
            tooltip={tooltip}
          />
        )}
      </div>

      {/* Info tags */}

      <div
        className={cn("flex flex-wrap items-center gap-3 w-full h-6", {
          "justify-start": stepCount > 1,
          "justify-center": stepCount <= 1,
        })}
      >
        {stepCount > 1 && (
          <span className="font-mono text-xs text-muted">
            {t.controls.step}{" "}
            <span className="font-semibold text-foreground">{currentStep + 1}</span>/{stepCount}
          </span>
        )}
        {!direction &&
          activeButtons.map((btn) => {
            const badge = (
              <span
                key={btn}
                className="rounded-full h-6 w-6 flex items-center justify-center text-sm font-semibold text-white uppercase"
                style={{ backgroundColor: inputTypeColors[inputType ?? ""] ?? "#38bdf8" }}
              >
                {btn}
              </span>
            );
            return tooltip ? (
              <Tooltip key={btn} text={tooltip}>
                {badge}
              </Tooltip>
            ) : (
              badge
            );
          })}
        {direction &&
          (() => {
            const badge = (
              <span
                className="rounded-full h-6 w-6 flex items-center justify-center text-sm font-semibold text-white"
                style={{ backgroundColor: inputTypeColors[inputType ?? ""] ?? "#38bdf8" }}
              >
                {directionArrows[direction] ?? direction}
              </span>
            );
            const dirLabel = (t.directions as Record<string, string>)[direction] ?? direction;
            return <Tooltip text={dirLabel}>{badge}</Tooltip>;
          })()}
      </div>

      {/* Controls */}
      {stepCount > 1 && (
        <div className="flex items-center gap-2">
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
          {!isPlaying && (
            <button
              onClick={restart}
              className="cursor-pointer inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:text-foreground hover:border-border-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              aria-label={t.controls.restartAnimation}
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
