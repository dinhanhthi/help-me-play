import ControllerShell from "./ControllerShell";

interface JoyConHandheldProps {
  activeButtons: string[];
  direction?: string;
  inputType?: string;
  tooltip?: string;
}

export default function JoyConHandheld({ activeButtons, direction, inputType, tooltip }: JoyConHandheldProps) {
  return <ControllerShell mode="handheld" activeButtons={activeButtons} direction={direction} inputType={inputType} tooltip={tooltip} />;
}
