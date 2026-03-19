import { useState, useRef, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useGameStore } from "src/store/gameStore";
import { t } from "src/i18n/index";

export function GameMenu() {
  const [open, setOpen] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);
  const [importError, setImportError] = useState(false);
  const [menuPos, setMenuPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const locale = useGameStore((s) => s.locale);
  const resetGame = useGameStore((s) => s.resetGame);
  const exportGame = useGameStore((s) => s.exportGame);
  const importGame = useGameStore((s) => s.importGame);
  const setScreen = useGameStore((s) => s.setScreen);

  useEffect(() => {
    if (!open) {
      setConfirmNew(false);
      setImportError(false);
    }
  }, [open]);

  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setMenuPos({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
  }, [open]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleExport = useCallback(() => {
    const json = exportGame();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ti4fun-save-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setOpen(false);
  }, [exportGame]);

  const handleImport = useCallback(() => {
    fileRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (ev) => {
        const text = ev.target?.result;
        if (typeof text !== "string") return;
        const ok = importGame(text);
        if (ok) {
          setOpen(false);
        } else {
          setImportError(true);
        }
      };
      reader.readAsText(file);
      e.target.value = "";
    },
    [importGame],
  );

  const handleNewGame = useCallback(() => {
    if (!confirmNew) {
      setConfirmNew(true);
      return;
    }
    resetGame();
    setScreen("start");
    setOpen(false);
  }, [confirmNew, resetGame, setScreen]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className={`w-8 h-8 flex items-center justify-center rounded-md transition-colors ${
          open
            ? "bg-hud-accent/20 text-hud-accent"
            : "text-hud-muted hover:text-hud-text"
        }`}
        aria-label="Game menu"
      >
        <CogIcon />
      </button>

      {open &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed w-52 hud-panel p-1.5 space-y-0.5 screen-fade-in"
            style={{
              top: menuPos.top,
              right: menuPos.right,
              zIndex: 9999,
            }}
          >
            <MenuItem onClick={handleNewGame}>
              {confirmNew ? "Confirm New Game?" : t("newGame", locale)}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleExport}>Save / Export</MenuItem>
            <MenuItem onClick={handleImport}>Load / Import</MenuItem>
            {importError && (
              <p className="text-xs text-hud-danger px-3 py-1">
                Invalid save file
              </p>
            )}
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>,
          document.body,
        )}
    </>
  );
}

function CogIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function Divider() {
  return <div className="h-px bg-hud-border/20 mx-2" />;
}

function MenuItem({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left text-sm px-3 py-2 rounded text-hud-text hover:bg-white/5 transition-colors"
    >
      {children}
    </button>
  );
}
