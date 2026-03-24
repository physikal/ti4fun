import { HudButton } from "src/components/layout/HudButton";
import { HudPanel } from "src/components/layout/HudPanel";
import { GameMenu } from "src/components/layout/GameMenu";
import { useGameStore } from "src/store/gameStore";
import { t } from "src/i18n/index";

export function StartScreen() {
  const setScreen = useGameStore((s) => s.setScreen);
  const phase = useGameStore((s) => s.phase);

  const canContinue = phase !== "INIT";

  return (
    <div className="flex flex-col items-center justify-center h-full gap-8 p-6 screen-fade-in relative">
      <div className="absolute top-4 right-4">
        <GameMenu />
      </div>
      <div className="text-center">
        <h1 className="text-5xl font-bold text-hud-accent mb-2 drop-shadow-[0_0_20px_var(--color-hud-glow)]">
          TI4 Fun
        </h1>
        <p className="text-hud-muted text-sm">
          Twilight Imperium 4 Companion
        </p>
      </div>

      <HudPanel className="flex flex-col gap-3 w-full max-w-xs" glow>
        <HudButton
          size="lg"
          className="w-full"
          onClick={() => setScreen("setup")}
        >
          {t("newGame")}
        </HudButton>
        <HudButton
          size="lg"
          className="w-full"
          disabled={!canContinue}
          onClick={() => {
            if (canContinue) {
              const phase = useGameStore.getState().phase;
              switch (phase) {
                case "STRATEGY":
                  setScreen("strategy");
                  break;
                case "ACTION":
                  setScreen("action");
                  break;
                case "STATUS":
                  setScreen("status");
                  break;
                case "AGENDA":
                  setScreen("agenda");
                  break;
                default:
                  setScreen("strategy");
              }
            }
          }}
        >
          {t("continueGame")}
        </HudButton>
      </HudPanel>

      <div className="text-hud-muted text-xs">v8.0</div>
    </div>
  );
}
