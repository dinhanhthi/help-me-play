import ControllerShell from "./ControllerShell";
import ButtonHighlight from "./ButtonHighlight";
import { handheldPositions } from "@/lib/button-positions";
import { getButtonsForMode } from "@/lib/button-labels";

interface JoyConHandheldProps {
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

export default function JoyConHandheld({ activeButtons, direction }: JoyConHandheldProps) {
  const buttons = getButtonsForMode("handheld");

  return (
    <div className="relative w-full max-w-md mx-auto select-none">
      <ControllerShell mode="handheld" />

      {/* Button highlight overlays */}
      <div className="absolute inset-0">
        {buttons.map((button) => {
          const pos = handheldPositions[button.id];
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

      {/* Direction indicator on left stick */}
      {direction && directionAngles[direction] !== undefined && (
        <div
          className="absolute pointer-events-none"
          style={{
            left: `${handheldPositions["left-stick"].x + handheldPositions["left-stick"].width / 2}%`,
            top: `${handheldPositions["left-stick"].y + handheldPositions["left-stick"].height / 2}%`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg
            viewBox="0 0 40 40"
            className="w-8 h-8"
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
