import type { ControllerMode } from "./types";
import buttonsData from "@/data/buttons.json";

export interface ButtonInfo {
  id: string;
  label: string;
  modes: ControllerMode[];
}

export const BUTTONS: ButtonInfo[] = buttonsData.buttons as ButtonInfo[];

/** Get label for a button ID, returns the ID itself as fallback. */
export function getButtonLabel(buttonId: string): string {
  const button = BUTTONS.find((b) => b.id === buttonId);
  return button?.label ?? buttonId;
}

/** Get buttons available for a given controller mode. */
export function getButtonsForMode(mode: ControllerMode): ButtonInfo[] {
  return BUTTONS.filter((b) => b.modes.includes(mode));
}
