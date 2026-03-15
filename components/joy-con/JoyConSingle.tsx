import ControllerShell from "./ControllerShell";

interface JoyConSingleProps {
  activeButtons: string[];
  direction?: string;
  inputType?: string;
  buttonInputTypes?: Record<string, string>;
  tooltip?: string;
  buttonTooltips?: Record<string, string>;
}

export default function JoyConSingle({
  activeButtons,
  direction,
  inputType,
  buttonInputTypes,
  tooltip,
  buttonTooltips,
}: JoyConSingleProps) {
  return (
    <ControllerShell
      mode="single-joycon"
      activeButtons={activeButtons}
      direction={direction}
      inputType={inputType}
      buttonInputTypes={buttonInputTypes}
      tooltip={tooltip}
      buttonTooltips={buttonTooltips}
    />
  );
}
