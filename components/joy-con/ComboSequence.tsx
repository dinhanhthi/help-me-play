"use client";

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from "react";
import type { ComboMethod, ComboStep, ControllerMode } from "@/lib/types";
import { localize } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n/context";
import JoyConHandheld from "./JoyConHandheld";
import JoyConSingle from "./JoyConSingle";
import { cn } from "@/lib/cn";

function MethodToggle({
  active,
  onChange,
  labels,
}: {
  active: number;
  onChange: (method: number) => void;
  labels: string[];
}) {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [pill, setPill] = useState({ width: 0, left: 0 });

  const updatePill = useCallback(() => {
    const el = btnRefs.current[active];
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
      {labels.map((label, method) => (
        <button
          key={method}
          ref={(el) => {
            btnRefs.current[method] = el;
          }}
          onClick={() => onChange(method)}
          className={cn(
            "relative z-10 cursor-pointer rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors duration-300",
            active === method ? "text-white" : "text-muted hover:text-foreground",
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export interface ComboSequenceHandle {
  togglePlayPause: () => void;
  goToPrevStep: () => void;
  goToNextStep: () => void;
  restart: () => void;
}

export interface ComboSequenceState {
  currentStep: number;
  stepCount: number;
  isPlaying: boolean;
}

interface ComboSequenceProps {
  methods: ComboMethod[];
  mode: ControllerMode;
  onStateChange?: (state: ComboSequenceState) => void;
}

const ComboSequence = forwardRef<ComboSequenceHandle, ComboSequenceProps>(function ComboSequence(
  { methods, mode, onStateChange },
  ref,
) {
  const { t, locale } = useI18n();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isGap, setIsGap] = useState(false);
  const [activeMethod, setActiveMethod] = useState(0);

  const activeSteps: ComboStep[] = methods[activeMethod]?.[mode] ?? [];
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

  useImperativeHandle(
    ref,
    () => ({ togglePlayPause, goToPrevStep, goToNextStep, restart }),
    [togglePlayPause, goToPrevStep, goToNextStep, restart],
  );

  useEffect(() => {
    onStateChange?.({ currentStep, stepCount, isPlaying });
  }, [currentStep, stepCount, isPlaying, onStateChange]);

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
    <div className="flex flex-col items-center gap-4 h-full">
      {methods.length > 1 && (
        <MethodToggle
          active={activeMethod}
          onChange={switchMethod}
          labels={methods.map((m, i) =>
            m.label
              ? (localize(m.label, locale) ?? `${t.controls.method} ${i + 1}`)
              : `${t.controls.method} ${i + 1}`,
          )}
        />
      )}
      <div className="w-full flex items-center justify-center flex-1 min-h-0">
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
    </div>
  );
});

export default ComboSequence;
