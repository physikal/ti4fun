import { useGameStore } from "src/store/gameStore";
import { useAgendaStore } from "src/store/agendaStore";
import { VoteTypePicker } from "src/components/agenda/VoteTypePicker";
import { OptionBuilder } from "src/components/agenda/OptionBuilder";
import { VotingPanel } from "src/components/agenda/VotingPanel";
import { VoteResults } from "src/components/agenda/VoteResults";

export function ComplexVoting() {
  const players = useGameStore((s) => s.players);
  const speakerId = useGameStore((s) => s.speakerId);
  const startNewRound = useGameStore((s) => s.startNewRound);

  const step = useAgendaStore((s) => s.step);
  const agendaNumber = useAgendaStore((s) => s.agendaNumber);
  const resolveVote = useAgendaStore((s) => s.resolveVote);
  const pickVoteType = useAgendaStore((s) => s.pickVoteType);

  function handlePickType(
    type: "forAgainst" | "electPlayer" | "custom",
  ) {
    const playerInfos = players.map((p) => ({
      id: p.id,
      name:
        p.name.length > 0
          ? p.name
          : `Player ${String(p.id + 1)}`,
    }));
    pickVoteType(type, playerInfos, speakerId ?? 0);
  }

  function handleResolve() {
    if (agendaNumber === 2) {
      resolveVote();
      startNewRound();
    } else {
      resolveVote();
    }
  }

  if (step === "pickType") {
    return <VoteTypePicker onPick={handlePickType} />;
  }

  if (step === "addOptions") {
    return <OptionBuilder />;
  }

  if (step === "voting") {
    return <VotingPanel />;
  }

  if (step === "results") {
    return <VoteResults onResolve={handleResolve} />;
  }

  return null;
}
