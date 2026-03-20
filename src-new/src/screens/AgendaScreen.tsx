import { useGameStore } from "src/store/gameStore";
import { useAgendaStore } from "src/store/agendaStore";
import { HudButton } from "src/components/layout/HudButton";
import { PhaseHeader } from "src/components/layout/PhaseHeader";
import { t } from "src/i18n/index";
import { SimpleVoting } from "src/components/agenda/SimpleVoting";
import { ComplexVoting } from "src/components/agenda/ComplexVoting";

export function AgendaScreen() {
  const locale = useGameStore((s) => s.locale);
  const simpleAgendaStep = useGameStore((s) => s.simpleAgendaStep);
  const simpleAgendaBack = useGameStore((s) => s.simpleAgendaBack);
  const complexActive = useAgendaStore((s) => s.active);
  const agendaNumber = useAgendaStore((s) => s.agendaNumber);
  const startComplexVote = useAgendaStore((s) => s.startComplexVote);
  const exitComplexVote = useAgendaStore((s) => s.exitComplexVote);

  const agendaLabel = complexActive
    ? agendaNumber === 1
      ? t("firstAgenda", locale)
      : t("secondAgenda", locale)
    : simpleAgendaStep === 1
      ? t("firstAgenda", locale)
      : t("secondAgenda", locale);

  function handleBack() {
    if (complexActive) {
      exitComplexVote();
      return;
    }
    simpleAgendaBack();
  }

  return (
    <div className="flex flex-col h-full screen-fade-in">
      <PhaseHeader onBack={handleBack} />

      <div className="flex-1 flex flex-col items-center gap-4 p-4 overflow-y-auto">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-hud-accent">
            {agendaLabel}
          </h2>
          {!complexActive && (
            <HudButton size="sm" onClick={startComplexVote}>
              {t("complexVoting", locale)}
            </HudButton>
          )}
          {complexActive && (
            <HudButton size="sm" onClick={exitComplexVote}>
              {t("simpleVoting", locale)}
            </HudButton>
          )}
        </div>

        {complexActive ? <ComplexVoting /> : <SimpleVoting />}
      </div>
    </div>
  );
}
