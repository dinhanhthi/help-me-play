import type { ControllerMode } from "@/lib/types";
import { Tooltip } from "@/components/ui/Tooltip";

interface ControllerShellProps {
  mode: ControllerMode;
  activeButtons?: string[];
  direction?: string;
  inputType?: string;
  /** Tooltip text shown on hover over active buttons */
  tooltip?: string;
}

/* ── Styles ── */
const outline = "border border-[#3a4560]";
const filled = "bg-[#1a1f2e] border border-[#2a3040]";
const capStyle = "bg-[#2a3348] border border-[#3a4560]";
const btnBase =
  "rounded-full flex items-center justify-center transition-colors duration-150 text-shadow-lg";

/** Color per input type */
export const inputTypeColors: Record<string, string> = {
  Tap: "#38bdf8", // sky blue
  Tilt: "#a78bfa", // violet
  Hold: "#f59e0b", // amber
  Smash: "#ef4444", // red
};
const defaultActiveColor = "#38bdf8";

function getActiveColor(inputType?: string) {
  return (inputType && inputTypeColors[inputType]) || defaultActiveColor;
}

const faceLabels: Record<string, string> = { a: "A", b: "B", x: "X", y: "Y" };

/** Direction arrow angles */
const directionAngles: Record<string, number> = {
  up: 0,
  right: 90,
  down: 180,
  left: 270,
};

/** A circular button that shows active state */
function Btn({
  id,
  active,
  label,
  color,
  tooltip,
  className = "",
}: {
  id: string;
  active: boolean;
  label?: string;
  color: string;
  tooltip?: string;
  className?: string;
}) {
  const el = (
    <div
      data-button-id={id}
      className={`${btnBase} ${active ? "" : `pointer-events-none ${capStyle}`} ${className}`}
      style={active ? { backgroundColor: color } : undefined}
      aria-label={`${label ?? id} button${active ? " (active)" : ""}`}
    >
      {label && (
        <span className="select-none leading-none font-semibold text-xs text-white">{label}</span>
      )}
    </div>
  );
  if (active && tooltip) return <Tooltip text={tooltip}>{el}</Tooltip>;
  return el;
}

/** Diamond layout for 4 buttons (face buttons or d-pad) */
function ButtonDiamond({
  ids,
  activeButtons,
  labels,
  color,
  tooltip,
}: {
  ids: { top: string; right: string; bottom: string; left: string };
  activeButtons: string[];
  labels?: Record<string, string>;
  color: string;
  tooltip?: string;
}) {
  const is = (id: string) => activeButtons.includes(id);
  return (
    <div
      className="grid grid-cols-3 grid-rows-3 place-items-center"
      style={{ width: 18 * 3, height: 18 * 3 }}
    >
      <div />
      <Btn
        id={ids.top}
        active={is(ids.top)}
        label={labels?.[ids.top]}
        color={color}
        tooltip={tooltip}
        className="w-5 h-5"
      />
      <div />
      <Btn
        id={ids.left}
        active={is(ids.left)}
        label={labels?.[ids.left]}
        color={color}
        tooltip={tooltip}
        className="w-5 h-5"
      />
      <div />
      <Btn
        id={ids.right}
        active={is(ids.right)}
        label={labels?.[ids.right]}
        color={color}
        tooltip={tooltip}
        className="w-5 h-5"
      />
      <div />
      <Btn
        id={ids.bottom}
        active={is(ids.bottom)}
        label={labels?.[ids.bottom]}
        color={color}
        tooltip={tooltip}
        className="w-5 h-5"
      />
      <div />
    </div>
  );
}

/** Stick with outer ring, inner cap, and optional direction highlight */
function Stick({
  id,
  active,
  direction,
  color,
  tooltip,
}: {
  id: string;
  active: boolean;
  direction?: string;
  color: string;
  tooltip?: string;
}) {
  const angle = direction ? directionAngles[direction] : undefined;
  const bg =
    angle !== undefined
      ? `conic-gradient(from ${angle - 60}deg, ${color} 0deg, ${color} 120deg, transparent 120deg), #2a3348`
      : undefined;
  const showTooltip = (active || bg) && tooltip;
  const inner = (
    <div
      data-button-id={id}
      className={`rounded-full ${btnBase} ${capStyle}`}
      style={{
        width: 26,
        height: 26,
        ...(bg ? { background: bg } : active ? { backgroundColor: color } : {}),
      }}
      aria-label={`${id}${active ? " (active)" : ""}`}
    />
  );
  return (
    <div
      className={`rounded-full ${outline} flex items-center justify-center`}
      style={{ width: 44, height: 44 }}
    >
      {showTooltip ? <Tooltip text={tooltip!}>{inner}</Tooltip> : inner}
    </div>
  );
}

/** Capsule-shaped shoulder/trigger button */
function PillBtn({
  id,
  active,
  color,
  tooltip,
  className = "",
}: {
  id: string;
  active: boolean;
  color: string;
  tooltip?: string;
  className?: string;
}) {
  const el = (
    <div
      data-button-id={id}
      className={`rounded-full transition-colors duration-150 ${active ? "" : outline} ${className}`}
      style={active ? { backgroundColor: color } : { backgroundColor: "#2a3348" }}
      aria-label={`${id} button${active ? " (active)" : ""}`}
    />
  );
  if (active && tooltip) return <Tooltip text={tooltip}>{el}</Tooltip>;
  return el;
}

function HandheldShell({
  activeButtons = [],
  direction,
  color,
  tooltip,
}: {
  activeButtons: string[];
  direction?: string;
  color: string;
  tooltip?: string;
}) {
  const is = (id: string) => activeButtons.includes(id);
  const leftStickDir = is("left-stick") ? direction : undefined;
  const rightStickDir = is("right-stick") ? direction : undefined;
  return (
    <div
      className="mx-auto select-none flex gap-3"
      role="img"
      aria-label="Nintendo Switch controller layout"
    >
      {/* Left Joy-Con */}
      <div className="flex flex-col gap-1 items-center justify-center h-full">
        {/* ZL + L */}
        <div className="flex items-center flex-col gap-0.5 w-full">
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-xs text-muted font-semibold">ZL</span>
            <PillBtn
              id="zl"
              active={is("zl")}
              color={color}
              tooltip={tooltip}
              className="flex-1 h-3.5 rounded-t-4xl rounded-b-xl"
            />
          </div>
          <div className="flex items-center gap-1.5 w-full">
            <span className="text-xs text-muted font-semibold">L</span>
            <PillBtn
              id="l"
              active={is("l")}
              color={color}
              tooltip={tooltip}
              className="flex-1 h-3"
            />
          </div>
        </div>
        {/* Joy-Con body */}
        <div className={`rounded-full ${filled} flex flex-col items-center gap-3 px-1.5 py-3`}>
          <Stick
            id="left-stick"
            active={is("left-stick")}
            direction={leftStickDir}
            color={color}
            tooltip={tooltip}
          />
          <ButtonDiamond
            ids={{ top: "dpad-up", right: "dpad-right", bottom: "dpad-down", left: "dpad-left" }}
            activeButtons={activeButtons}
            color={color}
            tooltip={tooltip}
          />
        </div>
      </div>

      {/* Right Joy-Con */}
      <div className="flex flex-col gap-1 items-center justify-center h-full">
        {/* ZR + R */}
        <div className="flex items-center flex-col gap-0.5 w-full">
          <div className="flex items-center gap-1.5 w-full">
            <PillBtn
              id="zr"
              active={is("zr")}
              color={color}
              tooltip={tooltip}
              className="flex-1 h-3.5 rounded-t-4xl rounded-b-xl"
            />
            <span className="text-xs text-muted font-semibold">ZR</span>
          </div>
          <div className="flex items-center gap-1.5 w-full">
            <PillBtn
              id="r"
              active={is("r")}
              color={color}
              tooltip={tooltip}
              className="flex-1 h-3"
            />
            <span className="text-xs text-muted font-semibold">R</span>
          </div>
        </div>

        {/* Joy-Con body */}
        <div className={`rounded-[48px] ${filled} flex flex-col items-center gap-3 px-2 py-3`}>
          <ButtonDiamond
            ids={{ top: "x", right: "a", bottom: "b", left: "y" }}
            activeButtons={activeButtons}
            labels={faceLabels}
            color={color}
            tooltip={tooltip}
          />
          <Stick
            id="right-stick"
            active={is("right-stick")}
            direction={rightStickDir}
            color={color}
            tooltip={tooltip}
          />
        </div>
      </div>
    </div>
  );
}

function SingleJoyConShell({
  activeButtons = [],
  direction,
  color,
  tooltip,
}: {
  activeButtons: string[];
  direction?: string;
  color: string;
  tooltip?: string;
}) {
  const is = (id: string) => activeButtons.includes(id);

  return (
    <div
      className="mx-auto select-none flex flex-col items-center gap-2"
      role="img"
      aria-label="Single Joy-Con controller layout"
    >
      {/* SL + SR */}
      <div className="flex w-full items-center gap-1">
        <span className="text-xs text-muted font-semibold">SL</span>
        <PillBtn
          id="sl"
          active={is("sl")}
          color={color}
          tooltip={tooltip}
          className="flex-1 h-3.5"
        />
        <PillBtn
          id="sr"
          active={is("sr")}
          color={color}
          tooltip={tooltip}
          className="flex-1 h-3.5"
        />
        <span className="text-xs text-muted font-semibold">SR</span>
      </div>
      {/* Body – horizontal: stick left, face buttons right */}
      <div className={`rounded-full ${filled} flex items-center gap-3 px-4 py-2`}>
        <Stick
          id="stick"
          active={is("stick")}
          direction={direction}
          color={color}
          tooltip={tooltip}
        />
        <ButtonDiamond
          ids={{ top: "x", right: "a", bottom: "b", left: "y" }}
          activeButtons={activeButtons}
          color={color}
          tooltip={tooltip}
        />
      </div>
    </div>
  );
}

export default function ControllerShell({
  mode,
  activeButtons = [],
  direction,
  inputType,
  tooltip,
}: ControllerShellProps) {
  const color = getActiveColor(inputType);
  if (mode === "single-joycon") {
    return (
      <SingleJoyConShell
        activeButtons={activeButtons}
        direction={direction}
        color={color}
        tooltip={tooltip}
      />
    );
  }
  return (
    <HandheldShell
      activeButtons={activeButtons}
      direction={direction}
      color={color}
      tooltip={tooltip}
    />
  );
}
