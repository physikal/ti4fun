import { useState, useCallback } from "react";
import { HudButton } from "src/components/layout/HudButton";
import { HudPanel } from "src/components/layout/HudPanel";
import { BackButton } from "src/components/layout/BackButton";
import { Modal } from "src/components/layout/Modal";
import { useGameStore } from "src/store/gameStore";
import { t } from "src/i18n/index";
import {
  FACTIONS,
  getFactionName,
  getFactionCategory,
  isSelectableFaction,
} from "src/data/factions";
import { PLAYER_COLORS, PLAYER_COLOR_HEX } from "src/store/types";
import type { PlayerColor } from "src/store/types";

interface PlayerSetup {
  factionId: number | null;
  color: PlayerColor | null;
  name: string;
}

export function SetupScreen() {
  const playerCount = useGameStore((s) => s.playerCount);
  const setPlayerCount = useGameStore((s) => s.setPlayerCount);
  const setScreen = useGameStore((s) => s.setScreen);
  const setupPlayer = useGameStore((s) => s.setupPlayer);
  const initializePlayers = useGameStore((s) => s.initializePlayers);

  const [playerSetups, setPlayerSetups] = useState<PlayerSetup[]>(
    Array.from({ length: 8 }, () => ({
      factionId: null,
      color: null,
      name: "",
    })),
  );

  const [editingPlayer, setEditingPlayer] = useState<number | null>(null);
  const [tempFaction, setTempFaction] = useState<number | null>(null);
  const [tempColor, setTempColor] = useState<PlayerColor | null>(null);
  const [tempName, setTempName] = useState("");

  const usedFactions = new Set(
    playerSetups
      .slice(0, playerCount)
      .filter((p) => p.factionId !== null)
      .map((p) => p.factionId),
  );
  const usedColors = new Set(
    playerSetups
      .slice(0, playerCount)
      .filter((p) => p.color !== null)
      .map((p) => p.color),
  );

  const openEditor = useCallback(
    (index: number) => {
      const setup = playerSetups[index];
      setEditingPlayer(index);
      setTempFaction(setup?.factionId ?? null);
      setTempColor(setup?.color ?? null);
      setTempName(setup?.name ?? "");
    },
    [playerSetups],
  );

  const confirmPlayer = useCallback(() => {
    if (editingPlayer === null || tempFaction === null || tempColor === null)
      return;

    const newSetups = [...playerSetups];
    newSetups[editingPlayer] = {
      factionId: tempFaction,
      color: tempColor,
      name: tempName,
    };
    setPlayerSetups(newSetups);
    setEditingPlayer(null);
  }, [editingPlayer, tempFaction, tempColor, tempName, playerSetups]);

  const allConfigured = playerSetups
    .slice(0, playerCount)
    .every((p) => p.factionId !== null && p.color !== null);

  const handleStartGame = useCallback(() => {
    for (let i = 0; i < playerCount; i++) {
      const setup = playerSetups[i];
      if (setup && setup.factionId !== null && setup.color !== null) {
        setupPlayer(i, setup.factionId, setup.color, setup.name);
      }
    }
    initializePlayers();
    setScreen("options");
  }, [playerCount, playerSetups, setupPlayer, initializePlayers, setScreen]);

  const categoryColors: Record<string, string> = {
    base: "text-hud-text",
    pok: "text-blue-400",
    codex: "text-yellow-400",
    te: "text-orange-400",
    ds: "text-purple-400",
  };

  return (
    <div className="flex flex-col h-full p-4 gap-4 screen-fade-in relative">
      <BackButton onClick={() => setScreen("start")} />

      <div className="text-center mt-12">
        <h2 className="text-2xl font-bold text-hud-accent">
          {t("players")}
        </h2>
      </div>

      <div className="flex items-center justify-center gap-4">
        <span className="text-hud-muted text-sm">{t("players")}:</span>
        <input
          type="range"
          min={3}
          max={8}
          value={playerCount}
          onChange={(e) => setPlayerCount(Number(e.target.value))}
          className="w-40 accent-[var(--color-hud-accent)]"
        />
        <span className="text-xl font-bold text-hud-accent w-8 text-center">
          {playerCount}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto flex-1">
        {Array.from({ length: playerCount }, (_, i) => {
          const setup = playerSetups[i];
          const faction =
            setup?.factionId !== null && setup?.factionId !== undefined
              ? FACTIONS[setup.factionId]
              : null;
          const configured = faction !== null && setup?.color !== null;

          return (
            <HudPanel
              key={i}
              className={`flex flex-col items-center gap-2 cursor-pointer transition-all hover:hud-glow ${
                configured ? "" : "border-dashed"
              }`}
            >
              <div
                className="w-full h-full flex flex-col items-center justify-center gap-2 min-h-[120px]"
                onClick={() => openEditor(i)}
                style={
                  setup?.color
                    ? {
                        borderTop: `3px solid ${PLAYER_COLOR_HEX[setup.color]}`,
                      }
                    : undefined
                }
              >
                {faction ? (
                  <>
                    <img
                      src={faction.icon}
                      alt={faction.shortName}
                      className="w-12 h-12 object-contain"
                    />
                    <span className="text-sm font-semibold text-center">
                      {getFactionName(faction.id)}
                    </span>
                    {setup?.name && (
                      <span className="text-xs text-hud-muted">
                        {setup.name}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-hud-muted text-sm">
                    {t("setPlayer")}
                  </span>
                )}
              </div>
            </HudPanel>
          );
        })}
      </div>

      <div className="flex justify-center">
        <HudButton
          size="lg"
          disabled={!allConfigured}
          onClick={handleStartGame}
        >
          {t("next")} →
        </HudButton>
      </div>

      <Modal
        open={editingPlayer !== null}
        onClose={() => setEditingPlayer(null)}
        title={`Player ${(editingPlayer ?? 0) + 1}`}
      >
        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-hud-muted uppercase tracking-wider">
              {t("playerName")}
            </label>
            <input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="Required"
              className="w-full mt-1 px-3 py-2 bg-black/30 border border-hud-border rounded text-hud-text placeholder:text-hud-muted/50 outline-none focus:border-hud-accent"
            />
          </div>

          <div>
            <label className="text-xs text-hud-muted uppercase tracking-wider">
              {t("color")}
            </label>
            <div className="flex flex-wrap gap-2 mt-1">
              {PLAYER_COLORS.map((c) => {
                const isUsed =
                  usedColors.has(c) &&
                  c !== playerSetups[editingPlayer ?? 0]?.color;
                return (
                  <button
                    key={c}
                    disabled={isUsed}
                    onClick={() => setTempColor(c)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      tempColor === c
                        ? "border-white scale-110"
                        : "border-transparent"
                    } ${isUsed ? "opacity-20" : "hover:scale-105"}`}
                    style={{ backgroundColor: PLAYER_COLOR_HEX[c] }}
                  />
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-xs text-hud-muted uppercase tracking-wider">
              {t("faction")}
            </label>
            <div className="max-h-60 overflow-y-auto mt-1 grid grid-cols-2 gap-1">
              {FACTIONS.filter((f) => isSelectableFaction(f.id)).map((f) => {
                const isUsed =
                  usedFactions.has(f.id) &&
                  f.id !== playerSetups[editingPlayer ?? 0]?.factionId;
                const category = getFactionCategory(f.id);
                return (
                  <button
                    key={f.id}
                    disabled={isUsed}
                    onClick={() => setTempFaction(f.id)}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs transition-all ${
                      tempFaction === f.id
                        ? "bg-hud-accent/20 border border-hud-accent"
                        : "hover:bg-white/5 border border-transparent"
                    } ${isUsed ? "opacity-20" : ""} ${categoryColors[category] ?? ""}`}
                  >
                    <img
                      src={f.icon}
                      alt={f.shortName}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="truncate">
                      {getFactionName(f.id)}
                    </span>
                  </button>
                );
              })}
              <button
                onClick={() => {
                  const available = FACTIONS.filter(
                    (f) =>
                      isSelectableFaction(f.id) && !usedFactions.has(f.id),
                  );
                  if (available.length > 0) {
                    const rand =
                      available[Math.floor(Math.random() * available.length)];
                    if (rand) setTempFaction(rand.id);
                  }
                }}
                className="flex items-center gap-2 px-2 py-1.5 rounded text-left text-xs hover:bg-white/5 border border-transparent text-hud-accent"
              >
                🎲 ???
              </button>
            </div>
          </div>

          <HudButton
            onClick={confirmPlayer}
            disabled={tempName.trim().length === 0 || tempFaction === null || tempColor === null}
            className="w-full"
          >
            {t("confirm")}
          </HudButton>
        </div>
      </Modal>
    </div>
  );
}
