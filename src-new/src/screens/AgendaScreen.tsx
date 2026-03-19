import { useGameStore } from "src/store/gameStore";
import { HudPanel } from "src/components/layout/HudPanel";
import { HudButton } from "src/components/layout/HudButton";
import { PhaseHeader } from "src/components/layout/PhaseHeader";
import { t } from "src/i18n/index";

export function AgendaScreen() {
  const locale = useGameStore((s) => s.locale);
  const simpleAgendaStep = useGameStore((s) => s.simpleAgendaStep);
  const votesFor = useGameStore((s) => s.votesFor);
  const votesAgainst = useGameStore((s) => s.votesAgainst);
  const simpleVote = useGameStore((s) => s.simpleVote);
  const simpleAgendaNext = useGameStore((s) => s.simpleAgendaNext);
  const simpleAgendaBack = useGameStore((s) => s.simpleAgendaBack);

  const agendaLabel =
    simpleAgendaStep === 1
      ? t("firstAgenda", locale)
      : t("secondAgenda", locale);

  return (
    <div className="flex flex-col h-full screen-fade-in">
      <PhaseHeader onBack={simpleAgendaBack} />

      <div className="flex-1 flex flex-col items-center justify-center gap-6 p-4">
        <h2 className="text-xl font-bold text-hud-accent">{agendaLabel}</h2>

        <div className="grid grid-cols-2 gap-6 w-full max-w-md">
          {/* FOR */}
          <HudPanel className="flex flex-col items-center gap-3 p-5">
            <span className="text-sm font-bold text-green-400 uppercase tracking-wider">
              {t("voteFor", locale)}
            </span>
            <span className="text-4xl font-mono font-bold">{votesFor}</span>
            <div className="flex gap-2">
              <HudButton size="sm" onClick={() => simpleVote("for", -1)}>
                -1
              </HudButton>
              <HudButton size="sm" onClick={() => simpleVote("for", 1)}>
                +1
              </HudButton>
              <HudButton size="sm" onClick={() => simpleVote("for", 5)}>
                +5
              </HudButton>
            </div>
          </HudPanel>

          {/* AGAINST */}
          <HudPanel className="flex flex-col items-center gap-3 p-5">
            <span className="text-sm font-bold text-red-400 uppercase tracking-wider">
              {t("voteAgainst", locale)}
            </span>
            <span className="text-4xl font-mono font-bold">
              {votesAgainst}
            </span>
            <div className="flex gap-2">
              <HudButton size="sm" onClick={() => simpleVote("against", -1)}>
                -1
              </HudButton>
              <HudButton size="sm" onClick={() => simpleVote("against", 1)}>
                +1
              </HudButton>
              <HudButton size="sm" onClick={() => simpleVote("against", 5)}>
                +5
              </HudButton>
            </div>
          </HudPanel>
        </div>
      </div>

      <div className="flex justify-center p-3 border-t border-hud-border/20 shrink-0">
        <HudButton variant="accent" onClick={simpleAgendaNext}>
          {simpleAgendaStep === 1
            ? `${t("next", locale)}: ${t("secondAgenda", locale)}`
            : `${t("done", locale)} →`}
        </HudButton>
      </div>
    </div>
  );
}
