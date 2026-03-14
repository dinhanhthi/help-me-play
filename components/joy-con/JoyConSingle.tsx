import ControllerShell from "./ControllerShell";

interface JoyConSingleProps {
  activeButtons: string[];
  direction?: string;
  inputType?: string;
  tooltip?: string;
}

export default function JoyConSingle({ activeButtons, direction, inputType, tooltip }: JoyConSingleProps) {
  return <ControllerShell mode="single-joycon" activeButtons={activeButtons} direction={direction} inputType={inputType} tooltip={tooltip} />;
}
