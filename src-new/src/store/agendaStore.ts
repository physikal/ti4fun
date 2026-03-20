import { create } from "zustand";

export type VoteType = "forAgainst" | "electPlayer" | "custom";

export interface PlayerVote {
  playerId: number;
  influence: number;
}

export interface VoteOption {
  label: string;
  totalInfluence: number;
  votes: PlayerVote[];
}

type ComplexVotingStep =
  | "pickType"
  | "addOptions"
  | "voting"
  | "results";

interface AgendaState {
  active: boolean;
  voteType: VoteType | null;
  options: VoteOption[];
  step: ComplexVotingStep;
  currentVoterIndex: number;
  voterOrder: number[];
  selectedOptionIndex: number | null;
  pendingInfluence: number;
  agendaNumber: 1 | 2;
  customOptionInput: string;
}

interface AgendaActions {
  startComplexVote: () => void;
  exitComplexVote: () => void;
  pickVoteType: (
    type: VoteType,
    players: { id: number; name: string }[],
    speakerId: number,
  ) => void;
  addCustomOption: (label: string) => void;
  removeOption: (index: number) => void;
  setCustomOptionInput: (value: string) => void;
  beginVoting: () => void;
  selectOption: (index: number) => void;
  keypadInput: (value: number) => void;
  keypadClear: () => void;
  confirmVote: () => void;
  abstainVote: () => void;
  resolveVote: () => void;
  nextAgenda: () => void;
  resetAgenda: () => void;
}

export type AgendaStore = AgendaState & AgendaActions;

function createInitialAgendaState(): AgendaState {
  return {
    active: false,
    voteType: null,
    options: [],
    step: "pickType",
    currentVoterIndex: 0,
    voterOrder: [],
    selectedOptionIndex: null,
    pendingInfluence: 0,
    agendaNumber: 1,
    customOptionInput: "",
  };
}

function buildVoterOrder(
  playerCount: number,
  speakerId: number,
): number[] {
  const order: number[] = [];
  for (let i = 0; i < playerCount; i++) {
    order.push((speakerId + i) % playerCount);
  }
  return order;
}

export const useAgendaStore = create<AgendaStore>()((set, get) => ({
  ...createInitialAgendaState(),

  startComplexVote: () =>
    set({ active: true, step: "pickType", voteType: null }),

  exitComplexVote: () => set(createInitialAgendaState()),

  pickVoteType: (type, players, speakerId) => {
    const playerCount = players.length;
    const voterOrder = buildVoterOrder(playerCount, speakerId);

    if (type === "forAgainst") {
      set({
        voteType: type,
        step: "voting",
        voterOrder,
        currentVoterIndex: 0,
        selectedOptionIndex: null,
        pendingInfluence: 0,
        options: [
          { label: "For", totalInfluence: 0, votes: [] },
          { label: "Against", totalInfluence: 0, votes: [] },
        ],
      });
      return;
    }

    if (type === "electPlayer") {
      const opts: VoteOption[] = players.map((p) => ({
        label: p.name,
        totalInfluence: 0,
        votes: [],
      }));
      set({
        voteType: type,
        step: "voting",
        voterOrder,
        currentVoterIndex: 0,
        selectedOptionIndex: null,
        pendingInfluence: 0,
        options: opts,
      });
      return;
    }

    set({
      voteType: type,
      step: "addOptions",
      voterOrder,
      currentVoterIndex: 0,
      selectedOptionIndex: null,
      pendingInfluence: 0,
      options: [],
      customOptionInput: "",
    });
  },

  addCustomOption: (label) => {
    const trimmed = label.trim();
    if (trimmed.length === 0) return;
    const existing = get().options;
    if (existing.some((o) => o.label === trimmed)) return;
    set({
      options: [
        ...existing,
        { label: trimmed, totalInfluence: 0, votes: [] },
      ],
      customOptionInput: "",
    });
  },

  removeOption: (index) =>
    set((s) => ({
      options: s.options.filter((_, i) => i !== index),
    })),

  setCustomOptionInput: (value) =>
    set({ customOptionInput: value }),

  beginVoting: () => {
    if (get().options.length < 2) return;
    set({
      step: "voting",
      currentVoterIndex: 0,
      selectedOptionIndex: null,
      pendingInfluence: 0,
    });
  },

  selectOption: (index) =>
    set({ selectedOptionIndex: index, pendingInfluence: 0 }),

  keypadInput: (value) =>
    set((s) => ({
      pendingInfluence: s.pendingInfluence + value,
    })),

  keypadClear: () => set({ pendingInfluence: 0 }),

  confirmVote: () => {
    const state = get();
    const { selectedOptionIndex, pendingInfluence } = state;
    if (selectedOptionIndex === null) return;

    const voterId =
      state.voterOrder[state.currentVoterIndex];
    if (voterId === undefined) return;

    const newOptions = state.options.map((opt, i) => {
      if (i !== selectedOptionIndex) return opt;
      const newVotes = [
        ...opt.votes,
        { playerId: voterId, influence: pendingInfluence },
      ];
      let total = 0;
      for (const v of newVotes) {
        total += v.influence;
      }
      return { ...opt, totalInfluence: total, votes: newVotes };
    });

    const nextVoterIndex = state.currentVoterIndex + 1;
    const allVoted = nextVoterIndex >= state.voterOrder.length;

    set({
      options: newOptions,
      currentVoterIndex: nextVoterIndex,
      selectedOptionIndex: null,
      pendingInfluence: 0,
      step: allVoted ? "results" : "voting",
    });
  },

  abstainVote: () => {
    const state = get();
    const nextVoterIndex = state.currentVoterIndex + 1;
    const allVoted = nextVoterIndex >= state.voterOrder.length;

    set({
      currentVoterIndex: nextVoterIndex,
      selectedOptionIndex: null,
      pendingInfluence: 0,
      step: allVoted ? "results" : "voting",
    });
  },

  resolveVote: () => {
    const state = get();
    if (state.agendaNumber === 1) {
      set({
        step: "pickType",
        voteType: null,
        options: [],
        currentVoterIndex: 0,
        selectedOptionIndex: null,
        pendingInfluence: 0,
        agendaNumber: 2,
      });
    } else {
      set(createInitialAgendaState());
    }
  },

  nextAgenda: () => {
    if (get().agendaNumber === 1) {
      set({
        step: "pickType",
        voteType: null,
        options: [],
        currentVoterIndex: 0,
        selectedOptionIndex: null,
        pendingInfluence: 0,
        agendaNumber: 2,
      });
    }
  },

  resetAgenda: () => set(createInitialAgendaState()),
}));
