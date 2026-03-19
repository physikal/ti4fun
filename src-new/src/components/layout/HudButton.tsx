import type { ButtonHTMLAttributes, ReactNode } from "react";

interface HudButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "danger" | "accent";
  size?: "sm" | "md" | "lg";
}

const variantStyles: Record<string, string> = {
  default: "",
  danger:
    "border-hud-danger/60 text-hud-danger hover:border-hud-danger hover:bg-hud-danger/10",
  accent:
    "border-hud-accent/60 text-hud-accent hover:border-hud-accent hover:bg-hud-accent/10",
};

const sizeStyles: Record<string, string> = {
  sm: "text-xs px-2.5 py-1.5 min-h-[32px] min-w-[32px]",
  md: "",
  lg: "text-base px-5 py-2.5",
};

export function HudButton({
  children,
  variant = "default",
  size = "md",
  disabled,
  className = "",
  ...props
}: HudButtonProps) {
  return (
    <button
      className={`hud-btn hover:hud-btn-hover active:hud-btn-active ${
        disabled ? "hud-btn-disabled" : ""
      } ${variantStyles[variant] ?? ""} ${sizeStyles[size] ?? ""} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
