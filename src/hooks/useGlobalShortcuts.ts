import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Netflix/YouTube-style global keyboard shortcuts.
//   g h  — home
//   g m  — movies
//   g t  — TV shows
//   g a  — anime
//   g l  — live TV
//   g s  — sports
//   g w  — watchlist (profile)
//   b    — back
//   ?    — print shortcut cheatsheet to console
// "/" is handled by InstantSearch.
// Fullscreen ("f") is player-local and handled inside HlsPlayer, not here.
//
// Shortcuts are suppressed while focus is in an input, textarea, or
// contenteditable element — so typing a search query never triggers nav.

const ROUTES: Record<string, string> = {
  h: "/",
  m: "/movies",
  t: "/tv-shows",
  a: "/anime",
  l: "/live-tv",
  s: "/sports",
  w: "/profile",
};

export function useGlobalShortcuts() {
  const navigate = useNavigate();

  useEffect(() => {
    let waitingForG = false;
    let gTimer: ReturnType<typeof setTimeout> | null = null;

    const onKey = (e: KeyboardEvent) => {
      const t = (document.activeElement?.tagName || "").toLowerCase();
      const typing =
        t === "input" ||
        t === "textarea" ||
        (document.activeElement as HTMLElement | null)?.isContentEditable;
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "?") {
        console.info(
          "[shortcuts] g h home · g m movies · g t tv · g a anime · g l live · g s sports · g w watchlist · b back · / search"
        );
        return;
      }

      if (e.key === "b") { navigate(-1); return; }

      if (e.key === "g") {
        waitingForG = true;
        if (gTimer) clearTimeout(gTimer);
        gTimer = setTimeout(() => { waitingForG = false; }, 900);
        return;
      }

      if (waitingForG && ROUTES[e.key]) {
        waitingForG = false;
        if (gTimer) clearTimeout(gTimer);
        navigate(ROUTES[e.key]);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (gTimer) clearTimeout(gTimer);
    };
  }, [navigate]);
}
