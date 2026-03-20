import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  GameState,
  GameOptions,
  GameLogEntry,
  Player,
  StrategySlot,
  Phase,
  Screen,
  Locale,
  PlayerColor,
  ActionSnapshot,
  ModalState,
  StrategyStatus,
} from "src/store/types";
import {
  STRATEGY_CARDS,
  POLITICS_INDEX,
  getStrategyName,
} from "src/data/strategyCards";
import {
  NAALU_ID,
  HACAN_ID,
  WINNU_ID,
  FIRMAMENT_ID,
  RAL_NEL_ID,
  OBSIDIAN_ID,
} from "src/data/factions";
import { getPlayerDisplayName } from "src/store/selectors";

const MAX_LOG_ENTRIES = 500;
let logIdCounter = 0;

function playerName(player: Player | undefined | null): string {
  if (!player) return "?";
  return getPlayerDisplayName(player, "en");
}

function createSnapshot(state: GameState): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(state)) {
    if (key !== "modal" && key !== "gameLog" && typeof value !== "function") {
      result[key] = value;
    }
  }
  return result;
}

function logAction(
  get: () => GameStore,
  set: (partial: Partial<GameState>) => void,
  description: string,
): void {
  const state = get();
  const entry: GameLogEntry = {
    id: ++logIdCounter,
    timestamp: Date.now(),
    round: state.round,
    phase: state.phase,
    description,
    snapshot: createSnapshot(state),
  };
  const log = [...state.gameLog, entry];
  if (log.length > MAX_LOG_ENTRIES) {
    log.splice(0, log.length - MAX_LOG_ENTRIES);
  }
  set({ gameLog: log });
}

function createDefaultOptions(): GameOptions {
  return {
    fullscreen: false,
    inactivityMinutes: 15,
    resetTimerPerTurn: true,
    vpLimit: 10,
  };
}

function createInitialSlots(): StrategySlot[] {
  return STRATEGY_CARDS.map((card) => ({
    cardIndex: card.index,
    playerId: null,
    secondPickPlayerId: null,
    status: "available" as StrategyStatus,
    tradeGoods: 0,
  }));
}

function createInitialState(): GameState {
  return {
    phase: "INIT",
    screen: "start",
    round: 0,
    roundCounter: 1,
    players: [],
    playerCount: 6,
    speakerId: null,
    previousSpeakerId: null,
    activeSlotIndex: 0,
    strategySlots: createInitialSlots(),
    strategyHistory: [],
    playerChooseCount: 0,
    endOfStrategyPhase: false,
    naaluStrategyIndex: null,
    telepathicPlayerId: null,
    actionHistory: [],
    mecatolScored: false,
    agendaPhase: 0,
    agendaStep: 1,
    simpleAgendaStep: 1,
    votesFor: 0,
    votesAgainst: 0,
    lastActivitySec: 0,
    gameElapsedSec: 0,
    currentPlayerTimerSec: 0,
    clockRunning: false,
    locale: "en",
    modal: null,
    gameLog: [],
    options: createDefaultOptions(),
  };
}

interface GameActions {
  setScreen: (screen: Screen) => void;
  setPhase: (phase: Phase) => void;
  setLocale: (locale: Locale) => void;
  setModal: (modal: ModalState | null) => void;
  setOptions: (options: Partial<GameOptions>) => void;
  setPlayerCount: (count: number) => void;

  setupPlayer: (
    index: number,
    factionId: number,
    color: PlayerColor,
    name: string,
  ) => void;
  initializePlayers: () => void;
  startGame: () => void;
  loadSavedGame: () => boolean;

  setSpeaker: (playerId: number) => void;
  randomSpeaker: () => void;
  confirmSpeaker: () => void;

  initStrategyPhase: () => void;
  assignStrategy: (slotIndex: number) => void;
  undoStrategy: () => void;
  endStrategyPhase: () => void;
  setTelepathicTarget: (playerId: number) => void;
  swapStrategies: (slotA: number, slotB: number) => void;

  initActionPhase: () => void;
  resolveAction: (actions: {
    strategy1: boolean;
    strategy2: boolean;
    pass: boolean;
    tactical: boolean;
  }) => void;
  nextPlayerAction: () => void;
  undoAction: () => void;

  transformFirmament: () => void;
  ralNelUnpass: () => void;

  goToStatusPhase: () => void;
  statusNext: () => void;
  statusBack: () => void;
  toggleMecatol: () => void;

  goToAgendaPhase: () => void;
  simpleVote: (side: "for" | "against", amount: number) => void;
  simpleAgendaNext: () => void;
  simpleAgendaBack: () => void;

  startNewRound: () => void;
  goToEndGame: () => void;

  resetActivity: () => void;
  tick: () => void;
  toggleClock: () => void;
  startClock: () => void;
  stopClock: () => void;

  rewindToEntry: (entryId: number) => void;
  resetGame: () => void;
  exportGame: () => string;
  importGame: (json: string) => boolean;
}

export type GameStore = GameState & GameActions;

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      ...createInitialState(),

      setScreen: (screen) => set({ screen }),
      setPhase: (phase) => set({ phase }),
      setLocale: (locale) => set({ locale }),
      setModal: (modal) => set({ modal }),
      setOptions: (opts) =>
        set((s) => ({ options: { ...s.options, ...opts } })),
      setPlayerCount: (count) => set({ playerCount: count }),

      setupPlayer: (index, factionId, color, name) =>
        set((state) => {
          const players = [...state.players];
          players[index] = {
            id: index,
            factionId,
            color,
            name,
            clockMs: 0,
            speakerCount: 0,
            influence: 0,
            vp: 0,
          };
          return { players };
        }),

      initializePlayers: () =>
        set((state) => {
          const players: Player[] = [];
          for (let i = 0; i < state.playerCount; i++) {
            players.push(
              state.players[i] ?? {
                id: i,
                factionId: 0,
                color: "black",
                name: "",
                clockMs: 0,
                speakerCount: 0,
                influence: 0,
                vp: 0,
              },
            );
          }
          return { players };
        }),

      startGame: () => {
        set({
          phase: "STRATEGY",
          screen: "strategy",
          round: 1,
          roundCounter: 1,
          clockRunning: true,
          lastActivitySec: 0,
          gameElapsedSec: 0,
          currentPlayerTimerSec: 0,
          strategySlots: createInitialSlots(),
          actionHistory: [],
          strategyHistory: [],
          gameLog: [],
        });
        logAction(get, set, "Game started");
      },

      loadSavedGame: () => {
        const state = get();
        if (state.phase === "INIT") return false;
        return true;
      },

      setSpeaker: (playerId) =>
        set({ speakerId: playerId }),

      randomSpeaker: () =>
        set((state) => ({
          speakerId: Math.floor(Math.random() * state.playerCount),
        })),

      confirmSpeaker: () => {
        const state = get();
        const speaker = state.players[state.speakerId ?? 0];
        set({ modal: null });
        logAction(get, set, `Speaker: ${playerName(speaker)}`);
        get().resetActivity();
        if (state.phase === "STRATEGY") {
          get().initStrategyPhase();
        } else if (state.phase === "ACTION") {
          get().nextPlayerAction();
        }
      },

      initStrategyPhase: () =>
        set((state) => {
          const speakerId = state.speakerId ?? 0;
          const slots = createInitialSlots();
          for (let i = 0; i < slots.length; i++) {
            const s = slots[i];
            if (s) s.tradeGoods = state.strategySlots[i]?.tradeGoods ?? 0;
          }
          return {
            phase: "STRATEGY",
            screen: "strategy",
            activeSlotIndex: 0,
            strategySlots: slots,
            strategyHistory: [],
            playerChooseCount: 0,
            endOfStrategyPhase: false,
            naaluStrategyIndex: null,
            telepathicPlayerId: null,
            currentPlayerTimerSec: 0,
            _currentChooser: speakerId,
          } as Partial<GameState> & { _currentChooser: number };
        }),

      assignStrategy: (slotIndex) => {
        const prevCount = get().playerChooseCount;
        set((state) => {
          const currentChooser =
            (state as GameState & { _currentChooser?: number })
              ._currentChooser ?? state.speakerId ?? 0;

          const slots = state.strategySlots.map((s) => ({ ...s }));
          const slot = slots[slotIndex];
          if (!slot || slot.status !== "available" || slot.playerId !== null)
            return {};

          slot.playerId = currentChooser;
          slot.status = "available";
          if (slot.tradeGoods > 0) slot.tradeGoods = 0;

          const newCount = state.playerChooseCount + 1;
          const history = [...state.strategyHistory, slotIndex];

          const maxPicks =
            state.playerCount <= 4
              ? state.playerCount * 2
              : state.playerCount;
          const isEnd = newCount >= maxPicks;

          let nextChooser = currentChooser;
          if (!isEnd) {
            nextChooser = (currentChooser + 1) % state.playerCount;
          }

          const player = state.players[currentChooser];
          const updatedPlayers = state.players.map((p) =>
            p.id === currentChooser
              ? {
                  ...p,
                  clockMs:
                    p.clockMs + state.currentPlayerTimerSec * 1000,
                }
              : p,
          );

          const hasNaalu = state.players.some(
            (p) => p.factionId === NAALU_ID,
          );
          let naaluIdx = state.naaluStrategyIndex;
          if (
            hasNaalu &&
            player &&
            player.factionId === NAALU_ID
          ) {
            naaluIdx = slotIndex;
          }

          return {
            strategySlots: slots,
            playerChooseCount: newCount,
            strategyHistory: history,
            endOfStrategyPhase: isEnd,
            naaluStrategyIndex: naaluIdx,
            currentPlayerTimerSec: 0,
            players: updatedPlayers,
            _currentChooser: nextChooser,
          } as Partial<GameState> & { _currentChooser: number };
        });
        if (get().playerChooseCount > prevCount) {
          const s = get();
          const slot = s.strategySlots[slotIndex];
          const picker = slot?.playerId !== null
            ? s.players[slot?.playerId ?? 0]
            : null;
          const cardName = getStrategyName(
            slot?.cardIndex ?? 0,
            "en",
          );
          logAction(
            get,
            set,
            `${playerName(picker)} picks ${cardName}`,
          );
          get().resetActivity();
        }
      },

      undoStrategy: () => {
        set((state) => {
          if (state.strategyHistory.length === 0) return {};
          const history = [...state.strategyHistory];
          const lastPick = history.pop()!;

          const slots = state.strategySlots.map((s) => ({ ...s }));
          const slot = slots[lastPick];
          if (slot) {
            slot.playerId = null;
            slot.status = "available";
          }

          const currentChooser =
            (state as GameState & { _currentChooser?: number })
              ._currentChooser ?? state.speakerId ?? 0;
          const prevChooser =
            state.endOfStrategyPhase
              ? currentChooser
              : (currentChooser - 1 + state.playerCount) %
                state.playerCount;

          return {
            strategySlots: slots,
            playerChooseCount: state.playerChooseCount - 1,
            strategyHistory: history,
            endOfStrategyPhase: false,
            currentPlayerTimerSec: 0,
            _currentChooser: prevChooser,
          } as Partial<GameState> & { _currentChooser: number };
        });
        logAction(get, set, "Undo strategy pick");
        get().resetActivity();
      },

      endStrategyPhase: () => {
        const state = get();
        if (!state.endOfStrategyPhase) return;
        set({ endOfStrategyPhase: false });
        const slots = state.strategySlots.map((s) => ({ ...s }));

        for (const slot of slots) {
          if (slot.playerId === null && slot.status === "available") {
            slot.tradeGoods += 1;
            slot.status = "disabled";
          }
        }

        set({ strategySlots: slots });
        logAction(get, set, "Strategy phase ends");
        get().resetActivity();

        const hasNaalu = state.players.some(
          (p) => p.factionId === NAALU_ID,
        );
        const hasHacan = state.players.some(
          (p) => p.factionId === HACAN_ID,
        );
        const hasWinnu = state.players.some(
          (p) => p.factionId === WINNU_ID,
        );

        if (hasHacan || hasWinnu || hasNaalu) {
          set({
            modal: { type: "strategyEffect" },
          });
          return;
        }

        get().initActionPhase();
      },

      setTelepathicTarget: (playerId) => {
        const targetName = playerName(get().players[playerId]);
        set((state) => {
          let targetSlot = -1;
          for (let i = 0; i < state.strategySlots.length; i++) {
            if (state.strategySlots[i]?.playerId === playerId) {
              targetSlot = i;
              break;
            }
          }
          return {
            telepathicPlayerId: playerId,
            naaluStrategyIndex: targetSlot >= 0 ? targetSlot : null,
            modal: null,
          };
        });
        logAction(
          get,
          set,
          `Naalu telepathic -> ${targetName}`,
        );
        get().resetActivity();
      },

      swapStrategies: (slotA, slotB) => {
        const before = get().strategySlots;
        const nameA = getStrategyName(
          before[slotA]?.cardIndex ?? 0,
          "en",
        );
        const nameB = getStrategyName(
          before[slotB]?.cardIndex ?? 0,
          "en",
        );
        set((state) => {
          const slots = state.strategySlots.map((s) => ({ ...s }));
          const a = slots[slotA];
          const b = slots[slotB];
          if (!a || !b) return {};
          const tmpPlayer = a.playerId;
          a.playerId = b.playerId;
          b.playerId = tmpPlayer;
          return { strategySlots: slots };
        });
        logAction(get, set, `Swap ${nameA} <-> ${nameB}`);
      },

      initActionPhase: () =>
        set((state) => {
          const slots = state.strategySlots.map((s) => ({ ...s }));

          if (state.playerCount <= 4) {
            for (let i = 0; i < slots.length; i++) {
              const slot = slots[i];
              if (!slot || slot.playerId === null) continue;
              for (let j = i + 1; j < slots.length; j++) {
                const other = slots[j];
                if (other && other.playerId === slot.playerId) {
                  other.secondPickPlayerId = other.playerId;
                  other.playerId = null;
                }
              }
            }
          }

          for (const slot of slots) {
            if (slot.playerId === null && slot.secondPickPlayerId === null) {
              slot.status = "disabled";
            }
          }

          let firstSlot = 0;
          while (
            firstSlot < slots.length &&
            (slots[firstSlot]?.playerId === null)
          ) {
            firstSlot++;
          }

          return {
            phase: "ACTION",
            screen: "action",
            strategySlots: slots,
            activeSlotIndex: firstSlot,
            actionHistory: [],
            roundCounter: 1,
            currentPlayerTimerSec: 0,
            modal: null,
          };
        }),

      resolveAction: (actions) => {
        const preState = get();
        const activeSlot = preState.strategySlots[preState.activeSlotIndex];
        const actingPlayer = activeSlot?.playerId !== null
          ? playerName(preState.players[activeSlot?.playerId ?? 0])
          : "?";
        let actionType = "Tactical";
        if (actions.pass) actionType = "Pass";
        else if (actions.strategy1) {
          actionType = getStrategyName(
            activeSlot?.cardIndex ?? 0,
            "en",
          );
        }

        set((state) => {
          const slots = state.strategySlots.map((s) => ({ ...s }));
          const slot = slots[state.activeSlotIndex];
          if (!slot) return {};

          const snapshot: ActionSnapshot = {
            activeSlotIndex: state.activeSlotIndex,
            strategyStatuses: state.strategySlots.map((s) => s.status),
            roundCounter: state.roundCounter,
          };

          if (actions.strategy1 && slot.status === "available") {
            slot.status = "played";
          }

          if (actions.strategy2 && state.playerCount <= 4) {
            const secondSlot = slots.find(
              (s) => s.secondPickPlayerId === slot.playerId,
            );
            if (secondSlot && secondSlot.status === "available") {
              secondSlot.status = "played";
            }
          }

          if (actions.pass) {
            if (state.playerCount <= 4) {
              const secondSlot = slots.find(
                (s) => s.secondPickPlayerId === slot.playerId,
              );
              if (
                slot.status === "played" &&
                (!secondSlot || secondSlot.status === "played")
              ) {
                slot.status = "passed";
                if (secondSlot) secondSlot.status = "passed";
              }
            } else {
              slot.status = "passed";
            }
          }

          const showSpeaker =
            actions.strategy1 && slot.cardIndex === POLITICS_INDEX;

          const player = slot.playerId !== null
            ? state.players[slot.playerId]
            : null;
          const updatedPlayers = state.players.map((p) =>
            player && p.id === player.id
              ? {
                  ...p,
                  clockMs:
                    p.clockMs + state.currentPlayerTimerSec * 1000,
                }
              : p,
          );

          // Advance to next player within the same set() call
          // so we operate on the updated slots
          let nextSlot = state.activeSlotIndex;
          let rounds = state.roundCounter;
          if (!showSpeaker) {
            let safeCounter = 0;
            do {
              safeCounter++;
              nextSlot++;
              if (nextSlot >= slots.length) {
                nextSlot = 0;
                rounds++;
              }
            } while (
              safeCounter < 10 &&
              (() => {
                const s = slots[nextSlot];
                return (
                  !s ||
                  s.playerId === null ||
                  (s.status !== "available" && s.status !== "played")
                );
              })()
            );

            if (safeCounter >= 10) {
              return {
                phase: "STATUS" as const,
                screen: "status" as const,
                strategySlots: slots,
                actionHistory: [...state.actionHistory, snapshot],
                currentPlayerTimerSec: 0,
                players: updatedPlayers,
                roundCounter: rounds,
                modal: null,
              };
            }
          }

          return {
            strategySlots: slots,
            actionHistory: [...state.actionHistory, snapshot],
            currentPlayerTimerSec: 0,
            players: updatedPlayers,
            modal: showSpeaker ? { type: "speaker" } : null,
            activeSlotIndex: nextSlot,
            roundCounter: rounds,
          };
        });
        logAction(
          get,
          set,
          `${actingPlayer}: ${actionType}`,
        );
        get().resetActivity();
      },

      nextPlayerAction: () =>
        set((state) => {
          let nextSlot = state.activeSlotIndex;
          let rounds = state.roundCounter;
          let safeCounter = 0;

          do {
            safeCounter++;
            nextSlot++;
            if (nextSlot >= state.strategySlots.length) {
              nextSlot = 0;
              rounds++;
            }
          } while (
            safeCounter < 10 &&
            (() => {
              const s = state.strategySlots[nextSlot];
              return (
                !s ||
                s.playerId === null ||
                (s.status !== "available" && s.status !== "played")
              );
            })()
          );

          if (safeCounter >= 10) {
            return {
              phase: "STATUS",
              screen: "status",
              roundCounter: rounds,
            };
          }

          return {
            activeSlotIndex: nextSlot,
            roundCounter: rounds,
            currentPlayerTimerSec: 0,
          };
        }),

      undoAction: () => {
        set((state) => {
          if (state.actionHistory.length === 0) return {};
          const history = [...state.actionHistory];
          const snapshot = history.pop()!;

          const slots = state.strategySlots.map((s, i) => ({
            ...s,
            status: snapshot.strategyStatuses[i] ?? s.status,
          }));

          return {
            activeSlotIndex: snapshot.activeSlotIndex,
            roundCounter: snapshot.roundCounter,
            actionHistory: history,
            strategySlots: slots,
            currentPlayerTimerSec: 0,
          };
        });
        logAction(get, set, "Undo action");
        get().resetActivity();
      },

      transformFirmament: () => {
        set((state) => {
          const idx = state.players.findIndex(
            (p) => p.factionId === FIRMAMENT_ID,
          );
          if (idx === -1) return {};
          const players = state.players.map((p) =>
            p.factionId === FIRMAMENT_ID
              ? { ...p, factionId: OBSIDIAN_ID }
              : p,
          );
          return { players };
        });
        logAction(get, set, "Firmament -> Obsidian");
      },

      ralNelUnpass: () => {
        set((state) => {
          const ralNelPlayer = state.players.find(
            (p) => p.factionId === RAL_NEL_ID,
          );
          if (!ralNelPlayer) return {};

          const slots = state.strategySlots.map((s) => {
            if (
              s.playerId === ralNelPlayer.id &&
              s.status === "passed"
            ) {
              return { ...s, status: "played" as StrategyStatus };
            }
            if (
              state.playerCount <= 4 &&
              s.secondPickPlayerId === ralNelPlayer.id &&
              s.status === "passed"
            ) {
              return { ...s, status: "played" as StrategyStatus };
            }
            return s;
          });

          return { strategySlots: slots };
        });
        logAction(get, set, "Ral Nel unpass");
      },

      goToStatusPhase: () =>
        set({
          phase: "STATUS",
          screen: "status",
        }),

      statusNext: () => {
        logAction(get, set, "Status phase complete");
        get().resetActivity();
        const state = get();
        if (state.agendaPhase === 1) {
          get().goToAgendaPhase();
        } else {
          get().startNewRound();
        }
      },

      statusBack: () =>
        set({ screen: "action", phase: "ACTION" }),

      toggleMecatol: () => {
        set((state) => {
          const newScored = !state.mecatolScored;
          return {
            mecatolScored: newScored,
            agendaPhase: newScored ? 1 : 0,
          };
        });
        const scored = get().mecatolScored;
        logAction(
          get,
          set,
          scored ? "Mecatol scored" : "Mecatol unscored",
        );
      },

      goToAgendaPhase: () =>
        set({
          phase: "AGENDA",
          screen: "agenda",
          simpleAgendaStep: 1,
          votesFor: 0,
          votesAgainst: 0,
        }),

      simpleVote: (side, amount) =>
        set((state) => {
          if (side === "for") {
            const val = Math.max(0, state.votesFor + amount);
            return { votesFor: val };
          }
          const val = Math.max(0, state.votesAgainst + amount);
          return { votesAgainst: val };
        }),

      simpleAgendaNext: () => {
        const state = get();
        const step = state.simpleAgendaStep;
        if (step === 1) {
          set({
            simpleAgendaStep: 2,
            votesFor: 0,
            votesAgainst: 0,
          });
        } else {
          get().startNewRound();
        }
        logAction(
          get,
          set,
          `Agenda ${step} resolved`,
        );
        get().resetActivity();
      },

      simpleAgendaBack: () =>
        set((state) => {
          if (state.simpleAgendaStep === 2) {
            return {
              simpleAgendaStep: 1,
              votesFor: 0,
              votesAgainst: 0,
            };
          }
          return { screen: "status", phase: "STATUS" };
        }),

      startNewRound: () => {
        const state = get();
        const newRound = state.round + 1;

        const slots = STRATEGY_CARDS.map((card, i) => ({
          cardIndex: card.index,
          playerId: null as number | null,
          secondPickPlayerId: null as number | null,
          status: "available" as StrategyStatus,
          tradeGoods: state.strategySlots[i]?.tradeGoods ?? 0,
        }));

        const speakerId = state.speakerId ?? 0;

        set({
          phase: "STRATEGY",
          screen: "strategy",
          round: newRound,
          roundCounter: 1,
          strategySlots: slots,
          strategyHistory: [],
          playerChooseCount: 0,
          endOfStrategyPhase: false,
          naaluStrategyIndex: null,
          telepathicPlayerId: null,
          actionHistory: [],
          currentPlayerTimerSec: 0,
          modal: { type: "speaker" },
          _currentChooser: speakerId,
        } as Partial<GameState> & { _currentChooser: number });
        logAction(get, set, `Round ${newRound} begins`);
      },

      goToEndGame: () => {
        set({
          phase: "END",
          screen: "end",
          clockRunning: false,
        });
        logAction(get, set, "Game ends");
      },

      resetActivity: () =>
        set((state) => ({ lastActivitySec: state.gameElapsedSec })),

      tick: () =>
        set((state) => {
          if (!state.clockRunning) return {};

          const elapsed = state.gameElapsedSec + 1;
          const result: Partial<GameState> = {
            gameElapsedSec: elapsed,
            currentPlayerTimerSec: state.currentPlayerTimerSec + 1,
          };

          if (state.phase === "GALAXY") {
            result.lastActivitySec = elapsed;
            return result;
          }

          const threshold = state.options.inactivityMinutes * 60;
          if (threshold <= 0) return result;

          const idle = elapsed - state.lastActivitySec;

          if (idle >= threshold * 2 && state.modal?.type !== "stopAlert") {
            result.clockRunning = false;
            result.modal = { type: "stopAlert" };
          } else if (
            idle >= threshold &&
            idle < threshold * 2 &&
            state.modal === null
          ) {
            result.modal = { type: "inactivity" };
          }

          return result;
        }),

      toggleClock: () =>
        set((state) => ({ clockRunning: !state.clockRunning })),
      startClock: () => set({ clockRunning: true }),
      stopClock: () => set({ clockRunning: false }),

      rewindToEntry: (entryId) => {
        const state = get();
        const idx = state.gameLog.findIndex((e) => e.id === entryId);
        if (idx === -1) return;
        const entry = state.gameLog[idx]!;
        const truncatedLog = state.gameLog.slice(0, idx + 1);
        const restored = {
          ...entry.snapshot,
          gameLog: truncatedLog,
          modal: null,
        } as Partial<GameState>;
        set(restored);
      },

      resetGame: () => set(createInitialState()),

      exportGame: () => {
        const state = get();
        const { modal, ...saveable } = state;
        const stateOnly: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(saveable)) {
          if (typeof value !== "function") {
            stateOnly[key] = value;
          }
        }
        return JSON.stringify(stateOnly, null, 2);
      },

      importGame: (json: string) => {
        try {
          const parsed = JSON.parse(json) as Record<string, unknown>;
          if (!parsed["phase"] || !parsed["players"]) return false;
          const gameLog = (parsed["gameLog"] as GameLogEntry[] | undefined) ?? [];
          const lastActivitySec =
            (parsed["lastActivitySec"] as number | undefined) ??
            ((parsed["gameElapsedSec"] as number | undefined) ?? 0);
          set({
            ...parsed,
            modal: null,
            gameLog,
            lastActivitySec,
          } as Partial<GameState>);
          return true;
        } catch {
          return false;
        }
      },
    }),
    {
      name: "ti4fun-game",
      partialize: (state) => {
        const { modal, ...rest } = state;
        return rest;
      },
    },
  ),
);
