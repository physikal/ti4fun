import { HudButton } from "src/components/layout/HudButton";
import { HudPanel } from "src/components/layout/HudPanel";
import { useGameStore } from "src/store/gameStore";
import { t } from "src/i18n/index";
import { useFullscreen } from "src/hooks/useFullscreen";

export function OptionsScreen() {
  const options = useGameStore((s) => s.options);
  const setOptions = useGameStore((s) => s.setOptions);
  const startGame = useGameStore((s) => s.startGame);
  const setModal = useGameStore((s) => s.setModal);
  const { toggle: toggleFullscreen } = useFullscreen();

  const handleConfirm = () => {
    startGame();
    setModal({ type: "speaker" });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 p-6 screen-fade-in">
      <h2 className="text-2xl font-bold text-hud-accent">
        {t("options")}
      </h2>

      <HudPanel className="w-full max-w-md flex flex-col gap-4">
        <label className="flex items-center justify-between">
          <span className="text-sm">{t("fullscreen")}</span>
          <input
            type="checkbox"
            checked={options.fullscreen}
            onChange={(e) => {
              setOptions({ fullscreen: e.target.checked });
              toggleFullscreen(e.target.checked);
            }}
            className="w-5 h-5 accent-[var(--color-hud-accent)]"
          />
        </label>

        <label className="flex items-center justify-between">
          <span className="text-sm">{t("resetTimer")}</span>
          <input
            type="checkbox"
            checked={options.resetTimerPerTurn}
            onChange={(e) =>
              setOptions({ resetTimerPerTurn: e.target.checked })
            }
            className="w-5 h-5 accent-[var(--color-hud-accent)]"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">{t("inactivityTimer")}</span>
          <input
            type="range"
            min={5}
            max={60}
            value={options.inactivityMinutes}
            onChange={(e) =>
              setOptions({ inactivityMinutes: Number(e.target.value) })
            }
            className="accent-[var(--color-hud-accent)]"
          />
          <span className="text-xs text-hud-muted text-right">
            {options.inactivityMinutes} min
          </span>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm">{t("vpLimit")}</span>
          <input
            type="range"
            min={6}
            max={14}
            value={options.vpLimit}
            onChange={(e) =>
              setOptions({ vpLimit: Number(e.target.value) })
            }
            className="accent-[var(--color-hud-accent)]"
          />
          <span className="text-xs text-hud-muted text-right">
            {options.vpLimit} VP
          </span>
        </label>
      </HudPanel>

      <HudButton size="lg" onClick={handleConfirm}>
        {t("startGame")}
      </HudButton>
    </div>
  );
}
