export interface StrategyCard {
  index: number;
  name: string;
  color: string;
  primary: string;
  secondary: string;
}

export const STRATEGY_CARDS: StrategyCard[] = [
  {
    index: 1,
    name: "Leadership",
    color: "#dc2626",
    primary: "Gain 3 command tokens.",
    secondary: "Spend influence to gain 1 command token.",
  },
  {
    index: 2,
    name: "Diplomacy",
    color: "#ea580c",
    primary:
      "Choose a system; others place command tokens there. Ready your planets in that system.",
    secondary: "Spend 1 token to ready up to 2 exhausted planets.",
  },
  {
    index: 3,
    name: "Politics",
    color: "#eab308",
    primary:
      "Choose new speaker. Draw 2 action cards. Look at top 2 agenda cards.",
    secondary: "Spend 1 token to draw 2 action cards.",
  },
  {
    index: 4,
    name: "Construction",
    color: "#16a34a",
    primary:
      "Place 1 PDS or space dock, then place 1 PDS on a planet you control.",
    secondary: "Spend 1 token + resources to place 1 structure.",
  },
  {
    index: 5,
    name: "Trade",
    color: "#06b6d4",
    primary:
      "Gain 3 trade goods. Replenish commodities for yourself and chosen players.",
    secondary: "Spend 1 token to replenish your commodities.",
  },
  {
    index: 6,
    name: "Warfare",
    color: "#3b82f6",
    primary:
      "Remove a command token from the board. Redistribute your command tokens.",
    secondary: "Spend 1 token to use a space dock's PRODUCTION.",
  },
  {
    index: 7,
    name: "Technology",
    color: "#2563eb",
    primary:
      "Research 1 technology. May spend 6 resources to research 1 additional.",
    secondary: "Spend 1 token + 4 resources to research 1 technology.",
  },
  {
    index: 8,
    name: "Imperial",
    color: "#9333ea",
    primary:
      "Score 1 public objective. Mecatol Rex = 1 VP. Draw 1 secret objective.",
    secondary: "Spend 1 token to draw 1 secret objective.",
  },
];

export const POLITICS_INDEX = 3;

export function getStrategyName(cardIndex: number): string {
  const card = STRATEGY_CARDS.find((c) => c.index === cardIndex);
  return card ? card.name : "";
}

export function getStrategyColor(cardIndex: number): string {
  const card = STRATEGY_CARDS.find((c) => c.index === cardIndex);
  return card ? card.color : "#666";
}

export function getStrategyCard(
  cardIndex: number,
): StrategyCard | undefined {
  return STRATEGY_CARDS.find((c) => c.index === cardIndex);
}
