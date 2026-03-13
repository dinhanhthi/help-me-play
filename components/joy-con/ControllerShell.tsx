import type { ControllerMode } from "@/lib/types";

interface ControllerShellProps {
  mode: ControllerMode;
}

function HandheldShell() {
  return (
    <svg
      viewBox="0 0 300 200"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto"
      role="img"
      aria-label="Nintendo Switch controller layout"
    >
      {/* Left group */}
      <rect x="5" y="5" width="135" height="190" rx="20" fill="#1a1f2e" stroke="#2a3040" strokeWidth="1.5" />
      {/* Right group */}
      <rect x="160" y="5" width="135" height="190" rx="20" fill="#1a1f2e" stroke="#2a3040" strokeWidth="1.5" />

      {/* Left Stick */}
      <circle cx="55" cy="60" r="18" fill="none" stroke="#2a3040" strokeWidth="1.5" />
      <circle cx="55" cy="60" r="10" fill="#222838" />

      {/* D-Pad */}
      <rect x="40" y="107" width="12" height="34" rx="3" fill="none" stroke="#2a3040" strokeWidth="1.5" />
      <rect x="29" y="118" width="34" height="12" rx="3" fill="none" stroke="#2a3040" strokeWidth="1.5" />

      {/* Minus */}
      <rect x="99" y="39" width="18" height="5" rx="2.5" fill="#222838" />

      {/* Capture */}
      <rect x="43" y="159" width="14" height="14" rx="4" fill="none" stroke="#2a3040" strokeWidth="1.5" />

      {/* L */}
      <rect x="18" y="1" width="68" height="9" rx="4.5" fill="none" stroke="#2a3040" strokeWidth="1.5" />

      {/* X/A/B/Y */}
      <circle cx="228" cy="58" r="12" fill="none" stroke="#2a3040" strokeWidth="1.5" />
      <circle cx="252" cy="82" r="12" fill="none" stroke="#2a3040" strokeWidth="1.5" />
      <circle cx="228" cy="106" r="12" fill="none" stroke="#2a3040" strokeWidth="1.5" />
      <circle cx="204" cy="82" r="12" fill="none" stroke="#2a3040" strokeWidth="1.5" />

      {/* Right Stick */}
      <circle cx="235" cy="152" r="16" fill="none" stroke="#2a3040" strokeWidth="1.5" />
      <circle cx="235" cy="152" r="8" fill="#222838" />

      {/* Plus */}
      <rect x="182" y="36" width="18" height="5" rx="2.5" fill="#222838" />
      <rect x="189" y="29" width="5" height="19" rx="2.5" fill="#222838" />

      {/* Home */}
      <circle cx="270" cy="170" r="7" fill="none" stroke="#2a3040" strokeWidth="1.5" />

      {/* R */}
      <rect x="214" y="1" width="68" height="9" rx="4.5" fill="none" stroke="#2a3040" strokeWidth="1.5" />
    </svg>
  );
}

function SingleJoyConShell() {
  return (
    <svg
      viewBox="0 0 100 260"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-auto max-w-[140px] mx-auto"
      role="img"
      aria-label="Single Joy-Con controller layout"
    >
      <rect x="5" y="5" width="90" height="250" rx="20" fill="#1a1f2e" stroke="#2a3040" strokeWidth="1.5" />

      {/* Stick */}
      <circle cx="50" cy="52" r="16" fill="none" stroke="#2a3040" strokeWidth="1.5" />
      <circle cx="50" cy="52" r="8" fill="#222838" />

      {/* X/A/B/Y */}
      <circle cx="50" cy="112" r="12" fill="none" stroke="#2a3040" strokeWidth="1.5" />
      <circle cx="74" cy="136" r="12" fill="none" stroke="#2a3040" strokeWidth="1.5" />
      <circle cx="50" cy="160" r="12" fill="none" stroke="#2a3040" strokeWidth="1.5" />
      <circle cx="26" cy="136" r="12" fill="none" stroke="#2a3040" strokeWidth="1.5" />

      {/* SL / SR */}
      <rect x="1" y="92" width="6" height="44" rx="3" fill="none" stroke="#2a3040" strokeWidth="1.5" />
      <rect x="93" y="92" width="6" height="44" rx="3" fill="none" stroke="#2a3040" strokeWidth="1.5" />
    </svg>
  );
}

export default function ControllerShell({ mode }: ControllerShellProps) {
  if (mode === "single-joycon") {
    return <SingleJoyConShell />;
  }
  return <HandheldShell />;
}
