import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

// Keyboard cheatsheet modal, bound to the "?" key by useGlobalShortcuts.
// Mounted once near the app root; no props, no state exposed. Esc closes.
// Previously "?" only printed to console, which users never see.

const SHORTCUTS: { keys: string; desc: string }[] = [
  { keys: "g h", desc: "Home" },
  { keys: "g m", desc: "Movies" },
  { keys: "g t", desc: "TV Shows" },
  { keys: "g a", desc: "Anime" },
  { keys: "g l", desc: "Live TV" },
  { keys: "g s", desc: "Sports" },
  { keys: "g w", desc: "Watchlist / Profile" },
  { keys: "b", desc: "Back" },
  { keys: "/", desc: "Focus search" },
  { keys: "f", desc: "Fullscreen (in player)" },
  { keys: "?", desc: "Show this help" },
  { keys: "Esc", desc: "Close dialog" },
];

export default function ShortcutHelp() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onEvent = () => setOpen(true);
    window.addEventListener("aura:show-shortcuts", onEvent);
    return () => window.removeEventListener("aura:show-shortcuts", onEvent);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-label="Keyboard shortcuts"
    >
      <div
        className="w-full max-w-md rounded-2xl border border-white/10 bg-background/95 p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">Keyboard shortcuts</h2>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="rounded-md p-1 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <ul className="space-y-2">
          {SHORTCUTS.map(s => (
            <li
              key={s.keys}
              className="flex items-center justify-between gap-4 border-b border-white/5 pb-2 last:border-0"
            >
              <span className="text-sm text-white/80">{s.desc}</span>
              <kbd className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 font-mono text-xs text-white">
                {s.keys}
              </kbd>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
