import type { ControllerMode } from "@/lib/types";

interface ControllerShellProps {
  mode: ControllerMode;
  activeButtons?: string[];
  direction?: string;
}

/* ── Coordinate helpers ── */
const pct = (v: number, base: number) => `${(v / base) * 100}%`;

/* ── Shared styles ── */
const outline = "border border-[#2a3040]";
const filled = "bg-[#1a1f2e] border border-[#2a3040]";
const cap = "bg-[#222838] border border-[#2a3040]";
const active = "bg-accent z-10";

/* ── Handheld: 430 × 456 coordinate space ── */
const W = 430;
const H = 456;

/** Map of button IDs to their position in the handheld layout */
const handheldButtons: Record<string, { cx: number; cy: number; r: number } | { x: number; y: number; w: number; h: number; rx: number }> = {
  "left-stick": { cx: 95, cy: 197, r: 33.5 },
  "dpad-up": { cx: 95, cy: 322, r: 19 },
  "dpad-right": { cx: 133, cy: 360, r: 19 },
  "dpad-down": { cx: 95, cy: 398, r: 19 },
  "dpad-left": { cx: 57, cy: 360, r: 19 },
  x: { cx: 335, cy: 150, r: 19 },
  y: { cx: 297, cy: 188, r: 19 },
  a: { cx: 373, cy: 188, r: 19 },
  b: { cx: 335, cy: 226, r: 19 },
  "right-stick": { cx: 335, cy: 351, r: 33.5 },
  zl: { x: 15, y: 0, w: 160, h: 40, rx: 20 },
  l: { x: 16, y: 50, w: 160, h: 30, rx: 15 },
  zr: { x: 255, y: 0, w: 160, h: 40, rx: 20 },
  r: { x: 256, y: 50, w: 160, h: 30, rx: 15 },
};

const faceButtonIds = new Set(["a", "b", "x", "y"]);
const faceLabels: Record<string, string> = { a: "A", b: "B", x: "X", y: "Y" };

/** Direction arrow angles */
const directionAngles: Record<string, number> = {
  up: 0, right: 90, down: 180, left: 270,
};

function HandheldShell({ activeButtons = [], direction }: { activeButtons: string[]; direction?: string }) {
  const isActive = (id: string) => activeButtons.includes(id);

  return (
    <div
      className="relative mx-auto w-full max-w-[258px] select-none"
      style={{ aspectRatio: "430 / 456" }}
      role="img"
      aria-label="Nintendo Switch controller layout"
    >
      {/* Joy-Con bodies */}
      <div className={`absolute rounded-full ${filled}`} style={{ left: pct(0, W), top: pct(92, H), width: pct(190, W), height: pct(364, H) }} />
      <div className={`absolute rounded-full ${filled}`} style={{ left: pct(240, W), top: pct(92, H), width: pct(190, W), height: pct(364, H) }} />

      {/* Left Stick – outer ring */}
      <div className={`absolute rounded-full ${outline}`} style={{ left: pct(95 - 65, W), top: pct(197 - 65, H), width: pct(130, W), height: pct(130, H) }} />
      {/* Right Stick – outer ring */}
      <div className={`absolute rounded-full ${outline}`} style={{ left: pct(335 - 65, W), top: pct(351 - 65, H), width: pct(130, W), height: pct(130, H) }} />

      {/* Interactive buttons */}
      {Object.entries(handheldButtons).map(([id, pos]) => {
        const on = isActive(id);
        const isCircle = "cx" in pos;

        if (isCircle) {
          const { cx, cy, r } = pos;
          return (
            <div
              key={id}
              data-button-id={id}
              className={`absolute rounded-full flex items-center justify-center transition-colors duration-150 pointer-events-none ${on ? active : cap}`}
              style={{ left: pct(cx - r, W), top: pct(cy - r, H), width: pct(r * 2, W), height: pct(r * 2, H) }}
              aria-label={`${id} button${on ? " (active)" : ""}`}
            >
              {faceButtonIds.has(id) && (
                <span className={`select-none leading-none font-semibold text-[10px] ${on ? "text-background" : "text-muted/50"}`}>
                  {faceLabels[id]}
                </span>
              )}
            </div>
          );
        }

        const { x, y, w, h, rx } = pos;
        return (
          <div
            key={id}
            data-button-id={id}
            className={`absolute flex items-center justify-center transition-colors duration-150 pointer-events-none ${on ? active : outline}`}
            style={{ left: pct(x, W), top: pct(y, H), width: pct(w, W), height: pct(h, H), borderRadius: `${rx}px` }}
            aria-label={`${id} button${on ? " (active)" : ""}`}
          />
        );
      })}

      {/* Direction indicator on left stick */}
      {direction && directionAngles[direction] !== undefined && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: pct(95, W),
            top: pct(197, H),
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg viewBox="0 0 40 40" className="w-8 h-8" style={{ transform: `rotate(${directionAngles[direction]}deg)` }}>
            <polygon points="20,4 28,18 12,18" fill="#38bdf8" opacity="0.9" />
          </svg>
        </div>
      )}
    </div>
  );
}

/* ── Single Joy-Con: 100 × 220 coordinate space ── */
const SW = 100;
const SH = 220;

const singleButtons: Record<string, { cx: number; cy: number; r: number } | { x: number; y: number; w: number; h: number; rx: number }> = {
  stick: { cx: 50, cy: 50, r: 8 },
  x: { cx: 50, cy: 105, r: 12 },
  a: { cx: 74, cy: 129, r: 12 },
  b: { cx: 50, cy: 153, r: 12 },
  y: { cx: 26, cy: 129, r: 12 },
  sl: { x: 1, y: 85, w: 6, h: 44, rx: 3 },
  sr: { x: 93, y: 85, w: 6, h: 44, rx: 3 },
};

function SingleJoyConShell({ activeButtons = [], direction }: { activeButtons: string[]; direction?: string }) {
  const isActive = (id: string) => activeButtons.includes(id);

  return (
    <div
      className="relative mx-auto w-full max-w-[140px] select-none"
      style={{ aspectRatio: "100 / 220" }}
      role="img"
      aria-label="Single Joy-Con controller layout"
    >
      {/* Body */}
      <div className={`absolute ${filled}`} style={{ left: pct(5, SW), top: pct(5, SH), width: pct(90, SW), height: pct(210, SH), borderRadius: "20px" }} />

      {/* Stick – outer ring */}
      <div className={`absolute rounded-full ${outline}`} style={{ left: pct(50 - 16, SW), top: pct(50 - 16, SH), width: pct(32, SW), height: pct(32, SH) }} />

      {/* Interactive buttons */}
      {Object.entries(singleButtons).map(([id, pos]) => {
        const on = isActive(id);
        const isCircle = "cx" in pos;

        if (isCircle) {
          const { cx, cy, r } = pos;
          return (
            <div
              key={id}
              data-button-id={id}
              className={`absolute rounded-full flex items-center justify-center transition-colors duration-150 pointer-events-none ${on ? active : cap}`}
              style={{ left: pct(cx - r, SW), top: pct(cy - r, SH), width: pct(r * 2, SW), height: pct(r * 2, SH) }}
              aria-label={`${id} button${on ? " (active)" : ""}`}
            >
              {faceButtonIds.has(id) && (
                <span className={`select-none leading-none font-semibold text-[10px] ${on ? "text-background" : "text-muted/50"}`}>
                  {faceLabels[id]}
                </span>
              )}
            </div>
          );
        }

        const { x, y, w, h, rx } = pos;
        return (
          <div
            key={id}
            data-button-id={id}
            className={`absolute flex items-center justify-center transition-colors duration-150 pointer-events-none ${on ? active : outline}`}
            style={{ left: pct(x, SW), top: pct(y, SH), width: pct(w, SW), height: pct(h, SH), borderRadius: `${rx}px` }}
            aria-label={`${id} button${on ? " (active)" : ""}`}
          />
        );
      })}

      {/* Direction indicator on stick */}
      {direction && directionAngles[direction] !== undefined && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: pct(50, SW),
            top: pct(50, SH),
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg viewBox="0 0 40 40" className="w-6 h-6" style={{ transform: `rotate(${directionAngles[direction]}deg)` }}>
            <polygon points="20,4 28,18 12,18" fill="#38bdf8" opacity="0.9" />
          </svg>
        </div>
      )}
    </div>
  );
}

export default function ControllerShell({ mode, activeButtons = [], direction }: ControllerShellProps) {
  if (mode === "single-joycon") {
    return <SingleJoyConShell activeButtons={activeButtons} direction={direction} />;
  }
  return <HandheldShell activeButtons={activeButtons} direction={direction} />;
}
