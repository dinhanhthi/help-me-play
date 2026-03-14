"use client";

import type { ControllerMode } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";

interface ModeToggleProps {
  mode: ControllerMode;
  onChange: (mode: ControllerMode) => void;
}

const modes: ControllerMode[] = ["handheld", "single-joycon"];

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const { t } = useI18n();

  const labels: Record<ControllerMode, string> = {
    handheld: t.controls.handheldMode,
    "single-joycon": t.controls.singleJoyCon,
  };

  const activeIndex = modes.indexOf(mode);

  return (
    <div
      className="relative inline-flex rounded-full bg-card p-1"
      role="radiogroup"
      aria-label={t.controls.controllerMode}
    >
      {/* Sliding pill indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-full bg-accent transition-all duration-300 ease-in-out"
        style={{
          width: `calc(${100 / modes.length}% - 4px)`,
          left: `calc(${(activeIndex * 100) / modes.length}% + 2px)`,
        }}
      />

      {modes.map((m) => {
        const isActive = mode === m;
        return (
          <button
            key={m}
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
