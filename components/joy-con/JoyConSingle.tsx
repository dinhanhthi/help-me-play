import ControllerShell from "./ControllerShell";
import ButtonHighlight from "./ButtonHighlight";
import { singleJoyconPositions } from "@/lib/button-positions";
import { getButtonsForMode } from "@/lib/button-labels";

interface JoyConSingleProps {
  activeButtons: string[];
  direction?: string;
}

/** Map direction strings to arrow rotation angles (degrees). */
const directionAngles: Record<string, number> = {
  up: 0,
  right: 90,
  down: 180,
  left: 270,
};

export default function JoyConSingle({ activeButtons, direction }: JoyConSingleProps) {
  const buttons = getButtonsForMode("single-joycon");

  return (
    <div className="relative w-full max-w-[160px] mx-auto select-none">
      <ControllerShell mode="single-joycon" />

      {/* Button highlight overlays */}
      <div className="absolute inset-0">
        {buttons.map((button) => {
          const pos = singleJoyconPositions[button.id];
          if (!pos) return null;

          return (
            <ButtonHighlight
              key={button.id}
              buttonId={button.id}
              active={activeButtons.includes(button.id)}
              position={pos}
              label={button.label}
            />
          );
        })}
      </div>

      {/* Direction indicator on stick */}
      {direction && directionAngles[direction] !== undefined && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${singleJoyconPositions["stick"].x + singleJoyconPositions["stick"].width / 2}%`,
            top: `${singleJoyconPositions["stick"].y + singleJoyconPositions["stick"].height / 2}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg
            viewBox="0 0 40 40"
            className="w-6 h-6"
            style={{
              transform: `rotate(${directionAngles[direction]}deg)`,
            }}
          >
            <polygon points="20,4 28,18 12,18" fill="#38bdf8" opacity="0.9" />
          </svg>
        </div>
      )}
    </div>
  );
}
