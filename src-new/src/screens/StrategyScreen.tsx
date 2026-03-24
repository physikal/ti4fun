import { useState } from "react";
import { useGameStore } from "src/store/gameStore";
import { HudButton } from "src/components/layout/HudButton";
import { Modal } from "src/components/layout/Modal";
import { PlayerBadge } from "src/components/player/PlayerBadge";
import { PhaseHeader } from "src/components/layout/PhaseHeader";
import { t } from "src/i18n/index";
import {
  STRATEGY_CARDS,
  getStrategyName,
  getStrategyColor,
} from "src/data/strategyCards";
import { HACAN_ID, NAALU_ID, WINNU_ID } from "src/data/factions";
import { getPlayerDisplayName } from "src/store/selectors";
import type { GameState } from "src/store/types";

export function StrategyScreen() {
  const players = useGameStore((s) => s.players);
  const strategySlots = useGameStore((s) => s.strategySlots);
  const endOfStrategyPhase = useGameStore((s) => s.endOfStrategyPhase);
  const strategyHistory = useGameStore((s) => s.strategyHistory);
  const modal = useGameStore((s) => s.modal);
  const speakerId = useGameStore((s) => s.speakerId);
  const assignStrategy = useGameStore((s) => s.assignStrategy);
  const undoStrategy = useGameStore((s) => s.undoStrategy);
  const endStrategyPhase = useGameStore((s) => s.endStrategyPhase);
  const setSpeaker = useGameStore((s) => s.setSpeaker);
  const randomSpeaker = useGameStore((s) => s.randomSpeaker);
  const confirmSpeaker = useGameStore((s) => s.confirmSpeaker);
  const setModal = useGameStore((s) => s.setModal);
  const setTelepathicTarget = useGameStore((s) => s.setTelepathicTarget);
  const swapStrategies = useGameStore((s) => s.swapStrategies);

  const [swapMode, setSwapMode] = useState(false);
  const [swapFirst, setSwapFirst] = useState<number | null>(null);

  const currentChooser =
    (useGameStore.getState() as GameState & { _currentChooser?: number })
      ._currentChooser ?? speakerId ?? 0;
  const currentPlayer = players[currentChooser];

  const hasHacan = players.some((p) => p.factionId === HACAN_ID);
  const hasNaalu = players.some((p) => p.factionId === NAALU_ID);
  const hasWinnu = players.some((p) => p.factionId === WINNU_ID);

  return (
    <div className="flex flex-col h-full screen-fade-in">
      <PhaseHeader />

      <div className="px-4 py-2 text-center text-sm text-hud-muted">
        {currentPlayer && !endOfStrategyPhase && (
          <span>
            <span className="text-hud-text font-semibold">
              {getPlayerDisplayName(currentPlayer)}
            </span>
            {t("selectStrategy")}
          </span>
        )}
        {endOfStrategyPhase && (
          <span className="text-hud-accent font-semibold">
            Strategy selection complete
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {STRATEGY_CARDS.map((card, index) => {
            const slotIndex = index;
            const slot = strategySlots[slotIndex];
            if (!slot) return null;
            const assignedPlayer =
              slot.playerId !== null ? players[slot.playerId] : null;
            const isAvailable =
              slot.playerId === null && !endOfStrategyPhase;

            return (
              <div
                key={card.index}
                className={`hud-panel p-4 flex flex-col gap-2.5 transition-all ${
                  isAvailable
                    ? "cursor-pointer hover:hud-glow"
                    : assignedPlayer
                      ? ""
                      : "opacity-40"
                }`}
                onClick={() => isAvailable && assignStrategy(slotIndex)}
              >
                <div className="flex items-center justify-between">
                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded"
                    style={{
                      backgroundColor: card.color,
                      color: "#fff",
                    }}
                  >
                    {card.index}
                  </span>
                  <span className="text-base font-semibold">
                    {card.name}
                  </span>
                  {slot.tradeGoods > 0 && (
                    <span className="text-sm text-yellow-400">
                      +{slot.tradeGoods} TG
                    </span>
                  )}
                </div>

                {/* Card description */}
                <div className="text-xs sm:text-sm leading-snug text-hud-muted space-y-1">
                  <p>{card.primary}</p>
                  <p className="text-hud-muted/60">
                    S: {card.secondary}
                  </p>
                </div>

                {assignedPlayer && (
                  <PlayerBadge player={assignedPlayer} compact />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 p-3 border-t border-hud-border/20 shrink-0">
        {strategyHistory.length > 0 && !endOfStrategyPhase && (
          <HudButton size="sm" onClick={undoStrategy}>
            ← {t("undo")}
          </HudButton>
        )}
        {endOfStrategyPhase && (
          <HudButton size="lg" variant="accent" onClick={endStrategyPhase}>
            {t("next")} →
          </HudButton>
        )}
      </div>

      {/* Speaker Modal */}
      <Modal
        open={modal?.type === "speaker"}
        title={t("pickSpeaker")}
      >
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            {players.map((player) => (
              <div
                key={player.id}
                onClick={() => setSpeaker(player.id)}
                className={`cursor-pointer ${
                  speakerId === player.id ? "ring-2 ring-hud-accent rounded-lg" : ""
                }`}
              >
                <PlayerBadge player={player} />
              </div>
            ))}
          </div>
          <div className="flex gap-2 justify-center">
            <HudButton size="sm" onClick={randomSpeaker}>
              {t("random")}
            </HudButton>
            <HudButton
              disabled={speakerId === null}
              onClick={confirmSpeaker}
            >
              {t("confirm")}
            </HudButton>
          </div>
        </div>
      </Modal>

      {/* Telepathic Modal (Naalu) */}
      <Modal
        open={modal?.type === "telepathic"}
        title={t("telepathicPick")}
      >
        <div className="grid grid-cols-2 gap-2">
          {players
            .filter((p) => p.factionId !== NAALU_ID)
            .map((player) => (
              <div
                key={player.id}
                onClick={() => {
                  setTelepathicTarget(player.id);
                  const store = useGameStore.getState();
                  store.initActionPhase();
                }}
                className="cursor-pointer"
              >
                <PlayerBadge player={player} />
              </div>
            ))}
        </div>
      </Modal>

      {/* Strategy Effect Modal */}
      <Modal
        open={modal?.type === "strategyEffect"}
        title={swapMode ? "Tap two strategies to swap" : "End of Strategy Phase Effects"}
      >
        {swapMode ? (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-2">
              {strategySlots
                .filter((s) => s.playerId !== null)
                .map((slot) => {
                  const slotIdx = strategySlots.indexOf(slot);
                  const player = slot.playerId !== null ? players[slot.playerId] : null;
                  const isSelected = swapFirst === slotIdx;
                  const color = getStrategyColor(slot.cardIndex);
                  return (
                    <div
                      key={slotIdx}
                      className={`hud-panel p-3 cursor-pointer transition-all ${
                        isSelected ? "ring-2 ring-hud-accent bg-hud-accent/10" : "hover:bg-white/5"
                      }`}
                      style={{ borderTopColor: color, borderTopWidth: "3px" }}
                      onClick={() => {
                        if (swapFirst === null) {
                          setSwapFirst(slotIdx);
                        } else if (swapFirst !== slotIdx) {
                          swapStrategies(swapFirst, slotIdx);
                          setSwapFirst(null);
                        } else {
                          setSwapFirst(null);
                        }
                      }}
                    >
                      <div className="text-xs font-bold text-center mb-1" style={{ color }}>
                        {getStrategyName(slot.cardIndex)}
                      </div>
                      {player && <PlayerBadge player={player} compact />}
                    </div>
                  );
                })}
            </div>
            <HudButton
              className="w-full"
              variant="accent"
              onClick={() => {
                setSwapMode(false);
                setSwapFirst(null);
              }}
            >
              {t("done")}
            </HudButton>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {(hasHacan || hasWinnu) && (
              <HudButton
                className="w-full"
                onClick={() => {
                  setSwapMode(true);
                  setSwapFirst(null);
                }}
              >
                {hasHacan ? t("quantumSwap") : t("acquiescence")}
              </HudButton>
            )}
            {hasNaalu && (
              <HudButton
                className="w-full"
                onClick={() => setModal({ type: "telepathic" })}
              >
                Naalu Telepathic
              </HudButton>
            )}
            <HudButton
              className="w-full"
              variant="accent"
              onClick={() => {
                setSwapMode(false);
                setSwapFirst(null);
                if (hasNaalu) {
                  setModal({ type: "telepathic" });
                } else {
                  setModal(null);
                  useGameStore.getState().initActionPhase();
                }
              }}
            >
              {hasNaalu ? t("next") + " →" : t("done")}
            </HudButton>
          </div>
        )}
      </Modal>
    </div>
  );
}
