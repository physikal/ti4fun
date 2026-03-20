import { lazy, Suspense } from "react";
import { useGameStore } from "src/store/gameStore";
import { useTimer } from "src/hooks/useTimer";
import { HudButton } from "src/components/layout/HudButton";
import { StartScreen } from "src/screens/StartScreen";
import { SetupScreen } from "src/screens/SetupScreen";
import { OptionsScreen } from "src/screens/OptionsScreen";
import { StrategyScreen } from "src/screens/StrategyScreen";
import { ActionScreen } from "src/screens/ActionScreen";
import { StatusScreen } from "src/screens/StatusScreen";
import { AgendaScreen } from "src/screens/AgendaScreen";
import { EndScreen } from "src/screens/EndScreen";

const GalaxyBackground = lazy(() =>
  import("src/components/layout/GalaxyBackground").then((m) => ({
    default: m.GalaxyBackground,
  })),
);

function InactivityModal() {
  const modal = useGameStore((s) => s.modal);
  const inactivityMinutes = useGameStore((s) => s.options.inactivityMinutes);
  const setModal = useGameStore((s) => s.setModal);
  const resetActivity = useGameStore((s) => s.resetActivity);

  if (modal?.type !== "inactivity") return null;

  function handleContinue() {
    resetActivity();
    setModal(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="text-center screen-fade-in p-8">
        <div className="text-xl font-bold text-hud-accent mb-4">
          No activity for {inactivityMinutes} minutes
        </div>
        <div className="text-hud-muted mb-6">
          Clock will stop after {inactivityMinutes * 2} minutes
        </div>
        <HudButton variant="accent" onClick={handleContinue}>
          Continue
        </HudButton>
      </div>
    </div>
  );
}

function StopAlertModal() {
  const modal = useGameStore((s) => s.modal);
  const setModal = useGameStore((s) => s.setModal);
  const resetActivity = useGameStore((s) => s.resetActivity);
  const startClock = useGameStore((s) => s.startClock);

  if (modal?.type !== "stopAlert") return null;

  function handleResume() {
    resetActivity();
    startClock();
    setModal(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="text-center screen-fade-in p-8">
        <div className="text-xl font-bold text-hud-danger mb-4">
          Clock paused due to inactivity
        </div>
        <HudButton variant="accent" onClick={handleResume}>
          Resume
        </HudButton>
      </div>
    </div>
  );
}

function TransitionModal() {
  const modal = useGameStore((s) => s.modal);
  const setModal = useGameStore((s) => s.setModal);

  if (modal?.type !== "transition") return null;

  setTimeout(() => setModal(null), 2000);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="text-center screen-fade-in">
        <div className="text-2xl font-bold text-hud-accent mb-2">
          {(modal.data as { title?: string })?.title}
        </div>
        <div className="text-hud-muted">
          {(modal.data as { subtitle?: string })?.subtitle}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  useTimer();
  const screen = useGameStore((s) => s.screen);

  return (
    <>
      <Suspense fallback={null}>
        <GalaxyBackground />
      </Suspense>
      <div className="h-full flex flex-col overflow-hidden">
        {screen === "start" && <StartScreen />}
        {screen === "setup" && <SetupScreen />}
        {screen === "options" && <OptionsScreen />}
        {screen === "strategy" && <StrategyScreen />}
        {screen === "action" && <ActionScreen />}
        {screen === "status" && <StatusScreen />}
        {screen === "agenda" && <AgendaScreen />}
        {screen === "end" && <EndScreen />}
        <TransitionModal />
        <InactivityModal />
        <StopAlertModal />
      </div>
    </>
  );
}
