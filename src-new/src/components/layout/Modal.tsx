import type { ReactNode } from "react";

interface ModalProps {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="hud-panel p-5 w-full max-w-md max-h-[85vh] overflow-y-auto screen-fade-in">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-hud-accent">
              {title}
            </h2>
            {onClose && (
              <button
                onClick={onClose}
                className="text-hud-muted hover:text-hud-text text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-white/5 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
