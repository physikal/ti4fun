import { useEffect, useRef } from "react";
import { useGameStore } from "src/store/gameStore";

export function useTimer(): void {
  const tick = useGameStore((s) => s.tick);
  const clockRunning = useGameStore((s) => s.clockRunning);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (clockRunning) {
      intervalRef.current = setInterval(tick, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [clockRunning, tick]);
}

export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return [hours, minutes, seconds]
    .map((v) => String(v).padStart(2, "0"))
    .join(":");
}
