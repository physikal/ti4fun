import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useGameStore } from "src/store/gameStore";
import type { GameLogEntry } from "src/store/types";

interface GameLogPanelProps {
  open: boolean;
  onClose: () => void;
}

const PHASE_COLORS: Record<string, string> = {
  INIT: "text-gray-400",
  GALAXY: "text-purple-400",
  STRATEGY: "text-yellow-400",
  ACTION: "text-red-400",
  STATUS: "text-green-400",
  AGENDA: "text-blue-400",
  END: "text-gray-400",
};

function formatRelativeTime(timestamp: number): string {
  const delta = Math.floor((Date.now() - timestamp) / 1000);
  if (delta < 60) return "just now";
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 86400) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 86400)}d ago`;
}

function LogEntry({
  entry,
  onRewind,
}: {
  entry: GameLogEntry;
  onRewind: (id: number) => void;
}) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="px-3 py-2 border-b border-hud-border/10 hover:bg-white/5 transition-colors">
      <div className="flex items-center gap-2 text-xs mb-0.5">
        <span className="bg-white/10 rounded px-1.5 py-0.5 font-mono">
          R{entry.round}
        </span>
        <span className={PHASE_COLORS[entry.phase] ?? "text-gray-400"}>
          {entry.phase}
        </span>
        <span className="text-hud-muted ml-auto">
          {formatRelativeTime(entry.timestamp)}
        </span>
      </div>
      <div className="text-sm text-hud-text">{entry.description}</div>
      {confirming ? (
        <div className="flex gap-2 mt-1.5">
          <button
            onClick={() => onRewind(entry.id)}
            className="text-xs px-2 py-1 rounded bg-hud-accent/20 text-hud-accent hover:bg-hud-accent/30 transition-colors"
          >
            Confirm rewind
          </button>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs px-2 py-1 rounded text-hud-muted hover:text-hud-text transition-colors"
          >
            Cancel
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirming(true)}
          className="text-xs text-hud-muted hover:text-hud-accent mt-1 transition-colors"
        >
          Rewind here
        </button>
      )}
    </div>
  );
}

export function GameLogPanel({ open, onClose }: GameLogPanelProps) {
  const gameLog = useGameStore((s) => s.gameLog);
  const rewindToEntry = useGameStore((s) => s.rewindToEntry);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open, onClose]);

  function handleRewind(entryId: number) {
    rewindToEntry(entryId);
    onClose();
  }

  const reversed = [...gameLog].reverse();

  return createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black/40 transition-opacity z-[9998] ${
          open
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] hud-panel rounded-none z-[9999] flex flex-col transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-3 py-3 border-b border-hud-border/20">
          <h2 className="text-sm font-bold text-hud-accent">
            Game Log
          </h2>
          <span className="text-xs text-hud-muted">
            {gameLog.length} entries
          </span>
          <button
            onClick={onClose}
            className="text-hud-muted hover:text-hud-text text-xl leading-none w-8 h-8 flex items-center justify-center rounded hover:bg-white/5 transition-colors"
          >
            x
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {reversed.length === 0 ? (
            <p className="text-sm text-hud-muted text-center py-8">
              No actions yet
            </p>
          ) : (
            reversed.map((entry) => (
              <LogEntry
                key={entry.id}
                entry={entry}
                onRewind={handleRewind}
              />
            ))
          )}
        </div>
      </div>
    </>,
    document.body,
  );
}
