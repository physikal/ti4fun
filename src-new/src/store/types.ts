export type Phase =
  | "INIT"
  | "GALAXY"
  | "STRATEGY"
  | "ACTION"
  | "STATUS"
  | "AGENDA"
  | "END";

export type Screen =
  | "start"
  | "setup"
  | "options"
  | "strategy"
  | "action"
  | "status"
  | "agenda"
  | "end";

export type Locale = "en" | "fr" | "de" | "ru" | "es" | "zh" | "pl";

export type PlayerColor =
  | "black"
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "yellow"
  | "orange"
  | "hotpink";

export const PLAYER_COLORS: PlayerColor[] = [
  "black",
  "blue",
  "green",
  "purple",
  "red",
  "yellow",
  "orange",
  "hotpink",
];

export const PLAYER_COLOR_HEX: Record<PlayerColor, string> = {
  black: "#1a1a2e",
  blue: "#2563eb",
  green: "#16a34a",
  purple: "#9333ea",
  red: "#dc2626",
  yellow: "#eab308",
  orange: "#ea580c",
  hotpink: "#ec4899",
};

export type StrategyStatus =
  | "disabled"
  | "available"
  | "played"
  | "passed";

export interface Player {
  id: number;
  factionId: number;
  color: PlayerColor;
  name: string;
  clockMs: number;
  speakerCount: number;
  influence: number;
  vp: number;
}

export interface StrategySlot {
  cardIndex: number;
  playerId: number | null;
  secondPickPlayerId: number | null;
  status: StrategyStatus;
  tradeGoods: number;
}

export interface ActionSnapshot {
  activeSlotIndex: number;
  strategyStatuses: StrategyStatus[];
  roundCounter: number;
}

export interface ModalState {
  type:
    | "speaker"
    | "telepathic"
    | "strategyEffect"
    | "options"
    | "transition"
    | "inactivity"
    | "stopAlert";
  data?: unknown;
}

export interface GameState {
  phase: Phase;
  screen: Screen;
  round: number;
  roundCounter: number;
  players: Player[];
  playerCount: number;
  speakerId: number | null;
  previousSpeakerId: number | null;
  activeSlotIndex: number;
  strategySlots: StrategySlot[];
  strategyHistory: number[];
  playerChooseCount: number;
  endOfStrategyPhase: boolean;
  naaluStrategyIndex: number | null;
  telepathicPlayerId: number | null;
  actionHistory: ActionSnapshot[];
  mecatolScored: boolean;
  agendaPhase: number;
  agendaStep: 1 | 2;
  simpleAgendaStep: 1 | 2;
  votesFor: number;
  votesAgainst: number;
  gameElapsedSec: number;
  currentPlayerTimerSec: number;
  clockRunning: boolean;
  locale: Locale;
  modal: ModalState | null;
  gameLog: GameLogEntry[];
  options: GameOptions;
}

export interface GameLogEntry {
  id: number;
  timestamp: number;
  round: number;
  phase: Phase;
  description: string;
  snapshot: Record<string, unknown>;
}

export interface GameOptions {
  fullscreen: boolean;
  inactivityMinutes: number;
  resetTimerPerTurn: boolean;
  vpLimit: number;
}
