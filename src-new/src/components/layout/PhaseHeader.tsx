import { useState } from "react";
import { useGameStore } from "src/store/gameStore";
import { t } from "src/i18n/index";
import { formatTime } from "src/hooks/useTimer";
import { GameMenu } from "src/components/layout/GameMenu";
import { GameLogPanel } from "src/components/layout/GameLogPanel";

interface PhaseHeaderProps {
  onBack?: () => void;
}

export function PhaseHeader({ onBack }: PhaseHeaderProps) {
  const [logOpen, setLogOpen] = useState(false);
  const locale = useGameStore((s) => s.locale);
  const phase = useGameStore((s) => s.phase);
  const round = useGameStore((s) => s.round);
  const gameElapsedSec = useGameStore((s) => s.gameElapsedSec);
  const clockRunning = useGameStore((s) => s.clockRunning);
  const toggleClock = useGameStore((s) => s.toggleClock);

  const phaseLabel = (() => {
    switch (phase) {
      case "GALAXY":
        return t("phaseGalaxy", locale);
      case "STRATEGY":
        return t("phaseStrategy", locale);
      case "ACTION":
        return t("phaseAction", locale);
      case "STATUS":
        return t("phaseStatus", locale);
      case "AGENDA":
        return t("phaseAgenda", locale);
      case "END":
        return t("phaseEnd", locale);
      default:
        return "";
    }
  })();

  if (phase === "INIT") return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 hud-panel rounded-none rounded-b-lg shrink-0">
      {onBack && (
        <button
          onClick={onBack}
          className="text-sm text-hud-muted hover:text-hud-text transition-colors px-2 py-1 -ml-1"
        >
          ← {t("back", locale)}
        </button>
      )}
      <div className="flex-1 flex items-center justify-center gap-3">
        <span className="text-xs text-hud-muted">
          {t("round", locale)} {round}
        </span>
        <span className="text-sm font-bold text-hud-accent">
          {phaseLabel}
        </span>
      </div>
      <button
        onClick={toggleClock}
        className="text-sm font-mono text-hud-text hover:text-hud-accent transition-colors"
      >
        {clockRunning ? formatTime(gameElapsedSec) : "\u2014Pause\u2014"}
      </button>
      <button
        onClick={() => setLogOpen(true)}
        className="w-8 h-8 flex items-center justify-center rounded-md text-hud-muted hover:text-hud-text transition-colors"
        aria-label="Game log"
      >
        <RewindIcon />
      </button>
      <GameMenu />
      <GameLogPanel
        open={logOpen}
        onClose={() => setLogOpen(false)}
      />
    </div>
  );
}

function RewindIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}
