import type { Player } from "src/store/types";
import { PLAYER_COLOR_HEX } from "src/store/types";
import { FACTIONS } from "src/data/factions";
import { getPlayerDisplayName } from "src/store/selectors";

interface PlayerBadgeProps {
  player: Player;
  passed?: boolean;
  current?: boolean;
  compact?: boolean;
  onClick?: () => void;
}

export function PlayerBadge({
  player,
  passed = false,
  current = false,
  compact = false,
  onClick,
}: PlayerBadgeProps) {
  const faction = FACTIONS[player.factionId];
  const color = PLAYER_COLOR_HEX[player.color];
  const displayName = getPlayerDisplayName(player);

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg p-2 transition-all
        ${onClick ? "cursor-pointer hover:bg-white/5" : ""}
        ${passed ? "opacity-40 grayscale" : ""}
        ${current ? "ring-2 ring-hud-accent" : ""}
        ${compact ? "p-1" : ""}
      `}
      style={{ borderLeft: `3px solid ${color}` }}
    >
      {faction && (
        <img
          src={faction.icon}
          alt={displayName}
          className={`${compact ? "w-6 h-6" : "w-8 h-8"} object-contain`}
        />
      )}
      <div className="flex flex-col min-w-0">
        <span
          className={`font-semibold truncate ${compact ? "text-xs" : "text-sm"}`}
        >
          {displayName}
        </span>
        {faction && (
          <span className="text-[10px] text-hud-muted truncate">
            {faction.name}
          </span>
        )}
        {passed && (
          <span className="text-[10px] uppercase tracking-wider text-hud-danger">
            PASSED
          </span>
        )}
      </div>
    </div>
  );
}
