import { useGameStore } from "src/store/gameStore";
import { useAgendaStore } from "src/store/agendaStore";
import { HudPanel } from "src/components/layout/HudPanel";
import { HudButton } from "src/components/layout/HudButton";
import { t } from "src/i18n/index";
import { getPlayerDisplayName } from "src/store/selectors";

interface VoteResultsProps {
  onResolve: () => void;
}

export function VoteResults({ onResolve }: VoteResultsProps) {
  const locale = useGameStore((s) => s.locale);
  const players = useGameStore((s) => s.players);
  const options = useAgendaStore((s) => s.options);
  const agendaNumber = useAgendaStore((s) => s.agendaNumber);

  let maxInfluence = 0;
  for (const opt of options) {
    if (opt.totalInfluence > maxInfluence) {
      maxInfluence = opt.totalInfluence;
    }
  }

  const winnerCount = options.filter(
    (o) => o.totalInfluence === maxInfluence,
  ).length;
  const isTied = winnerCount > 1 && maxInfluence > 0;

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg">
      <h3 className="text-lg font-bold text-hud-accent">
        {t("results", locale)}
      </h3>

      {isTied && (
        <span className="text-sm font-bold text-yellow-400 uppercase">
          {t("tied", locale)}
        </span>
      )}

      <div className="grid grid-cols-2 gap-3 w-full">
        {options.map((opt) => {
          const isWinner =
            opt.totalInfluence === maxInfluence &&
            maxInfluence > 0;
          return (
            <HudPanel
              key={opt.label}
              glow={isWinner}
              className={`flex flex-col items-center gap-2 p-4 ${
                isWinner
                  ? "ring-2 ring-green-400"
                  : "opacity-60"
              }`}
            >
              <span className="text-sm font-bold truncate max-w-full">
                {opt.label}
              </span>
              <span
                className={`text-3xl font-mono font-bold ${
                  isWinner ? "text-green-400" : ""
                }`}
              >
                {opt.totalInfluence}
              </span>
              {isWinner && !isTied && (
                <span className="text-xs font-bold text-green-400 uppercase">
                  {t("winner", locale)}
                </span>
              )}
              {opt.votes.length > 0 && (
                <div className="w-full border-t border-hud-border/20 pt-2 mt-1">
                  {opt.votes.map((v) => {
                    const voter = players[v.playerId];
                    const name = voter
                      ? getPlayerDisplayName(voter, locale)
                      : "?";
                    return (
                      <div
                        key={v.playerId}
                        className="flex justify-between text-xs text-hud-muted"
                      >
                        <span>{name}</span>
                        <span>{v.influence}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </HudPanel>
          );
        })}
      </div>

      <HudButton variant="accent" onClick={onResolve}>
        {agendaNumber === 1
          ? `${t("next", locale)}: ${t("secondAgenda", locale)}`
          : `${t("done", locale)} \u2192`}
      </HudButton>
    </div>
  );
}
