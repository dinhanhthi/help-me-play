import type { ControllerMode } from "@/lib/types";

interface ControllerShellProps {
  mode: ControllerMode;
  activeButtons?: string[];
  direction?: string;
  inputType?: string;
  /** Tooltip text shown on hover over active buttons */
  tooltip?: string;
}

/* ── Styles ── */
const outline = "border border-[#2a3040]";
const filled = "bg-[#1a1f2e] border border-[#2a3040]";
const capStyle = "bg-[#222838] border border-[#2a3040]";
const btnBase = "rounded-full flex items-center justify-center transition-colors duration-150";

/** Color per input type */
export const inputTypeColors: Record<string, string> = {
  Tap: "#38bdf8",   // sky blue
  Hold: "#f59e0b",  // amber
  Smash: "#ef4444", // red
};
const defaultActiveColor = "#38bdf8";

function getActiveColor(inputType?: string) {
  return (inputType && inputTypeColors[inputType]) || defaultActiveColor;
}

const faceLabels: Record<string, string> = { a: "A", b: "B", x: "X", y: "Y" };

/** Direction arrow angles */
const directionAngles: Record<string, number> = {
  up: 0, right: 90, down: 180, left: 270,
};

/** Tooltip bubble shown on hover */
function Tooltip({ text }: { text: string }) {
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden w-max max-w-[180px] rounded-lg bg-surface border border-border px-3 py-2 text-xs text-foreground shadow-lg group-hover:block z-20">
      {text}
    </div>
  );
}

/** A circular button that shows active state */
function Btn({ id, active, label, color, tooltip, className = "" }: { id: string; active: boolean; label?: string; color: string; tooltip?: string; className?: string }) {
  return (
    <div
      data-button-id={id}
      className={`relative ${active && tooltip ? "group" : ""} ${btnBase} ${active ? "" : `pointer-events-none ${capStyle}`} ${className}`}
      style={active ? { backgroundColor: color } : undefined}
      aria-label={`${label ?? id} button${active ? " (active)" : ""}`}
    >
      {label && (
        <span className={`select-none leading-none font-semibold text-[10px] ${active ? "text-white" : "text-muted/50"}`}>
          {label}
        </span>
      )}
      {active && tooltip && <Tooltip text={tooltip} />}
    </div>
  );
}

/** A pill-shaped button (triggers/shoulders) */
function PillBtn({ id, active, color, tooltip, className = "" }: { id: string; active: boolean; color: string; tooltip?: string; className?: string }) {
  return (
    <div
      data-button-id={id}
      className={`relative ${active && tooltip ? "group" : ""} rounded-full transition-colors duration-150 ${active ? "" : `pointer-events-none ${outline}`} ${className}`}
      style={active ? { backgroundColor: color } : undefined}
      aria-label={`${id} button${active ? " (active)" : ""}`}
    >
      {active && tooltip && <Tooltip text={tooltip} />}
    </div>
  );
}

/** Diamond layout for 4 buttons (face buttons or d-pad) */
function ButtonDiamond({ ids, activeButtons, labels, color, tooltip }: {
  ids: { top: string; right: string; bottom: string; left: string };
  activeButtons: string[];
  labels?: Record<string, string>;
  color: string;
  tooltip?: string;
}) {
  const is = (id: string) => activeButtons.includes(id);
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-full aspect-square">
      <div />
      <Btn id={ids.top} active={is(ids.top)} label={labels?.[ids.top]} color={color} tooltip={tooltip} className="w-full h-full" />
      <div />
      <Btn id={ids.left} active={is(ids.left)} label={labels?.[ids.left]} color={color} tooltip={tooltip} className="w-full h-full" />
      <div />
      <Btn id={ids.right} active={is(ids.right)} label={labels?.[ids.right]} color={color} tooltip={tooltip} className="w-full h-full" />
      <div />
      <Btn id={ids.bottom} active={is(ids.bottom)} label={labels?.[ids.bottom]} color={color} tooltip={tooltip} className="w-full h-full" />
      <div />
    </div>
  );
}

/** Stick with outer ring, inner cap, and optional direction highlight */
function Stick({ id, active, direction, color, tooltip, size = "lg" }: {
  id: string;
  active: boolean;
  direction?: string;
  color: string;
  tooltip?: string;
  size?: "lg" | "sm";
}) {
  const outer = size === "lg" ? "w-full" : "w-3/4 mx-auto";
  const angle = direction ? directionAngles[direction] : undefined;
  const bg = angle !== undefined
    ? `conic-gradient(from ${angle - 60}deg, ${color} 0deg, ${color} 120deg, transparent 120deg), #222838`
    : undefined;
  const showTooltip = (active || bg) && tooltip;
  return (
    <div className={`${outer} aspect-square rounded-full ${outline} flex items-center justify-center`}>
      <div
        data-button-id={id}
        className={`relative ${showTooltip ? "group" : ""} w-1/2 aspect-square rounded-full ${btnBase} ${capStyle}`}
        style={active ? { backgroundColor: color } : bg ? { background: bg } : undefined}
        aria-label={`${id}${active ? " (active)" : ""}`}
      >
        {showTooltip && <Tooltip text={tooltip!} />}
      </div>
    </div>
  );
}

function HandheldShell({ activeButtons = [], direction, color, tooltip }: { activeButtons: string[]; direction?: string; color: string; tooltip?: string }) {
  const is = (id: string) => activeButtons.includes(id);

  return (
    <div
      className="mx-auto w-full max-w-[258px] select-none flex gap-3"
      role="img"
      aria-label="Nintendo Switch controller layout"
    >
      {/* Left Joy-Con */}
      <div className="flex-1 flex flex-col items-center gap-2">
        {/* ZL + L */}
        <div className="w-full flex flex-col gap-1">
          <PillBtn id="zl" active={is("zl")} color={color} tooltip={tooltip} className="w-full h-5 rounded-full" />
          <PillBtn id="l" active={is("l")} color={color} tooltip={tooltip} className="w-full h-4 rounded-full" />
        </div>
        {/* Joy-Con body */}
        <div className={`w-full rounded-[48px] ${filled} flex flex-col items-center gap-3 px-3 py-5`}>
          {/* Left Stick */}
          <div className="w-[60%]">
            <Stick id="left-stick" active={is("left-stick")} direction={direction} color={color} tooltip={tooltip} size="lg" />
          </div>
          {/* D-Pad */}
          <div className="w-[85%]">
            <ButtonDiamond
              ids={{ top: "dpad-up", right: "dpad-right", bottom: "dpad-down", left: "dpad-left" }}
              activeButtons={activeButtons}
              color={color}
              tooltip={tooltip}
            />
          </div>
        </div>
      </div>

      {/* Right Joy-Con */}
      <div className="flex-1 flex flex-col items-center gap-2">
        {/* ZR + R */}
        <div className="w-full flex flex-col gap-1">
          <PillBtn id="zr" active={is("zr")} color={color} tooltip={tooltip} className="w-full h-5 rounded-full" />
          <PillBtn id="r" active={is("r")} color={color} tooltip={tooltip} className="w-full h-4 rounded-full" />
        </div>
        {/* Joy-Con body */}
        <div className={`w-full rounded-[48px] ${filled} flex flex-col items-center gap-3 px-3 py-5`}>
          {/* Face buttons */}
          <div className="w-[85%]">
            <ButtonDiamond
              ids={{ top: "x", right: "a", bottom: "b", left: "y" }}
              activeButtons={activeButtons}
              labels={faceLabels}
              color={color}
              tooltip={tooltip}
            />
          </div>
          {/* Right Stick */}
          <div className="w-[60%]">
            <Stick id="right-stick" active={is("right-stick")} color={color} tooltip={tooltip} size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SingleJoyConShell({ activeButtons = [], direction, color, tooltip }: { activeButtons: string[]; direction?: string; color: string; tooltip?: string }) {
  const is = (id: string) => activeButtons.includes(id);

  return (
    <div
      className="mx-auto w-full max-w-[258px] select-none flex flex-col items-center gap-2"
      role="img"
      aria-label="Single Joy-Con controller layout"
    >
      {/* SL + SR */}
      <div className="w-full flex gap-2">
        <PillBtn id="sl" active={is("sl")} color={color} tooltip={tooltip} className="flex-1 h-5 rounded-full" />
        <PillBtn id="sr" active={is("sr")} color={color} tooltip={tooltip} className="flex-1 h-5 rounded-full" />
      </div>
      {/* Body – horizontal: stick left, face buttons right */}
      <div className={`w-full rounded-[48px] ${filled} flex items-center gap-3 px-5 py-4`}>
        {/* Stick */}
        <div className="w-[40%]">
          <Stick id="stick" active={is("stick")} direction={direction} color={color} tooltip={tooltip} size="lg" />
        </div>
        {/* Face buttons – no labels */}
        <div className="w-[45%]">
          <ButtonDiamond
            ids={{ top: "x", right: "a", bottom: "b", left: "y" }}
            activeButtons={activeButtons}
            color={color}
            tooltip={tooltip}
          />
        </div>
      </div>
    </div>
  );
}

export default function ControllerShell({ mode, activeButtons = [], direction, inputType, tooltip }: ControllerShellProps) {
  const color = getActiveColor(inputType);
  if (mode === "single-joycon") {
    return <SingleJoyConShell activeButtons={activeButtons} direction={direction} color={color} tooltip={tooltip} />;
  }
  return <HandheldShell activeButtons={activeButtons} direction={direction} color={color} tooltip={tooltip} />;
}
