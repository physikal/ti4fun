import { lazy, Suspense, useRef, useState } from "react";
import { useGameStore } from "src/store/gameStore";
import { HudButton } from "src/components/layout/HudButton";
import { HudPanel } from "src/components/layout/HudPanel";
import { Modal } from "src/components/layout/Modal";
import { PlayerBadge } from "src/components/player/PlayerBadge";
import { PhaseHeader } from "src/components/layout/PhaseHeader";
import { CombatTracker } from "src/components/combat/CombatTracker";
import { t } from "src/i18n/index";
import {
  getStrategyName,
  getStrategyColor,
  getStrategyCard,
} from "src/data/strategyCards";
import { FACTIONS, FIRMAMENT_ID, RAL_NEL_ID } from "src/data/factions";
import { getPlayerDisplayName } from "src/store/selectors";
import { PLAYER_COLOR_HEX } from "src/store/types";
import { formatTime } from "src/hooks/useTimer";

const StrategyCardEffect = lazy(
  () => import("src/components/effects/StrategyCardEffect"),
);

export function ActionScreen() {
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
  const undoAction = useGameStore((s) => s.undoAction);
  const transformFirmament = useGameStore((s) => s.transformFirmament);
  const ralNelUnpass = useGameStore((s) => s.ralNelUnpass);
  const modal = useGameStore((s) => s.modal);
  const speakerId = useGameStore((s) => s.speakerId);
  const setSpeaker = useGameStore((s) => s.setSpeaker);
  const randomSpeaker = useGameStore((s) => s.randomSpeaker);
  const confirmSpeaker = useGameStore((s) => s.confirmSpeaker);
  const setModal = useGameStore((s) => s.setModal);
  const timerPaused = useGameStore((s) => s.timerPaused);
  const toggleTimerPause = useGameStore((s) => s.toggleTimerPause);

  const [selectedActions, setSelectedActions] = useState({
    strategy1: false,
    strategy2: false,
    pass: false,
    tactical: false,
  });
  const [cardEffect, setCardEffect] = useState<{
    cardName: string;
    cardColor: string;
    cardDescription?: string;
  } | null>(null);
  const [vpEditing, setVpEditing] = useState(false);
  const pendingActionsRef = useRef(selectedActions);

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
  const canPass = !s1Available && (playerCount > 4 || !s2Available);
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
    let effectCard: {
      cardName: string;
      cardColor: string;
      cardDescription?: string;
    } | null = null;

    if (selectedActions.strategy1 && activeSlot) {
      const card = getStrategyCard(activeSlot.cardIndex);
      effectCard = {
        cardName: getStrategyName(activeSlot.cardIndex),
        cardColor: getStrategyColor(activeSlot.cardIndex),
        cardDescription: card
          ? `${card.primary}\nSecondary: ${card.secondary}`
          : undefined,
      };
    } else if (selectedActions.strategy2 && secondSlot) {
      const card = getStrategyCard(secondSlot.cardIndex);
      effectCard = {
        cardName: getStrategyName(secondSlot.cardIndex),
        cardColor: getStrategyColor(secondSlot.cardIndex),
        cardDescription: card
          ? `${card.primary}\nSecondary: ${card.secondary}`
          : undefined,
      };
    }

    if (effectCard) {
      pendingActionsRef.current = { ...selectedActions };
      setCardEffect(effectCard);
    } else {
      resolveAction(selectedActions);
    }

    setSelectedActions({
      strategy1: false,
      strategy2: false,
      pass: false,
      tactical: false,
    });
  };

  const handleEffectContinue = () => {
    resolveAction(pendingActionsRef.current);
    setCardEffect(null);
  };

  const activeFaction = activePlayer
    ? FACTIONS[activePlayer.factionId]
    : null;

  const setVP = (playerId: number, delta: number) => {
    useGameStore.setState((state) => ({
      players: state.players.map((p) =>
        p.id === playerId
          ? { ...p, vp: Math.max(0, p.vp + delta) }
          : p,
      ),
    }));
  };

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
              {getPlayerDisplayName(activePlayer)}
            </div>
            <div className="text-xs text-hud-muted">
              {getStrategyName(activeSlot.cardIndex)}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleTimerPause}
              className={`w-8 h-8 flex items-center justify-center rounded-md border transition-colors ${
                timerPaused
                  ? "border-yellow-400 bg-yellow-400/20 text-yellow-400"
                  : "border-hud-border/50 text-hud-muted hover:text-hud-text"
              }`}
              aria-label={timerPaused ? "Resume timer" : "Pause timer"}
              title={timerPaused ? "Resume timer" : "Pause timer"}
            >
              {timerPaused ? (
                <PlayIcon />
              ) : (
                <PauseIcon />
              )}
            </button>
            <div
              className={`text-lg font-mono font-bold ${
                timerPaused
                  ? "text-yellow-400"
                  : timerFlashing
                    ? "timer-flash"
                    : ""
              }`}
            >
              {formatTime(playerTimerDisplay)}
              {timerPaused && (
                <span className="text-[10px] block text-center text-yellow-400">
                  PAUSED
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Strategy Slots Overview */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3">
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
              const isPlayed = slot.status === "played";

              const secondSlotForPlayer = playerCount <= 4
                ? strategySlots.find(
                    (s) => s.secondPickPlayerId === slot.playerId,
                  )
                : null;

              const badges: {
                cardIndex: number;
                color: string;
                played: boolean;
              }[] = [
                {
                  cardIndex: slot.cardIndex,
                  color: getStrategyColor(slot.cardIndex),
                  played: slot.status === "played",
                },
              ];
              if (secondSlotForPlayer) {
                badges.push({
                  cardIndex: secondSlotForPlayer.cardIndex,
                  color: getStrategyColor(secondSlotForPlayer.cardIndex),
                  played: secondSlotForPlayer.status === "played",
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
                    borderTopColor: isCurrent || isPassed
                      ? badges[0]?.color
                      : isPlayed
                        ? "rgba(255,255,255,0.15)"
                        : badges[0]?.color,
                    borderTopWidth: "3px",
                  }}
                >
                  <div className="flex flex-wrap justify-center gap-1 mb-2">
                    {badges.map((b) => (
                      <span
                        key={b.cardIndex}
                        className={`text-[11px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                          b.played ? "line-through" : ""
                        }`}
                        style={b.played ? {
                          backgroundColor: "rgba(255,255,255,0.08)",
                          color: "rgba(255,255,255,0.4)",
                          border: "1px solid rgba(255,255,255,0.15)",
                        } : {
                          backgroundColor: b.color + "25",
                          color: b.color,
                          border: `1px solid ${b.color}50`,
                        }}
                      >
                        {b.played ? "\u2713 " : ""}
                        {getStrategyName(b.cardIndex)}
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

        {/* Scoreboard + Player Times */}
        <HudPanel className="p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-hud-accent uppercase tracking-wider">
              Scoreboard
            </h3>
            <button
              type="button"
              onClick={() => setVpEditing((v) => !v)}
              className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                vpEditing
                  ? "border-hud-accent text-hud-accent bg-hud-accent/10"
                  : "border-hud-border/40 text-hud-muted hover:text-hud-text"
              }`}
            >
              {vpEditing ? "Done" : "Edit"}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-1.5">
            {[...players]
              .sort((a, b) => b.vp - a.vp)
              .map((player) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2 text-sm"
                >
                  <div
                    className="w-1.5 h-5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        PLAYER_COLOR_HEX[player.color],
                    }}
                  />
                  <span className="flex-1 min-w-0 truncate text-xs">
                    {getPlayerDisplayName(player)}
                  </span>
                  {vpEditing ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setVP(player.id, -1)}
                        className="w-6 h-6 rounded bg-black/30 border border-hud-border/50 text-xs hover:bg-white/10"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-mono font-bold text-xs">
                        {player.vp}
                      </span>
                      <button
                        type="button"
                        onClick={() => setVP(player.id, 1)}
                        className="w-6 h-6 rounded bg-black/30 border border-hud-border/50 text-xs hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <span className="font-mono font-bold text-xs text-hud-accent shrink-0 w-6 text-center">
                      {player.vp}
                    </span>
                  )}
                  <span className="font-mono text-[10px] text-hud-muted shrink-0 w-16 text-right">
                    {formatTime(Math.floor(player.clockMs / 1000))}
                  </span>
                </div>
              ))}
          </div>
        </HudPanel>
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
                  pass: false,
                  tactical: false,
                }))
              }
            >
              {activeSlot
                ? getStrategyName(activeSlot.cardIndex)
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
                  pass: false,
                  tactical: false,
                }))
              }
            >
              {getStrategyName(secondSlot.cardIndex)}
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
              setSelectedActions((s) => ({
                strategy1: false,
                strategy2: false,
                pass: !s.pass,
                tactical: false,
              }))
            }
          >
            {t("pass")}
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
                strategy1: false,
                strategy2: false,
                pass: false,
                tactical: !s.tactical,
              }))
            }
          >
            Tactical
          </HudButton>

          <HudButton
            size="sm"
            onClick={() => setModal({ type: "combat" })}
          >
            Combat
          </HudButton>
        </div>

        <div className="flex gap-2 justify-center">
          {actionHistory.length > 0 && (
            <HudButton size="sm" onClick={undoAction}>
              ← {t("undo")}
            </HudButton>
          )}

          <HudButton
            disabled={!canResolve}
            variant="accent"
            onClick={handleResolve}
          >
            \u2713 {t("done")}
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
                {t("firmamentTransform")}
              </HudButton>
            )}
            {hasRalNel && (
              <HudButton size="sm" onClick={ralNelUnpass}>
                {t("ralNelUnpass")}
              </HudButton>
            )}
          </div>
        )}
      </div>

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

      <CombatTracker />

      {cardEffect && (
        <Suspense fallback={null}>
          <StrategyCardEffect
            cardName={cardEffect.cardName}
            cardColor={cardEffect.cardColor}
            cardDescription={cardEffect.cardDescription}
            onContinue={handleEffectContinue}
          />
        </Suspense>
      )}
    </div>
  );
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  );
}
