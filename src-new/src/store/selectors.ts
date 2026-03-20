import type { GameState, Player, StrategySlot } from "src/store/types";
import { FACTIONS, NAALU_ID } from "src/data/factions";

export function getPlayerDisplayName(
  player: Player,
  locale: GameState["locale"],
): string {
  if (player.name.length > 0) return player.name;
  const faction = FACTIONS[player.factionId];
  return faction ? faction.names[locale] : "Unknown";
}

export function getActivePlayerFromSlot(
  state: GameState,
): Player | undefined {
  const slot = state.strategySlots[state.activeSlotIndex];
  if (!slot || slot.playerId === null) return undefined;
  return state.players[slot.playerId];
}

export function getInitiativeOrder(state: GameState): Player[] {
  const seen = new Set<number>();
  const ordered: Player[] = [];
  for (const slot of state.strategySlots) {
    if (slot.playerId !== null && !seen.has(slot.playerId)) {
      seen.add(slot.playerId);
      const player = state.players[slot.playerId];
      if (player) ordered.push(player);
    }
  }
  // Naalu initiative 0: always first
  const naaluIdx = ordered.findIndex((p) => p.factionId === NAALU_ID);
  if (naaluIdx > 0) {
    const naalu = ordered.splice(naaluIdx, 1)[0];
    if (naalu) ordered.unshift(naalu);
  }
  return ordered;
}

export function getActivePlayers(state: GameState): StrategySlot[] {
  return state.strategySlots.filter(
    (s) =>
      s.playerId !== null &&
      (s.status === "available" || s.status === "played"),
  );
}

export function allPlayersPassed(state: GameState): boolean {
  return state.strategySlots.every(
    (s) =>
      s.playerId === null ||
      s.secondPickPlayerId !== null ||
      s.status === "passed" ||
      s.status === "disabled",
  );
}
