import type { ControllerMode } from "@/lib/types";

interface ControllerShellProps {
  mode: ControllerMode;
  activeButtons?: string[];
  direction?: string;
}

/* ── Styles ── */
const outline = "border border-[#2a3040]";
const filled = "bg-[#1a1f2e] border border-[#2a3040]";
const capStyle = "bg-[#222838] border border-[#2a3040]";
const activeStyle = "bg-accent";
const btnBase = "rounded-full flex items-center justify-center transition-colors duration-150 pointer-events-none";

const faceLabels: Record<string, string> = { a: "A", b: "B", x: "X", y: "Y" };

/** Direction arrow angles */
const directionAngles: Record<string, number> = {
  up: 0, right: 90, down: 180, left: 270,
};

/** A circular button that shows active state */
function Btn({ id, active, label, className = "" }: { id: string; active: boolean; label?: string; className?: string }) {
  return (
    <div
      data-button-id={id}
      className={`${btnBase} ${active ? activeStyle : capStyle} ${className}`}
      aria-label={`${label ?? id} button${active ? " (active)" : ""}`}
    >
      {label && (
        <span className={`select-none leading-none font-semibold text-[10px] ${active ? "text-background" : "text-muted/50"}`}>
          {label}
        </span>
      )}
    </div>
  );
}

/** A pill-shaped button (triggers/shoulders) */
function PillBtn({ id, active, className = "" }: { id: string; active: boolean; className?: string }) {
  return (
    <div
      data-button-id={id}
      className={`rounded-full transition-colors duration-150 pointer-events-none ${active ? activeStyle : outline} ${className}`}
      aria-label={`${id} button${active ? " (active)" : ""}`}
    />
  );
}

/** Diamond layout for 4 buttons (face buttons or d-pad) */
function ButtonDiamond({ ids, activeButtons, labels }: {
  ids: { top: string; right: string; bottom: string; left: string };
  activeButtons: string[];
  labels?: Record<string, string>;
}) {
  const is = (id: string) => activeButtons.includes(id);
  return (
    <div className="grid grid-cols-3 grid-rows-3 gap-0.5 w-full aspect-square">
      <div />
      <Btn id={ids.top} active={is(ids.top)} label={labels?.[ids.top]} className="w-full h-full" />
      <div />
      <Btn id={ids.left} active={is(ids.left)} label={labels?.[ids.left]} className="w-full h-full" />
      <div />
      <Btn id={ids.right} active={is(ids.right)} label={labels?.[ids.right]} className="w-full h-full" />
      <div />
      <Btn id={ids.bottom} active={is(ids.bottom)} label={labels?.[ids.bottom]} className="w-full h-full" />
      <div />
    </div>
  );
}

/** Stick with outer ring, inner cap, and optional direction arrow */
function Stick({ id, active, direction, size = "lg" }: {
  id: string;
  active: boolean;
  direction?: string;
  size?: "lg" | "sm";
}) {
  const outer = size === "lg" ? "w-full" : "w-3/4 mx-auto";
  const angle = direction ? directionAngles[direction] : undefined;
  const bg = angle !== undefined
    ? `conic-gradient(from ${angle - 60}deg, #38bdf8 0deg, #38bdf8 120deg, transparent 120deg), #222838`
    : undefined;
  return (
    <div className={`${outer} aspect-square rounded-full ${outline} flex items-center justify-center`}>
      <div
        data-button-id={id}
        className={`w-1/2 aspect-square rounded-full ${btnBase} ${active ? activeStyle : capStyle}`}
        style={bg ? { background: bg } : undefined}
        aria-label={`${id}${active ? " (active)" : ""}`}
      />
    </div>
  );
}

function HandheldShell({ activeButtons = [], direction }: { activeButtons: string[]; direction?: string }) {
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
          <PillBtn id="zl" active={is("zl")} className="w-full h-5 rounded-full" />
          <PillBtn id="l" active={is("l")} className="w-full h-4 rounded-full" />
        </div>
        {/* Joy-Con body */}
        <div className={`w-full rounded-[48px] ${filled} flex flex-col items-center gap-3 px-3 py-5`}>
          {/* Left Stick */}
          <div className="w-[60%]">
            <Stick id="left-stick" active={is("left-stick")} direction={direction} size="lg" />
          </div>
          {/* D-Pad */}
          <div className="w-[85%]">
            <ButtonDiamond
              ids={{ top: "dpad-up", right: "dpad-right", bottom: "dpad-down", left: "dpad-left" }}
              activeButtons={activeButtons}
            />
          </div>
        </div>
      </div>

      {/* Right Joy-Con */}
      <div className="flex-1 flex flex-col items-center gap-2">
        {/* ZR + R */}
        <div className="w-full flex flex-col gap-1">
          <PillBtn id="zr" active={is("zr")} className="w-full h-5 rounded-full" />
          <PillBtn id="r" active={is("r")} className="w-full h-4 rounded-full" />
        </div>
        {/* Joy-Con body */}
        <div className={`w-full rounded-[48px] ${filled} flex flex-col items-center gap-3 px-3 py-5`}>
          {/* Face buttons */}
          <div className="w-[85%]">
            <ButtonDiamond
              ids={{ top: "x", right: "a", bottom: "b", left: "y" }}
              activeButtons={activeButtons}
              labels={faceLabels}
            />
          </div>
          {/* Right Stick */}
          <div className="w-[60%]">
            <Stick id="right-stick" active={is("right-stick")} size="lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SingleJoyConShell({ activeButtons = [], direction }: { activeButtons: string[]; direction?: string }) {
  const is = (id: string) => activeButtons.includes(id);

  return (
    <div
      className="mx-auto w-full max-w-[140px] select-none"
      role="img"
      aria-label="Single Joy-Con controller layout"
    >
      <div className={`relative rounded-[24px] ${filled} flex flex-col items-center gap-3 px-3 py-5`}>
        {/* Stick */}
        <div className="w-[60%]">
          <Stick id="stick" active={is("stick")} direction={direction} size="sm" />
        </div>

        {/* Face buttons */}
        <div className="w-[80%]">
          <ButtonDiamond
            ids={{ top: "x", right: "a", bottom: "b", left: "y" }}
            activeButtons={activeButtons}
            labels={faceLabels}
          />
        </div>

        {/* SL / SR on the sides */}
        <PillBtn id="sl" active={is("sl")} className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-full" />
        <PillBtn id="sr" active={is("sr")} className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-10 rounded-full" />
      </div>
    </div>
  );
}

export default function ControllerShell({ mode, activeButtons = [], direction }: ControllerShellProps) {
  if (mode === "single-joycon") {
    return <SingleJoyConShell activeButtons={activeButtons} direction={direction} />;
  }
  return <HandheldShell activeButtons={activeButtons} direction={direction} />;
}
