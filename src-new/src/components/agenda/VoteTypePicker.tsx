import { HudPanel } from "src/components/layout/HudPanel";
import { HudButton } from "src/components/layout/HudButton";
import { t } from "src/i18n/index";
import type { VoteType } from "src/store/agendaStore";

interface VoteTypePickerProps {
  onPick: (type: VoteType) => void;
}

export function VoteTypePicker({ onPick }: VoteTypePickerProps) {
  return (
    <HudPanel className="flex flex-col items-center gap-4 p-6 w-full max-w-md">
      <h3 className="text-lg font-bold text-hud-accent">
        {t("selectVoteType")}
      </h3>
      <div className="flex flex-col gap-3 w-full">
        <HudButton
          variant="accent"
          size="lg"
          onClick={() => onPick("forAgainst")}
          className="w-full"
        >
          {t("forAgainst")}
        </HudButton>
        <HudButton
          variant="accent"
          size="lg"
          onClick={() => onPick("electPlayer")}
          className="w-full"
        >
          {t("electPlayer")}
        </HudButton>
        <HudButton
          variant="accent"
          size="lg"
          onClick={() => onPick("custom")}
          className="w-full"
        >
          {t("customVote")}
        </HudButton>
      </div>
    </HudPanel>
  );
}
