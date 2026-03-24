import { useGameStore } from "src/store/gameStore";
import { HudPanel } from "src/components/layout/HudPanel";
import { HudButton } from "src/components/layout/HudButton";
import { t } from "src/i18n/index";

export function SimpleVoting() {
  const simpleAgendaStep = useGameStore((s) => s.simpleAgendaStep);
  const votesFor = useGameStore((s) => s.votesFor);
  const votesAgainst = useGameStore((s) => s.votesAgainst);
  const simpleVote = useGameStore((s) => s.simpleVote);
  const simpleAgendaNext = useGameStore((s) => s.simpleAgendaNext);

  return (
    <>
      <div className="grid grid-cols-2 gap-6 w-full max-w-md">
        <HudPanel className="flex flex-col items-center gap-3 p-5">
          <span className="text-sm font-bold text-green-400 uppercase tracking-wider">
            {t("voteFor")}
          </span>
          <span className="text-4xl font-mono font-bold">
            {votesFor}
          </span>
          <div className="flex gap-2">
            <HudButton
              size="sm"
              onClick={() => simpleVote("for", -1)}
            >
              -1
            </HudButton>
            <HudButton
              size="sm"
              onClick={() => simpleVote("for", 1)}
            >
              +1
            </HudButton>
            <HudButton
              size="sm"
              onClick={() => simpleVote("for", 5)}
            >
              +5
            </HudButton>
          </div>
        </HudPanel>

        <HudPanel className="flex flex-col items-center gap-3 p-5">
          <span className="text-sm font-bold text-red-400 uppercase tracking-wider">
            {t("voteAgainst")}
          </span>
          <span className="text-4xl font-mono font-bold">
            {votesAgainst}
          </span>
          <div className="flex gap-2">
            <HudButton
              size="sm"
              onClick={() => simpleVote("against", -1)}
            >
              -1
            </HudButton>
            <HudButton
              size="sm"
              onClick={() => simpleVote("against", 1)}
            >
              +1
            </HudButton>
            <HudButton
              size="sm"
              onClick={() => simpleVote("against", 5)}
            >
              +5
            </HudButton>
          </div>
        </HudPanel>
      </div>

      <div className="flex justify-center p-3 shrink-0">
        <HudButton variant="accent" onClick={simpleAgendaNext}>
          {simpleAgendaStep === 1
            ? `${t("next")}: ${t("secondAgenda")}`
            : `${t("done")} \u2192`}
        </HudButton>
      </div>
    </>
  );
}
