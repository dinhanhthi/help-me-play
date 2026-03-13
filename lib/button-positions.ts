import type { ButtonPosition } from "./types";

export type ButtonPositionMap = Record<string, ButtonPosition>;

/**
 * Button positions for handheld mode (two Joy-Con groups, no screen).
 * Coordinates are percentages relative to the SVG viewBox (300 x 200).
 *
 * Left group: x 0–45%
 * Right group: x 55–100%
 */
export const handheldPositions: ButtonPositionMap = {
  // Left Joy-Con
  "left-stick": { x: 14, y: 24, width: 11, height: 14, shape: "circle" },
  "dpad-up": { x: 14, y: 51, width: 5, height: 8, shape: "rect" },
  "dpad-down": { x: 14, y: 64, width: 5, height: 8, shape: "rect" },
  "dpad-left": { x: 8, y: 57, width: 7, height: 7, shape: "rect" },
  "dpad-right": { x: 20, y: 57, width: 7, height: 7, shape: "rect" },
  minus: { x: 32, y: 18, width: 7, height: 4, shape: "pill" },
  capture: { x: 13, y: 78, width: 6, height: 9, shape: "rect" },
  l: { x: 6, y: -1, width: 24, height: 6, shape: "pill" },
  zl: { x: 6, y: -6, width: 24, height: 5, shape: "pill" },

  // Right Joy-Con — ABXY centered on SVG circles (r=12, viewBox 300x200)
  x: { x: 72, y: 23, width: 8, height: 12, shape: "circle" },
  a: { x: 80, y: 35, width: 8, height: 12, shape: "circle" },
  b: { x: 72, y: 47, width: 8, height: 12, shape: "circle" },
  y: { x: 64, y: 35, width: 8, height: 12, shape: "circle" },
  "right-stick": { x: 75, y: 71, width: 9, height: 12, shape: "circle" },
  plus: { x: 60, y: 14, width: 7, height: 8, shape: "pill" },
  home: { x: 87, y: 83, width: 6, height: 8, shape: "circle" },
  r: { x: 70, y: -1, width: 24, height: 6, shape: "pill" },
  zr: { x: 70, y: -6, width: 24, height: 5, shape: "pill" },
};

/**
 * Button positions for single Joy-Con mode.
 * Coordinates are percentages relative to the SVG viewBox (100 x 260).
 */
export const singleJoyconPositions: ButtonPositionMap = {
  stick: { x: 40, y: 17, width: 20, height: 10, shape: "circle" },
  x: { x: 38, y: 38.5, width: 24, height: 9.2, shape: "circle" },
  a: { x: 62, y: 47.7, width: 24, height: 9.2, shape: "circle" },
  b: { x: 38, y: 56.9, width: 24, height: 9.2, shape: "circle" },
  y: { x: 14, y: 47.7, width: 24, height: 9.2, shape: "circle" },
  sl: { x: -2, y: 34, width: 9, height: 18, shape: "pill" },
  sr: { x: 91, y: 34, width: 9, height: 18, shape: "pill" },
};
