"use client";

import type { ControllerMode } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";

interface ModeToggleProps {
  mode: ControllerMode;
  onChange: (mode: ControllerMode) => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const { t } = useI18n();

  const modes: { value: ControllerMode; label: string }[] = [
    { value: "handheld", label: t.controls.handheldMode },
    { value: "single-joycon", label: t.controls.singleJoyCon },
  ];

  return (
    <div
      className="inline-flex gap-1 rounded-xl bg-surface p-1"
      role="radiogroup"
      aria-label={t.controls.controllerMode}
    >
      {modes.map((m) => {
        const isActive = mode === m.value;
        return (
          <button
            key={m.value}
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(m.value)}
            className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isActive
                ? "bg-accent text-background"
                : "text-muted hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
