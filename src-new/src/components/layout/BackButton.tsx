import { HudButton } from "src/components/layout/HudButton";
import { useGameStore } from "src/store/gameStore";
import { t } from "src/i18n/index";

interface BackButtonProps {
  onClick: () => void;
}

export function BackButton({ onClick }: BackButtonProps) {
  const locale = useGameStore((s) => s.locale);
  return (
    <HudButton onClick={onClick} size="sm" className="absolute top-4 left-4">
      ← {t("back", locale)}
    </HudButton>
  );
}
