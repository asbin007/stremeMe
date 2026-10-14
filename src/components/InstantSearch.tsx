import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, Film, Tv as TvIcon } from "lucide-react";
import { tmdbService, getImageUrl, prefetchDetails } from "../services/tmdb";
import clsx from "clsx";

// Netflix-style instant search for the navbar: expands on click, debounced
// TMDB multi-search, dropdown of the top 6 hits with poster thumbs, arrow-
// key navigation + enter to open. Hits "/search?q=…" on Enter from an
// empty selection so power users still land on the full page. Remembers
// the last 5 queries in localStorage for recent-search chips.

type Hit = {
  id: number;
  title: string;
  poster: string | null;
  year: string;
  type: "movie" | "tv";
};

const RECENT_KEY = "aura.recentSearches";
const MAX_RECENT = 5;

const readRecent = (): string[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? (JSON.parse(raw) as string[]).slice(0, MAX_RECENT) : [];
  } catch { return []; }
};
const pushRecent = (q: string) => {
  if (!q.trim()) return;
  try {
    const prev = readRecent().filter((x) => x.toLowerCase() !== q.toLowerCase());
    const next = [q, ...prev].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch { /* ignore */ }
};

interface MultiHit {
  id: number;
  media_type: "movie" | "tv" | "person";
  title?: string;
  name?: string;
  poster_path?: string | null;
  profile_path?: string | null;
  release_date?: string;
  first_air_date?: string;
}

const InstantSearch: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(-1);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => { if (open) { inputRef.current?.focus(); setRecent(readRecent()); } }, [open]);

  // Global "/" opens the search; Escape closes it.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || "").toLowerCase();
      const typing = tag === "input" || tag === "textarea" || (document.activeElement as HTMLElement | null)?.isContentEditable;
      if (e.key === "/" && !typing) { e.preventDefault(); setOpen(true); }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Close on click outside.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (open && boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Debounced TMDB multi-search. Cancels in-flight stale requests by
  // ignoring their results when a newer query has been typed.
  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed) { setHits([]); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const data = await tmdbService.searchMulti(trimmed);
        if (cancelled) return;
        const mapped = (data.results as MultiHit[])
          .filter((r) => (r.media_type === "movie" || r.media_type === "tv") && r.poster_path)
          .slice(0, 6)
          .map<Hit>((r) => ({
            id: r.id,
            title: r.title || r.name || "",
            poster: r.poster_path || null,
            year: (r.release_date || r.first_air_date || "").slice(0, 4),
            type: r.media_type as "movie" | "tv",
          }));
        setHits(mapped);
        setActive(-1);
      } catch { if (!cancelled) setHits([]); }
    }, 220);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  const go = (h: Hit) => {
    pushRecent(q);
    setOpen(false);
    setQ("");
    navigate(`/${h.type}/${h.id}`);
  };

  const submit = () => {
    const trimmed = q.trim();
    if (!trimmed) return;
    pushRecent(trimmed);
    setOpen(false);
    setQ("");
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(hits.length - 1, i + 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(-1, i - 1)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && hits[active]) go(hits[active]);
      else submit();
    }
  };

  return (
    <div ref={boxRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Search"
        aria-expanded={open}
        className="p-2 text-text-muted hover:text-text transition-colors hover:bg-white/10 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <Search className="size-5" aria-hidden="true" />
      </button>

      {open && (
        <div className="fixed inset-x-2 top-16 z-50 md:absolute md:inset-x-auto md:right-0 md:top-full md:mt-2 md:w-[420px] rounded-xl border border-white/10 bg-secondary/95 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-2 border-b border-white/10 p-2">
            <Search className="ml-1 size-4 text-text-muted" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search movies, TV shows…  ( / )"
              className="flex-1 bg-transparent px-1 py-1.5 text-sm text-white placeholder:text-text-muted focus:outline-none"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} className="rounded p-1 text-text-muted hover:text-white" aria-label="Clear">
                <X className="size-4" />
              </button>
            )}
          </div>

          {!q.trim() && recent.length > 0 && (
            <div className="p-2">
              <div className="px-2 pb-1 text-xs uppercase tracking-wide text-text-muted">Recent</div>
              <div className="flex flex-wrap gap-1.5 px-1">
                {recent.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setQ(r)}
                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-gray-200 hover:bg-white/10"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hits.length > 0 && (
            <ul role="listbox" className="max-h-[60vh] overflow-y-auto p-1">
              {hits.map((h, i) => {
                const Icon = h.type === "movie" ? Film : TvIcon;
                return (
                  <li key={`${h.type}-${h.id}`}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === active}
                      onMouseEnter={() => { setActive(i); prefetchDetails(h.type, h.id); }}
                      onClick={() => go(h)}
                      className={clsx(
                        "flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors",
                        i === active ? "bg-white/10" : "hover:bg-white/5"
                      )}
                    >
                      <img
                        src={h.poster ? getImageUrl(h.poster, "w92") : ""}
                        alt=""
                        className="h-14 w-10 shrink-0 rounded border border-white/10 bg-white/5 object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium text-white">{h.title}</div>
                        <div className="flex items-center gap-1 text-xs text-text-muted">
                          <Icon className="size-3" aria-hidden="true" />
                          <span>{h.type === "movie" ? "Movie" : "TV"}</span>
                          {h.year && <><span>•</span><span>{h.year}</span></>}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {q.trim() && hits.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-text-muted">
              Press <kbd className="rounded bg-white/10 px-1.5 py-0.5">Enter</kbd> to search all results for <span className="text-white">"{q.trim()}"</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstantSearch;
