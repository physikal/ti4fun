import { HudButton } from "src/components/layout/HudButton";
import { HudPanel } from "src/components/layout/HudPanel";
import { GameMenu } from "src/components/layout/GameMenu";
import { useGameStore } from "src/store/gameStore";
import { t } from "src/i18n/index";
import type { Locale } from "src/store/types";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "en", label: "English" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "ru", label: "Русский" },
  { code: "es", label: "Español" },
  { code: "zh", label: "中文" },
  { code: "pl", label: "Polski" },
];

export function StartScreen() {
  const locale = useGameStore((s) => s.locale);
  const setLocale = useGameStore((s) => s.setLocale);
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
          {t("newGame", locale)}
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
          {t("continueGame", locale)}
        </HudButton>
      </HudPanel>

      <div className="flex flex-wrap gap-2 justify-center">
        {LOCALES.map((l) => (
          <button
            key={l.code}
            onClick={() => setLocale(l.code)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              locale === l.code
                ? "bg-hud-accent/20 text-hud-accent border border-hud-accent"
                : "text-hud-muted hover:text-hud-text border border-transparent"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="text-hud-muted text-xs">v8.0</div>
    </div>
  );
}
