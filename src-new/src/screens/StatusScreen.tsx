import { useGameStore } from "src/store/gameStore";
import { HudPanel } from "src/components/layout/HudPanel";
import { HudButton } from "src/components/layout/HudButton";
import { PlayerBadge } from "src/components/player/PlayerBadge";
import { PhaseHeader } from "src/components/layout/PhaseHeader";
import { t } from "src/i18n/index";
import { getInitiativeOrder } from "src/store/selectors";
import type { Player } from "src/store/types";

export function StatusScreen() {
  const state = useGameStore.getState();
  const players = useGameStore((s) => s.players);
  const mecatolScored = useGameStore((s) => s.mecatolScored);
  const toggleMecatol = useGameStore((s) => s.toggleMecatol);
  const statusNext = useGameStore((s) => s.statusNext);
  const statusBack = useGameStore((s) => s.statusBack);
  const options = useGameStore((s) => s.options);
  const goToEndGame = useGameStore((s) => s.goToEndGame);

  const initiativeOrder = getInitiativeOrder(state);

  const anyPlayerAtVP = players.some((p) => p.vp >= options.vpLimit);

  return (
    <div className="flex flex-col h-full screen-fade-in">
      <PhaseHeader onBack={statusBack} />

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {/* Initiative Order */}
        <HudPanel>
          <h3 className="text-sm font-bold text-hud-accent mb-2">
            Initiative Order
          </h3>
          <div className="flex flex-wrap gap-2 items-center">
            {initiativeOrder.map((player, i) => (
              <div key={player.id} className="flex items-center gap-1">
                {i > 0 && (
                  <span className="text-hud-muted text-xs mx-1">→</span>
                )}
                <PlayerBadge player={player} compact />
              </div>
            ))}
          </div>
        </HudPanel>

        {/* Status Checklist */}
        <HudPanel>
          <h3 className="text-sm font-bold text-hud-accent mb-2">
            {t("statusChecklist")}
          </h3>
          <ol className="space-y-1.5 text-sm text-hud-muted list-decimal list-inside">
            <li>Score objectives</li>
            <li>Reveal public objective</li>
            <li>Draw action cards</li>
            <li>Remove command tokens</li>
            <li>Gain and redistribute tokens</li>
            <li>Ready cards</li>
            <li>Repair units</li>
            <li>Return strategy cards</li>
          </ol>
        </HudPanel>

        {/* VP Tracker */}
        <HudPanel>
          <h3 className="text-sm font-bold text-hud-accent mb-2">
            {t("vp")}
          </h3>
          <div className="flex flex-col gap-2">
            {players.map((player) => (
              <VPPlayerCard key={player.id} player={player} />
            ))}
          </div>
        </HudPanel>

        {/* Mecatol Toggle */}
        <HudPanel>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-hud-accent">
                {t("mecatolToggle")}
              </h3>
              <p className="text-xs text-hud-muted truncate">
                {mecatolScored
                  ? t("custodiansLeft")
                  : t("custodiansStill")}
              </p>
            </div>
            <HudButton
              size="sm"
              variant={mecatolScored ? "accent" : "default"}
              onClick={toggleMecatol}
            >
              {mecatolScored ? "✓ Scored" : "Not Scored"}
            </HudButton>
          </div>
        </HudPanel>
      </div>

      <div className="flex gap-3 justify-center p-3 border-t border-hud-border/20 shrink-0">
        {anyPlayerAtVP && (
          <HudButton variant="danger" onClick={goToEndGame}>
            {t("endGame")}
          </HudButton>
        )}
        <HudButton variant="accent" onClick={statusNext}>
          {t("next")} →
        </HudButton>
      </div>
    </div>
  );
}

function VPPlayerCard({ player }: { player: Player }) {
  const setVP = (delta: number) => {
    useGameStore.setState((state) => ({
      players: state.players.map((p) =>
        p.id === player.id
          ? { ...p, vp: Math.max(0, p.vp + delta) }
          : p,
      ),
    }));
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 min-w-0">
        <PlayerBadge player={player} compact />
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => setVP(-1)}
          className="w-8 h-8 rounded bg-black/30 border border-hud-border/50 text-sm hover:bg-white/10 transition-colors"
        >
          -
        </button>
        <span className="w-8 text-center font-mono font-bold text-base">
          {player.vp}
        </span>
        <button
          onClick={() => setVP(1)}
          className="w-8 h-8 rounded bg-black/30 border border-hud-border/50 text-sm hover:bg-white/10 transition-colors"
        >
          +
        </button>
      </div>
    </div>
  );
}
