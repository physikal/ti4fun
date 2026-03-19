import { useCallback } from "react";

export function useFullscreen(): {
  toggle: (enabled: boolean) => void;
} {
  const toggle = useCallback((enabled: boolean) => {
    if (enabled) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, []);

  return { toggle };
}
