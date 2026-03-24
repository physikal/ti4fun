import { useGameStore } from "src/store/gameStore";
import { useAgendaStore } from "src/store/agendaStore";
import { HudPanel } from "src/components/layout/HudPanel";
import { HudButton } from "src/components/layout/HudButton";
import { t } from "src/i18n/index";
import { getPlayerDisplayName } from "src/store/selectors";
import { InfluenceKeypad } from "src/components/agenda/InfluenceKeypad";

export function VotingPanel() {
  const players = useGameStore((s) => s.players);

  const options = useAgendaStore((s) => s.options);
  const voterOrder = useAgendaStore((s) => s.voterOrder);
  const currentVoterIndex = useAgendaStore(
    (s) => s.currentVoterIndex,
  );
  const selectedOptionIndex = useAgendaStore(
    (s) => s.selectedOptionIndex,
  );
  const pendingInfluence = useAgendaStore(
    (s) => s.pendingInfluence,
  );
  const selectOption = useAgendaStore((s) => s.selectOption);
  const confirmVote = useAgendaStore((s) => s.confirmVote);
  const abstainVote = useAgendaStore((s) => s.abstainVote);

  const currentPlayerId = voterOrder[currentVoterIndex];
  const currentPlayer =
    currentPlayerId !== undefined
      ? players[currentPlayerId]
      : undefined;
  const voterName = currentPlayer
    ? getPlayerDisplayName(currentPlayer)
    : "?";

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-lg">
      <HudPanel className="w-full p-4 text-center">
        <span className="text-sm text-hud-muted">
          {voterName}
          {t("castVote")}
        </span>
      </HudPanel>

      <div className="grid grid-cols-2 gap-3 w-full">
        {options.map((opt, i) => {
          const isSelected = selectedOptionIndex === i;
          return (
            <HudPanel
              key={opt.label}
              glow={isSelected}
              className={`flex flex-col items-center gap-2 p-4 cursor-pointer transition-all ${
                isSelected
                  ? "ring-2 ring-hud-accent"
                  : "hover:bg-white/5"
              }`}
            >
              <button
                type="button"
                onClick={() => selectOption(i)}
                className="w-full flex flex-col items-center gap-2"
              >
                <span className="text-sm font-bold truncate max-w-full">
                  {opt.label}
                </span>
                <span className="text-2xl font-mono font-bold">
                  {opt.totalInfluence}
                </span>
              </button>
              {opt.votes.length > 0 && (
                <div className="w-full border-t border-hud-border/20 pt-2 mt-1">
                  {opt.votes.map((v) => {
                    const voter = players[v.playerId];
                    const name = voter
                      ? getPlayerDisplayName(voter)
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

      {selectedOptionIndex !== null && (
        <InfluenceKeypad influence={pendingInfluence} />
      )}

      <div className="flex gap-3">
        <HudButton onClick={abstainVote}>
          {t("abstain")}
        </HudButton>
        {selectedOptionIndex !== null && (
          <HudButton variant="accent" onClick={confirmVote}>
            {t("confirm")} ({pendingInfluence})
          </HudButton>
        )}
      </div>
    </div>
  );
}
