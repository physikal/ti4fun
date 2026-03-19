import { useGameStore } from "src/store/gameStore";
import { HudButton } from "src/components/layout/HudButton";
import { Modal } from "src/components/layout/Modal";
import { PlayerBadge } from "src/components/player/PlayerBadge";
import { PhaseHeader } from "src/components/layout/PhaseHeader";
import { t } from "src/i18n/index";
import { STRATEGY_CARDS, getStrategyName } from "src/data/strategyCards";
import { HACAN_ID, NAALU_ID, WINNU_ID } from "src/data/factions";
import { getPlayerDisplayName } from "src/store/selectors";
import type { GameState } from "src/store/types";

export function StrategyScreen() {
  const locale = useGameStore((s) => s.locale);
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
              {getPlayerDisplayName(currentPlayer, locale)}
            </span>
            {t("selectStrategy", locale)}
          </span>
        )}
        {endOfStrategyPhase && (
          <span className="text-hud-accent font-semibold">
            Strategy selection complete
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
                className={`hud-panel p-4 flex flex-col gap-2 transition-all ${
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
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      backgroundColor: card.color,
                      color: "#fff",
                    }}
                  >
                    {card.index}
                  </span>
                  <span className="text-sm font-semibold">
                    {getStrategyName(card.index, locale)}
                  </span>
                  {slot.tradeGoods > 0 && (
                    <span className="text-xs text-yellow-400">
                      +{slot.tradeGoods} TG
                    </span>
                  )}
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
            ← {t("undo", locale)}
          </HudButton>
        )}
        {endOfStrategyPhase && (
          <HudButton size="lg" variant="accent" onClick={endStrategyPhase}>
            {t("next", locale)} →
          </HudButton>
        )}
      </div>

      {/* Speaker Modal */}
      <Modal
        open={modal?.type === "speaker"}
        title={t("pickSpeaker", locale)}
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
              {t("random", locale)}
            </HudButton>
            <HudButton
              disabled={speakerId === null}
              onClick={confirmSpeaker}
            >
              {t("confirm", locale)}
            </HudButton>
          </div>
        </div>
      </Modal>

      {/* Telepathic Modal (Naalu) */}
      <Modal
        open={modal?.type === "telepathic"}
        title={t("telepathicPick", locale)}
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
        title="End of Strategy Phase Effects"
      >
        <div className="flex flex-col gap-3">
          {hasHacan && (
            <HudButton
              className="w-full"
              onClick={() => {
                setModal(null);
                if (hasNaalu) {
                  setModal({ type: "telepathic" });
                } else {
                  useGameStore.getState().initActionPhase();
                }
              }}
            >
              {t("quantumSwap", locale)}
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
          {hasWinnu && (
            <HudButton
              className="w-full"
              onClick={() => {
                setModal(null);
                useGameStore.getState().initActionPhase();
              }}
            >
              {t("acquiescence", locale)}
            </HudButton>
          )}
          <HudButton
            className="w-full"
            variant="accent"
            onClick={() => {
              setModal(null);
              useGameStore.getState().initActionPhase();
            }}
          >
            {t("done", locale)}
          </HudButton>
        </div>
      </Modal>
    </div>
  );
}
