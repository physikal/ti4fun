import { useState } from "react";
import { useGameStore } from "src/store/gameStore";
import { HudPanel } from "src/components/layout/HudPanel";
import { HudButton } from "src/components/layout/HudButton";
import { Modal } from "src/components/layout/Modal";
import { getPlayerDisplayName } from "src/store/selectors";
import { PLAYER_COLOR_HEX } from "src/store/types";

export function CombatTracker() {
  const players = useGameStore((s) => s.players);
  const modal = useGameStore((s) => s.modal);
  const setModal = useGameStore((s) => s.setModal);

  const [hits, setHits] = useState<Record<number, number>>({});
  const [combatants, setCombatants] = useState<number[]>([]);
  const [picking, setPicking] = useState(true);

  function toggleCombatant(playerId: number) {
    setCombatants((prev) =>
      prev.includes(playerId)
        ? prev.filter((id) => id !== playerId)
        : [...prev, playerId],
    );
  }

  function startCombat() {
    if (combatants.length < 2) return;
    const initial: Record<number, number> = {};
    for (const id of combatants) {
      initial[id] = 0;
    }
    setHits(initial);
    setPicking(false);
  }

  function adjustHits(playerId: number, delta: number) {
    setHits((prev) => ({
      ...prev,
      [playerId]: Math.max(0, (prev[playerId] ?? 0) + delta),
    }));
  }

  function resetCombat() {
    setHits({});
    setCombatants([]);
    setPicking(true);
  }

  function closeCombat() {
    resetCombat();
    setModal(null);
  }

  return (
    <Modal
      open={modal?.type === "combat"}
      title="Combat Tracker"
      onClose={closeCombat}
    >
      {picking ? (
        <div className="flex flex-col gap-4">
          <p className="text-sm text-hud-muted text-center">
            Select combatants
          </p>
          <div className="grid grid-cols-2 gap-2">
            {players.map((player) => {
              const selected = combatants.includes(player.id);
              return (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => toggleCombatant(player.id)}
                  className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                    selected
                      ? "border-hud-accent bg-hud-accent/10"
                      : "border-hud-border/30 hover:bg-white/5"
                  }`}
                  style={{
                    borderLeftColor: PLAYER_COLOR_HEX[player.color],
                    borderLeftWidth: "4px",
                  }}
                >
                  {getPlayerDisplayName(player)}
                </button>
              );
            })}
          </div>
          <div className="flex gap-2 justify-center">
            <HudButton size="sm" onClick={closeCombat}>
              Cancel
            </HudButton>
            <HudButton
              variant="accent"
              disabled={combatants.length < 2}
              onClick={startCombat}
            >
              Start Combat
            </HudButton>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            {combatants.map((playerId) => {
              const player = players[playerId];
              if (!player) return null;
              const hitCount = hits[playerId] ?? 0;
              return (
                <HudPanel key={playerId} className="p-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-1 h-10 rounded-full shrink-0"
                      style={{
                        backgroundColor:
                          PLAYER_COLOR_HEX[player.color],
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">
                        {getPlayerDisplayName(player)}
                      </div>
                      <div className="text-xs text-hud-muted">
                        Hits
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => adjustHits(playerId, -1)}
                        className="w-10 h-10 rounded-lg bg-black/30 border border-hud-border/50 text-lg font-bold hover:bg-white/10 transition-colors"
                      >
                        -
                      </button>
                      <span className="w-10 text-center font-mono text-2xl font-bold text-hud-accent">
                        {hitCount}
                      </span>
                      <button
                        type="button"
                        onClick={() => adjustHits(playerId, 1)}
                        className="w-10 h-10 rounded-lg bg-black/30 border border-hud-border/50 text-lg font-bold hover:bg-white/10 transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </HudPanel>
              );
            })}
          </div>
          <div className="flex gap-2 justify-center">
            <HudButton size="sm" onClick={resetCombat}>
              New Combat
            </HudButton>
            <HudButton variant="accent" onClick={closeCombat}>
              Done
            </HudButton>
          </div>
        </div>
      )}
    </Modal>
  );
}
