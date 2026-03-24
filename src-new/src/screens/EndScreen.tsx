import { useGameStore } from "src/store/gameStore";
import { HudPanel } from "src/components/layout/HudPanel";
import { HudButton } from "src/components/layout/HudButton";
import { t } from "src/i18n/index";
import { FACTIONS, isTEOrObsidian } from "src/data/factions";
import { PLAYER_COLOR_HEX } from "src/store/types";
import { getPlayerDisplayName } from "src/store/selectors";
import { formatTime } from "src/hooks/useTimer";

export function EndScreen() {
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

  // Compute fun stats
  const totalPlayerTime = players.reduce(
    (sum, p) => sum + p.clockMs,
    0,
  );
  const avgTurnTimeSec =
    round > 0 && players.length > 0
      ? Math.floor(totalPlayerTime / 1000 / (round * players.length))
      : 0;
  const avgRoundTimeSec =
    round > 0 ? Math.floor(gameElapsedSec / round) : 0;

  const mostTimeSec = Math.max(
    ...players.map((p) => Math.floor(p.clockMs / 1000)),
  );
  const mostTimePlayer = players.find(
    (p) => Math.floor(p.clockMs / 1000) === mostTimeSec,
  );
  const leastTimeSec = Math.min(
    ...players.map((p) => Math.floor(p.clockMs / 1000)),
  );
  const leastTimePlayer = players.find(
    (p) => Math.floor(p.clockMs / 1000) === leastTimeSec,
  );
  const mostSpeaker = [...players].sort(
    (a, b) => b.speakerCount - a.speakerCount,
  )[0];

  return (
    <div
      className="flex flex-col h-full screen-fade-in overflow-y-auto"
      style={{
        backgroundImage: `url(${import.meta.env.BASE_URL}assets/backgrounds/endgame.png)`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="flex-1 flex flex-col items-center gap-6 p-4 pt-8">
        {/* Winner Portrait */}
        <div className="relative">
          <img
            src={heroSrc}
            alt={winnerFaction?.shortName ?? "Winner"}
            className="w-40 h-40 sm:w-48 sm:h-48 object-contain rounded-xl"
            style={{
              borderWidth: "3px",
              borderStyle: "solid",
              borderColor: PLAYER_COLOR_HEX[winner.color],
              boxShadow: `0 0 30px ${PLAYER_COLOR_HEX[winner.color]}80`,
            }}
          />
        </div>

        <h1 className="text-3xl font-bold text-hud-accent text-center">
          {getPlayerDisplayName(winner)}
        </h1>
        <p className="text-hud-muted">{t("conclusion")}</p>

        {/* Game Summary Stats */}
        <HudPanel className="w-full max-w-lg">
          <h3 className="text-xs font-bold text-hud-accent uppercase tracking-wider mb-3 text-center">
            Game Statistics
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <StatBlock
              value={formatTime(gameElapsedSec)}
              label={t("gameDuration")}
            />
            <StatBlock
              value={String(round)}
              label={t("rounds")}
            />
            <StatBlock
              value={formatTime(Math.floor(totalPlayerTime / 1000))}
              label="Total Player Time"
            />
            <StatBlock
              value={formatTime(avgRoundTimeSec)}
              label="Avg Round"
            />
          </div>
        </HudPanel>

        {/* Fun Stats */}
        <HudPanel className="w-full max-w-lg">
          <h3 className="text-xs font-bold text-hud-accent uppercase tracking-wider mb-3 text-center">
            Awards
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mostTimePlayer && (
              <AwardCard
                title="Slowest Player"
                player={getPlayerDisplayName(mostTimePlayer)}
                value={formatTime(mostTimeSec)}
                color={PLAYER_COLOR_HEX[mostTimePlayer.color]}
              />
            )}
            {leastTimePlayer && (
              <AwardCard
                title="Fastest Player"
                player={getPlayerDisplayName(leastTimePlayer)}
                value={formatTime(leastTimeSec)}
                color={PLAYER_COLOR_HEX[leastTimePlayer.color]}
              />
            )}
            <AwardCard
              title="Avg Turn Time"
              player="All Players"
              value={formatTime(avgTurnTimeSec)}
            />
            {mostSpeaker && mostSpeaker.speakerCount > 0 && (
              <AwardCard
                title="Most Speaker"
                player={getPlayerDisplayName(mostSpeaker)}
                value={`${mostSpeaker.speakerCount}x`}
                color={PLAYER_COLOR_HEX[mostSpeaker.color]}
              />
            )}
          </div>
        </HudPanel>

        {/* Rankings Table */}
        <HudPanel className="w-full max-w-lg">
          <h3 className="text-xs font-bold text-hud-accent uppercase tracking-wider mb-3 text-center">
            Final Rankings
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-hud-muted text-xs">
                <th className="text-left py-1">#</th>
                <th className="text-left py-1">{t("faction")}</th>
                <th className="text-center py-1">{t("vp")}</th>
                <th className="text-center py-1">{t("time")}</th>
                <th className="text-center py-1">Spkr</th>
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
                        {getPlayerDisplayName(player)}
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

      <div className="flex justify-center gap-3 p-4 shrink-0">
        <HudButton
          onClick={() => {
            resetGame();
            setScreen("start");
          }}
        >
          {t("newGame")}
        </HudButton>
      </div>
    </div>
  );
}

function StatBlock({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div>
      <div className="text-lg sm:text-2xl font-mono font-bold text-hud-accent">
        {value}
      </div>
      <div className="text-[10px] sm:text-xs text-hud-muted">
        {label}
      </div>
    </div>
  );
}

function AwardCard({
  title,
  player,
  value,
  color,
}: {
  title: string;
  player: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg bg-white/5"
      style={color ? { borderLeft: `3px solid ${color}` } : undefined}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[10px] text-hud-muted uppercase tracking-wider">
          {title}
        </div>
        <div className="text-sm font-semibold truncate">{player}</div>
      </div>
      <div className="text-sm font-mono font-bold text-hud-accent shrink-0">
        {value}
      </div>
    </div>
  );
}
