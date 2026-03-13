interface ButtonHighlightProps {
  buttonId: string;
  active: boolean;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
    shape: "circle" | "rect" | "pill" | "dpad";
  };
  label: string;
}

export default function ButtonHighlight({
  buttonId,
  active,
  position,
  label,
}: ButtonHighlightProps) {
  const baseClasses =
    "absolute flex items-center justify-center transition-colors duration-150 pointer-events-none";

  const shapeClasses = (() => {
    switch (position.shape) {
      case "circle":
      case "pill":
        return "rounded-full";
      case "dpad":
      case "rect":
        return "rounded-sm";
    }
  })();

  const activeClasses = active
    ? "bg-accent z-10"
    : "";

  const showLabel = ["a", "b", "x", "y"].includes(buttonId);
  const minDim = Math.min(position.width, position.height);
  const fontSize = Math.max(7, Math.min(12, minDim * 1));

  return (
    <div
      data-button-id={buttonId}
      className={`${baseClasses} ${shapeClasses} ${activeClasses}`}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        width: `${position.width}%`,
        height: `${position.height}%`,
      }}
      aria-label={`${label} button${active ? " (active)" : ""}`}
    >
      {showLabel && (
        <span
          className={`select-none leading-none font-semibold ${active ? "text-background" : "text-muted/50"}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
