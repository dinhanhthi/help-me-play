import ControllerShell from "./ControllerShell";

interface JoyConHandheldProps {
  activeButtons: string[];
  direction?: string;
}

export default function JoyConHandheld({ activeButtons, direction }: JoyConHandheldProps) {
  return <ControllerShell mode="handheld" activeButtons={activeButtons} direction={direction} />;
}
