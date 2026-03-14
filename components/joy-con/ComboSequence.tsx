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

function MethodToggle({
  active,
  onChange,
  label1,
  label2,
}: {
  active: number;
  onChange: (method: number) => void;
  label1: string;
  label2: string;
}) {
  const btn0Ref = useRef<HTMLButtonElement>(null);
  const btn1Ref = useRef<HTMLButtonElement>(null);
  const [pill, setPill] = useState({ width: 0, left: 0 });

  const updatePill = useCallback(() => {
    const el = active === 0 ? btn0Ref.current : btn1Ref.current;
    if (el) setPill({ width: el.offsetWidth, left: el.offsetLeft });
  }, [active]);

  useEffect(() => {
    updatePill();
  }, [updatePill]);

  return (
    <div className="relative inline-flex rounded-full bg-card p-0.5 border border-border">
      <div
        className="absolute top-0.5 bottom-0.5 rounded-full bg-accent transition-all duration-300 ease-in-out"
        style={{ width: pill.width, left: pill.left }}
      />
      {[0, 1].map((method) => (
        <button
          key={method}
          ref={method === 0 ? btn0Ref : btn1Ref}
          onClick={() => onChange(method)}
          className={cn(
            "relative z-10 cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors duration-300",
            active === method ? "text-white" : "text-muted hover:text-foreground",
          )}
        >
          {method === 0 ? label1 : label2}
        </button>
      ))}
    </div>
  );
}

interface ComboSequenceProps {
  steps: ComboStep[];
  altSteps?: ComboStep[];
  mode: ControllerMode;
}

export default function ComboSequence({ steps, altSteps, mode }: ComboSequenceProps) {
  const { t } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isGap, setIsGap] = useState(false);
  const [activeMethod, setActiveMethod] = useState(0);

  const activeSteps = activeMethod === 1 && altSteps ? altSteps : steps;
  const hasAlt = altSteps && altSteps.length > 0;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stepCount = activeSteps.length;
  const step = activeSteps[currentStep];

  const clearTimer = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const switchMethod = useCallback(
    (method: number) => {
      setActiveMethod(method);
      setCurrentStep(0);
      setIsGap(false);
      clearTimer();
    },
    [clearTimer],
  );

  // Check if two steps have identical buttons
  const stepsMatch = useCallback(
    (a: number, b: number) => {
      const sa = activeSteps[a];
      const sb = activeSteps[b];
      if (!sa || !sb) return false;
      return (
        sa.inputType === sb.inputType &&
        sa.direction === sb.direction &&
        sa.buttons.length === sb.buttons.length &&
        sa.buttons.every((btn, i) => btn === sb.buttons[i])
      );
    },
    [activeSteps],
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
      {hasAlt && (
        <MethodToggle
          active={activeMethod}
          onChange={switchMethod}
          label1={`${t.controls.method} 1`}
          label2={`${t.controls.method} 2`}
        />
      )}
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

      <div className={"flex flex-wrap items-center justify-center gap-3 w-full h-6"}>
        <span className="font-mono text-xs text-muted">
          {t.controls.step} <span className="font-semibold text-foreground">{currentStep + 1}</span>
          /{stepCount}
        </span>
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
