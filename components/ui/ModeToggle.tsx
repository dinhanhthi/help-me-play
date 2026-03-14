"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ControllerMode } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";

interface ModeToggleProps {
  mode: ControllerMode;
  onChange: (mode: ControllerMode) => void;
}

const modes: ControllerMode[] = ["handheld", "single-joycon"];

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const { t } = useI18n();
  const buttonRefs = useRef<Map<ControllerMode, HTMLButtonElement>>(new Map());
  const [pill, setPill] = useState({ width: 0, left: 0 });

  const labels: Record<ControllerMode, string> = {
    handheld: t.controls.handheldMode,
    "single-joycon": t.controls.singleJoyCon,
  };

  const updatePill = useCallback(() => {
    const el = buttonRefs.current.get(mode);
    if (el) {
      setPill({ width: el.offsetWidth, left: el.offsetLeft });
    }
  }, [mode]);

  useEffect(() => {
    updatePill();
  }, [updatePill]);

  return (
    <div
      className="relative inline-flex rounded-full bg-card p-1 border border-border"
      role="radiogroup"
      aria-label={t.controls.controllerMode}
    >
      {/* Sliding pill indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-full bg-accent transition-all duration-300 ease-in-out"
        style={{
          width: pill.width,
          left: pill.left,
        }}
      />

      {modes.map((m) => {
        const isActive = mode === m;
        return (
          <button
            key={m}
            ref={(el) => {
              if (el) buttonRefs.current.set(m, el);
            }}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(m)}
            className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isActive ? "text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {labels[m]}
          </button>
        );
      })}
    </div>
  );
}
