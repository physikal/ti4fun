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
    primary:
      "Gain 3 command tokens. Then, spend any amount of influence to gain 1 command token for every 3 influence spent.",
    secondary:
      "Spend any amount of influence to gain 1 command token for every 3 influence spent.",
  },
  {
    index: 2,
    name: "Diplomacy",
    color: "#ea580c",
    primary:
      "Choose 1 system other than the Mecatol Rex system that contains a planet you control; each other player places a command token from their reinforcements in that system. Then, ready each exhausted planet you control in that system.",
    secondary:
      "Spend 1 token from your strategy pool to ready up to 2 exhausted planets you control.",
  },
  {
    index: 3,
    name: "Politics",
    color: "#eab308",
    primary:
      "Choose a player other than the speaker (including yourself); that player gains the speaker token. Draw 2 action cards. Look at the top 2 cards of the agenda deck, place 1 on top and 1 on the bottom.",
    secondary:
      "Spend 1 token from your strategy pool to draw 2 action cards.",
  },
  {
    index: 4,
    name: "Construction",
    color: "#16a34a",
    primary:
      "Place 1 PDS or 1 space dock on a planet you control. Then, place 1 PDS on a planet you control.",
    secondary:
      "Spend 1 token from your strategy pool and place it in any system; you may then place 1 structure on a planet you control in that system.",
  },
  {
    index: 5,
    name: "Trade",
    color: "#06b6d4",
    primary:
      "Gain 3 trade goods. Replenish commodities. Then, choose any number of other players. Those players use the secondary ability of this strategy card without spending a command token.",
    secondary:
      "Spend 1 token from your strategy pool to replenish your commodities. Then, you may spend any number of commodities to gain an equal number of trade goods.",
  },
  {
    index: 6,
    name: "Warfare",
    color: "#3b82f6",
    primary:
      "Remove 1 of your command tokens from the game board; then, gain that command token. You may redistribute your command tokens.",
    secondary:
      "Spend 1 token from your strategy pool to use the PRODUCTION ability of 1 of your space docks in your home system.",
  },
  {
    index: 7,
    name: "Technology",
    color: "#2563eb",
    primary:
      "Research 1 technology. Then, you may spend 6 resources to research 1 additional technology.",
    secondary:
      "Spend 1 token from your strategy pool and 4 resources to research 1 technology.",
  },
  {
    index: 8,
    name: "Imperial",
    color: "#9333ea",
    primary:
      "Immediately score 1 public objective if you fulfill its requirements. Then, if you control Mecatol Rex, gain 1 victory point. Then, if you have 3 or fewer secret objectives, draw 1 secret objective.",
    secondary:
      "Spend 1 token from your strategy pool to draw 1 secret objective.",
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
