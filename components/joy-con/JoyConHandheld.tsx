import ControllerShell from "./ControllerShell";

interface JoyConHandheldProps {
  activeButtons: string[];
  direction?: string;
  inputType?: string;
  buttonInputTypes?: Record<string, string>;
  tooltip?: string;
  buttonTooltips?: Record<string, string>;
}

export default function JoyConHandheld({
  activeButtons,
  direction,
  inputType,
  buttonInputTypes,
  tooltip,
  buttonTooltips,
}: JoyConHandheldProps) {
  return (
    <ControllerShell
      mode="handheld"
      activeButtons={activeButtons}
      direction={direction}
      inputType={inputType}
      buttonInputTypes={buttonInputTypes}
      tooltip={tooltip}
      buttonTooltips={buttonTooltips}
    />
  );
}
