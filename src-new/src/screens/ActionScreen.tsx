import { useState } from "react";
import { useGameStore } from "src/store/gameStore";
import { HudButton } from "src/components/layout/HudButton";
import { PlayerBadge } from "src/components/player/PlayerBadge";
import { PhaseHeader } from "src/components/layout/PhaseHeader";
import { t } from "src/i18n/index";
import { getStrategyName, getStrategyColor } from "src/data/strategyCards";
import { FACTIONS, FIRMAMENT_ID, RAL_NEL_ID } from "src/data/factions";
import { getPlayerDisplayName } from "src/store/selectors";
import { PLAYER_COLOR_HEX } from "src/store/types";
import { formatTime } from "src/hooks/useTimer";

export function ActionScreen() {
  const locale = useGameStore((s) => s.locale);
  const players = useGameStore((s) => s.players);
  const playerCount = useGameStore((s) => s.playerCount);
  const strategySlots = useGameStore((s) => s.strategySlots);
  const activeSlotIndex = useGameStore((s) => s.activeSlotIndex);
  const actionHistory = useGameStore((s) => s.actionHistory);
  const currentPlayerTimerSec = useGameStore(
    (s) => s.currentPlayerTimerSec,
  );
  const options = useGameStore((s) => s.options);
  const resolveAction = useGameStore((s) => s.resolveAction);
  const nextPlayerAction = useGameStore((s) => s.nextPlayerAction);
  const undoAction = useGameStore((s) => s.undoAction);
  const transformFirmament = useGameStore((s) => s.transformFirmament);
  const ralNelUnpass = useGameStore((s) => s.ralNelUnpass);

  const [selectedActions, setSelectedActions] = useState({
    strategy1: false,
    strategy2: false,
    pass: false,
    tactical: false,
  });

  const activeSlot = strategySlots[activeSlotIndex];
  const activePlayer =
    activeSlot?.playerId !== null
      ? players[activeSlot?.playerId ?? -1]
      : null;

  const secondSlot =
    playerCount <= 4 && activeSlot
      ? strategySlots.find(
          (s) => s.secondPickPlayerId === activeSlot.playerId,
        )
      : null;

  const hasFirmament = players.some((p) => p.factionId === FIRMAMENT_ID);
  const hasRalNel = players.some((p) => p.factionId === RAL_NEL_ID);

  const s1Available = activeSlot?.status === "available";
  const s2Available = secondSlot?.status === "available";
  const allStratsHandled =
    (!s1Available || selectedActions.strategy1) &&
    (playerCount > 4 || !s2Available || selectedActions.strategy2);
  const canPass = allStratsHandled;
  const canResolve =
    selectedActions.strategy1 ||
    selectedActions.strategy2 ||
    selectedActions.pass ||
    selectedActions.tactical;

  const timerFlashing = currentPlayerTimerSec >= 180;

  const playerTimerDisplay = options.resetTimerPerTurn
    ? currentPlayerTimerSec
    : currentPlayerTimerSec +
      Math.floor((activePlayer?.clockMs ?? 0) / 1000);

  const handleResolve = () => {
    resolveAction(selectedActions);
    setSelectedActions({
      strategy1: false,
      strategy2: false,
      pass: false,
      tactical: false,
    });
    nextPlayerAction();
  };

  const activeFaction = activePlayer
    ? FACTIONS[activePlayer.factionId]
    : null;

  return (
    <div className="flex flex-col h-full screen-fade-in">
      <PhaseHeader />

      {/* Active Player Focus */}
      {activePlayer && activeSlot && (
        <div
          className="mx-4 mt-2 mb-2 flex items-center gap-3 hud-panel p-3"
          style={{
            borderColor: PLAYER_COLOR_HEX[activePlayer.color],
          }}
        >
          {activeFaction && (
            <img
              src={activeFaction.icon}
              alt={activeFaction.shortName}
              className="w-10 h-10 object-contain shrink-0"
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-base font-bold truncate">
              {getPlayerDisplayName(activePlayer, locale)}
            </div>
            <div className="text-xs text-hud-muted">
              {getStrategyName(activeSlot.cardIndex, locale)}
            </div>
          </div>
          <div
            className={`text-lg font-mono font-bold shrink-0 ${
              timerFlashing ? "timer-flash" : ""
            }`}
          >
            {formatTime(playerTimerDisplay)}
          </div>
        </div>
      )}

      {/* Strategy Slots Overview */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {strategySlots
            .filter((s) => s.playerId !== null)
            .map((slot) => {
              const player =
                slot.playerId !== null ? players[slot.playerId] : null;
              if (!player) return null;
              const slotIdx = strategySlots.indexOf(slot);
              const isCurrent = slotIdx === activeSlotIndex;
              const isPassed = slot.status === "passed";

              const secondSlotForPlayer = playerCount <= 4
                ? strategySlots.find(
                    (s) => s.secondPickPlayerId === slot.playerId,
                  )
                : null;

              const badges: { cardIndex: number; color: string }[] = [
                {
                  cardIndex: slot.cardIndex,
                  color: getStrategyColor(slot.cardIndex),
                },
              ];
              if (secondSlotForPlayer) {
                badges.push({
                  cardIndex: secondSlotForPlayer.cardIndex,
                  color: getStrategyColor(secondSlotForPlayer.cardIndex),
                });
              }

              return (
                <div
                  key={slotIdx}
                  className={`hud-panel rounded-lg p-3 transition-all ${
                    isCurrent
                      ? "border-hud-accent bg-hud-accent/10"
                      : isPassed
                        ? "opacity-40 grayscale"
                        : ""
                  }`}
                  style={{
                    borderTopColor: badges[0]?.color ?? "#666",
                    borderTopWidth: "3px",
                  }}
                >
                  <div className="flex flex-wrap justify-center gap-1 mb-2">
                    {badges.map((b) => (
                      <span
                        key={b.cardIndex}
                        className="text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: b.color + "25",
                          color: b.color,
                          border: `1px solid ${b.color}50`,
                        }}
                      >
                        {getStrategyName(b.cardIndex, locale)}
                      </span>
                    ))}
                  </div>
                  <PlayerBadge
                    player={player}
                    passed={isPassed}
                    compact
                  />
                </div>
              );
            })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3 border-t border-hud-border/20 space-y-2 shrink-0">
        <div className="flex flex-wrap gap-2 justify-center">
          {s1Available && (
            <HudButton
              size="sm"
              className={
                selectedActions.strategy1
                  ? "ring-2 ring-hud-accent bg-hud-accent/10"
                  : ""
              }
              onClick={() =>
                setSelectedActions((s) => ({
                  ...s,
                  strategy1: !s.strategy1,
                }))
              }
            >
              {activeSlot
                ? getStrategyName(activeSlot.cardIndex, locale)
                : "S1"}
            </HudButton>
          )}

          {playerCount <= 4 && s2Available && secondSlot && (
            <HudButton
              size="sm"
              className={
                selectedActions.strategy2
                  ? "ring-2 ring-hud-accent bg-hud-accent/10"
                  : ""
              }
              onClick={() =>
                setSelectedActions((s) => ({
                  ...s,
                  strategy2: !s.strategy2,
                }))
              }
            >
              {getStrategyName(secondSlot.cardIndex, locale)}
            </HudButton>
          )}

          <HudButton
            size="sm"
            disabled={!canPass}
            className={
              selectedActions.pass
                ? "ring-2 ring-hud-danger bg-hud-danger/10"
                : ""
            }
            onClick={() =>
              setSelectedActions((s) => ({ ...s, pass: !s.pass }))
            }
          >
            {t("pass", locale)}
          </HudButton>

          <HudButton
            size="sm"
            className={
              selectedActions.tactical
                ? "ring-2 ring-hud-accent bg-hud-accent/10"
                : ""
            }
            onClick={() =>
              setSelectedActions((s) => ({
                ...s,
                tactical: !s.tactical,
              }))
            }
          >
            Tactical
          </HudButton>
        </div>

        <div className="flex gap-2 justify-center">
          {actionHistory.length > 0 && (
            <HudButton size="sm" onClick={undoAction}>
              ← {t("undo", locale)}
            </HudButton>
          )}

          <HudButton
            disabled={!canResolve}
            variant="accent"
            onClick={handleResolve}
          >
            ✓ {t("done", locale)}
          </HudButton>
        </div>

        {(hasFirmament || hasRalNel) && (
          <div className="flex gap-2 justify-center pt-2 border-t border-hud-border/20">
            {hasFirmament && (
              <HudButton
                size="sm"
                variant="danger"
                onClick={transformFirmament}
              >
                {t("firmamentTransform", locale)}
              </HudButton>
            )}
            {hasRalNel && (
              <HudButton size="sm" onClick={ralNelUnpass}>
                {t("ralNelUnpass", locale)}
              </HudButton>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
