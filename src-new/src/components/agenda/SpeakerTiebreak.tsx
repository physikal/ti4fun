import { useGameStore } from "src/store/gameStore";
import { useAgendaStore } from "src/store/agendaStore";
import { HudPanel } from "src/components/layout/HudPanel";
import { HudButton } from "src/components/layout/HudButton";
import { getPlayerDisplayName } from "src/store/selectors";

export function SpeakerTiebreak() {
  const players = useGameStore((s) => s.players);
  const speakerId = useGameStore((s) => s.speakerId);
  const options = useAgendaStore((s) => s.options);
  const tiedOptionIndices = useAgendaStore((s) => s.tiedOptionIndices);
  const speakerBreakTie = useAgendaStore((s) => s.speakerBreakTie);

  const speaker = speakerId !== null ? players[speakerId] : null;
  const speakerName = speaker
    ? getPlayerDisplayName(speaker)
    : "Speaker";

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg">
      <h3 className="text-lg font-bold text-yellow-400">
        Tied Vote
      </h3>
      <p className="text-sm text-hud-muted text-center">
        <span className="text-hud-text font-semibold">
          {speakerName}
        </span>
        {" "}(Speaker) breaks the tie
      </p>

      <div className="grid grid-cols-2 gap-3 w-full">
        {tiedOptionIndices.map((idx) => {
          const opt = options[idx];
          if (!opt) return null;
          return (
            <HudPanel
              key={opt.label}
              className="flex flex-col items-center gap-2 p-4 cursor-pointer hover:bg-white/5 transition-all"
            >
              <button
                type="button"
                onClick={() => speakerBreakTie(idx)}
                className="w-full flex flex-col items-center gap-2"
              >
                <span className="text-sm font-bold truncate max-w-full">
                  {opt.label}
                </span>
                <span className="text-2xl font-mono font-bold text-yellow-400">
                  {opt.totalInfluence}
                </span>
                <HudButton size="sm" variant="accent">
                  Select
                </HudButton>
              </button>
            </HudPanel>
          );
        })}
      </div>
    </div>
  );
}
