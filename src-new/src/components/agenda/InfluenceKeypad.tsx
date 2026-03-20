import { useAgendaStore } from "src/store/agendaStore";
import { HudButton } from "src/components/layout/HudButton";

interface InfluenceKeypadProps {
  influence: number;
}

const KEYPAD_VALUES = [1, 2, 3, 5, 10] as const;

export function InfluenceKeypad({
  influence,
}: InfluenceKeypadProps) {
  const keypadInput = useAgendaStore((s) => s.keypadInput);
  const keypadClear = useAgendaStore((s) => s.keypadClear);

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-3xl font-mono font-bold text-hud-accent">
        {influence}
      </span>
      <div className="flex gap-2 flex-wrap justify-center">
        {KEYPAD_VALUES.map((val) => (
          <HudButton
            key={val}
            size="sm"
            onClick={() => keypadInput(val)}
          >
            +{val}
          </HudButton>
        ))}
        <HudButton
          size="sm"
          variant="danger"
          onClick={keypadClear}
        >
          C
        </HudButton>
      </div>
    </div>
  );
}
