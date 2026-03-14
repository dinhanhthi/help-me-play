"use client";

import type { ControllerMode } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";
import Tabs from "@/components/ui/Tabs";

interface ModeToggleProps {
  mode: ControllerMode;
  onChange: (mode: ControllerMode) => void;
}

const modes: ControllerMode[] = ["handheld", "single-joycon"];

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const { t } = useI18n();

  const tabs = modes.map((m) => ({
    id: m,
    label: m === "handheld" ? t.controls.handheldMode : t.controls.singleJoyCon,
  }));

  return (
    <Tabs
      tabs={tabs}
      activeTab={mode}
      onChange={(id) => onChange(id as ControllerMode)}
      aria-label={t.controls.controllerMode}
    />
  );
}
