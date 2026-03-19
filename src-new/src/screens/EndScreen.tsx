import { useGameStore } from "src/store/gameStore";
import { HudPanel } from "src/components/layout/HudPanel";
import { HudButton } from "src/components/layout/HudButton";
import { t } from "src/i18n/index";
import { FACTIONS, isTEOrObsidian } from "src/data/factions";
import { PLAYER_COLOR_HEX } from "src/store/types";
import { getPlayerDisplayName } from "src/store/selectors";
import { formatTime } from "src/hooks/useTimer";

export function EndScreen() {
  const locale = useGameStore((s) => s.locale);
  const players = useGameStore((s) => s.players);
  const round = useGameStore((s) => s.round);
  const gameElapsedSec = useGameStore((s) => s.gameElapsedSec);
  const resetGame = useGameStore((s) => s.resetGame);
  const setScreen = useGameStore((s) => s.setScreen);

  const ranked = [...players].sort((a, b) => b.vp - a.vp);
  const winner = ranked[0];

  if (!winner) return null;

  const winnerFaction = FACTIONS[winner.factionId];
  const heroExt = isTEOrObsidian(winner.factionId) ? ".webp" : ".png";
  const heroSrc = `/assets/heroes/h_${winnerFaction?.shortName ?? ""}${heroExt}`;

  return (
    <div
      className="flex flex-col h-full screen-fade-in"
      style={{
        backgroundImage: `url(${import.meta.env.BASE_URL}assets/backgrounds/endgame.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
        {/* Winner Portrait */}
        <div className="relative">
          <img
            src={heroSrc}
            alt={winnerFaction?.shortName ?? "Winner"}
            className="w-48 h-48 object-contain rounded-xl"
            style={{
              borderWidth: "3px",
              borderStyle: "solid",
              borderColor: PLAYER_COLOR_HEX[winner.color],
              boxShadow: `0 0 30px ${PLAYER_COLOR_HEX[winner.color]}80`,
            }}
          />
        </div>

        <h1 className="text-3xl font-bold text-hud-accent text-center">
          {getPlayerDisplayName(winner, locale)}
        </h1>
        <p className="text-hud-muted">{t("conclusion", locale)}</p>

        {/* Stats */}
        <HudPanel className="w-full max-w-lg">
          <div className="flex justify-around text-center mb-4">
            <div>
              <div className="text-2xl font-mono font-bold text-hud-accent">
                {formatTime(gameElapsedSec)}
              </div>
              <div className="text-xs text-hud-muted">
                {t("gameDuration", locale)}
              </div>
            </div>
            <div>
              <div className="text-2xl font-mono font-bold text-hud-accent">
                {round}
              </div>
              <div className="text-xs text-hud-muted">
                {t("rounds", locale)}
              </div>
            </div>
          </div>

          {/* Rankings Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="text-hud-muted text-xs">
                <th className="text-left py-1">#</th>
                <th className="text-left py-1">{t("faction", locale)}</th>
                <th className="text-center py-1">{t("vp", locale)}</th>
                <th className="text-center py-1">{t("time", locale)}</th>
                <th className="text-center py-1">🔊</th>
              </tr>
            </thead>
            <tbody>
              {ranked.map((player, i) => {
                const faction = FACTIONS[player.factionId];
                return (
                  <tr
                    key={player.id}
                    className={i === 0 ? "text-hud-accent" : ""}
                  >
                    <td className="py-1">{i + 1}</td>
                    <td className="py-1 flex items-center gap-2">
                      {faction && (
                        <img
                          src={faction.icon}
                          alt=""
                          className="w-5 h-5"
                        />
                      )}
                      <span className="truncate">
                        {getPlayerDisplayName(player, locale)}
                      </span>
                    </td>
                    <td className="text-center py-1 font-mono">
                      {player.vp}
                    </td>
                    <td className="text-center py-1 font-mono text-xs">
                      {formatTime(Math.floor(player.clockMs / 1000))}
                    </td>
                    <td className="text-center py-1">
                      {player.speakerCount}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </HudPanel>
      </div>

      <div className="flex justify-center gap-3 p-4">
        <HudButton
          onClick={() => {
            resetGame();
            setScreen("start");
          }}
        >
          {t("newGame", locale)}
        </HudButton>
      </div>
    </div>
  );
}
