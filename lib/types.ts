export type ControllerMode = "handheld" | "single-joycon";

export interface ButtonDefinition {
  id: string;
  label: string;
  /** Available in these controller modes */
  modes: ControllerMode[];
}

export interface ButtonPosition {
  /** X position as percentage (0-100) relative to controller container */
  x: number;
  /** Y position as percentage (0-100) relative to controller container */
  y: number;
  /** Width as percentage */
  width: number;
  /** Height as percentage */
  height: number;
  /** Shape of the button for rendering */
  shape: "circle" | "rect" | "pill" | "dpad";
}

export interface ComboStep {
  /** Button IDs pressed simultaneously in this step */
  buttons: string[];
  /** Optional direction for analog stick (e.g., "up", "down", "left", "right") */
  direction?: string;
  /** How long to hold this step in ms */
  duration?: number;
  /** Input type for all buttons in this step (e.g., "Hold", "Tap", "Mash") */
  inputType?: string;
  /** Per-button input type overrides. Key is button ID, value is inputType.
   *  Useful when buttons in the same step have different input types
   *  (e.g., holding L while tapping A). Falls back to `inputType` if not set. */
  buttonInputTypes?: Record<string, string>;
}

/** A string that can be either a plain string (legacy) or a per-locale object */
export type LocalizedString = string | Record<string, string>;

/** One input method for a move — steps per controller mode, with an optional label */
export type ComboMethod = Partial<Record<ControllerMode, ComboStep[]>> & {
  label?: LocalizedString;
};

export interface Move {
  id: string;
  name: LocalizedString;
  description?: LocalizedString;
  tip?: LocalizedString;
  /** Category: e.g. "special", "smash", "tilt", "throw", "other" */
  category: string;
  /** Array of input methods. First item is the primary method; additional items are alternatives. */
  combos: ComboMethod[];
  /** URL to video (YouTube, Vimeo, etc.) or GIF (Giphy, Cloudinary, direct) */
  mediaUrl: string;
  /** Original source URL before Cloudinary migration (shown as "Source" credit) */
  sourceUrl?: string;
  /** Auto-detected from URL, but can be overridden */
  mediaType?: "video" | "gif" | "image";
}

export interface Character {
  slug: string;
  name: string;
  /** URL or path to portrait image */
  portrait?: string;
  /** Brief description */
  description?: string;
  /** Tags for filtering: e.g. "heavyweight", "swordfighter" */
  tags?: string[];
}

export interface GameMeta {
  slug: string;
  title: string;
  description: string;
  /** URL or path to cover image */
  coverImage?: string;
  /** General tips for the game */
  tips?: string[];
}

export interface Game {
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
}
