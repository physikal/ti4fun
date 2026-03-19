import type { ReactNode } from "react";

interface HudPanelProps {
  children: ReactNode;
  className?: string;
  glow?: boolean;
}

export function HudPanel({
  children,
  className = "",
  glow = false,
}: HudPanelProps) {
  return (
    <div
      className={`hud-panel p-4 ${glow ? "hud-glow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
