import { lazy, Suspense } from "react";
import { useGameStore } from "src/store/gameStore";
import { useTimer } from "src/hooks/useTimer";
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
      </div>
    </>
  );
}
