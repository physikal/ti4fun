import { useGameStore } from "src/store/gameStore";
import { useAgendaStore } from "src/store/agendaStore";
import { HudPanel } from "src/components/layout/HudPanel";
import { HudButton } from "src/components/layout/HudButton";
import { t } from "src/i18n/index";

export function OptionBuilder() {
  const locale = useGameStore((s) => s.locale);
  const options = useAgendaStore((s) => s.options);
  const customInput = useAgendaStore((s) => s.customOptionInput);
  const setCustomInput = useAgendaStore(
    (s) => s.setCustomOptionInput,
  );
  const addOption = useAgendaStore((s) => s.addCustomOption);
  const removeOption = useAgendaStore((s) => s.removeOption);
  const beginVoting = useAgendaStore((s) => s.beginVoting);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addOption(customInput);
  }

  return (
    <HudPanel className="flex flex-col gap-4 p-6 w-full max-w-md">
      <h3 className="text-lg font-bold text-hud-accent">
        {t("addOption", locale)}
      </h3>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder={t("addOption", locale)}
          className="flex-1 px-3 py-2 bg-black/40 border border-hud-border/40 rounded text-sm text-white placeholder-hud-muted focus:outline-none focus:border-hud-accent/60"
        />
        <HudButton size="sm" type="submit">
          +
        </HudButton>
      </form>

      {options.length > 0 && (
        <div className="flex flex-col gap-2">
          {options.map((opt, i) => (
            <div
              key={opt.label}
              className="flex items-center justify-between px-3 py-2 bg-white/5 rounded"
            >
              <span className="text-sm">{opt.label}</span>
              <HudButton
                size="sm"
                variant="danger"
                onClick={() => removeOption(i)}
              >
                X
              </HudButton>
            </div>
          ))}
        </div>
      )}

      <HudButton
        variant="accent"
        onClick={beginVoting}
        disabled={options.length < 2}
      >
        {t("startVoting", locale)}
      </HudButton>
    </HudPanel>
  );
}
