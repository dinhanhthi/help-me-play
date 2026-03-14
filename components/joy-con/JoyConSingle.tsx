import ControllerShell from "./ControllerShell";

interface JoyConSingleProps {
  activeButtons: string[];
  direction?: string;
}

export default function JoyConSingle({ activeButtons, direction }: JoyConSingleProps) {
  return <ControllerShell mode="single-joycon" activeButtons={activeButtons} direction={direction} />;
}
