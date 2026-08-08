import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { AlertTriangle, RotateCw, Search, Tv, X } from "lucide-react";
import { TMDB_LANGUAGE, WATCH_REGION } from "../constants/region";

interface ProviderData {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  /** TMDB's ranking of this provider *within the requested region*. */
  display_priority?: number;
}

/**
 * "Popular" is whatever TMDB ranks highest for the configured region.
 *
 * This used to be three hardcoded lists of US provider ids — Hulu, Max,
 * Peacock and friends — so an Indian or Nepali viewer was offered services
 * they cannot subscribe to, while Hotstar, JioCinema, SonyLIV, ZEE5 and
 * MX Player were absent. Letting the region's own ranking decide keeps the
 * list correct wherever WATCH_REGION points.
 *
 * The old Free/Subscription split is gone with them: /watch/providers does
 * not report monetization type, so that split was never derived from
 * anything — it was a guess baked in for one country.
 */
const POPULAR_COUNT = 24;

type FilterCategory = "popular" | "all";

const FILTERS: { id: FilterCategory; label: string }[] = [
  { id: "popular", label: "Popular" },
  { id: "all", label: "All" },
];

/** Matches the live grid exactly, so nothing shifts when results arrive. */
const GRID =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4";

function ProvidersSkeleton() {
  return (
    <div className={GRID}>
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-white/5 bg-surface/40 p-4"
        >
          <div className="mx-auto aspect-square w-16 rounded-xl bg-white/5 md:w-20" />
          <div className="mx-auto mt-3 h-3 w-20 rounded bg-white/5" />
        </div>
      ))}
    </div>
  );
}

const Providers: React.FC = () => {
  const [allProviders, setAllProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterCategory>("popular");
  const [searchTerm, setSearchTerm] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
        const response = await fetch(
          `https://api.themoviedb.org/3/watch/providers/movie?watch_region=${WATCH_REGION}&language=${TMDB_LANGUAGE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) throw new Error(`Request failed (${response.status})`);

        const data = await response.json();
        if (controller.signal.aborted) return;
        setAllProviders(data.results ?? []);
      } catch (e) {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch providers:", e);
        // Previously this failed into an empty grid reading "No providers
        // found", which blames the filter for what is actually a failed request.
        setError("Could not load streaming providers.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [attempt]);

  /**
   * Category and search compose, rather than search silently discarding the
   * selected category as it used to. Derived during render — the old code kept
   * a second copy of the list in state and synced it from an effect, costing an
   * extra render on every keystroke.
   */
  const filteredProviders = useMemo(() => {
    const ranked = [...allProviders].sort(
      (a, b) => (a.display_priority ?? 999) - (b.display_priority ?? 999)
    );

    const inCategory = filter === "all" ? ranked : ranked.slice(0, POPULAR_COUNT);

    const query = searchTerm.trim().toLowerCase();
    if (!query) return inCategory;

    // Search spans the whole regional catalogue — restricting it to the top 24
    // would hide most of what someone is searching for by name.
    const pool = query ? ranked : inCategory;
    return pool.filter(p => p.provider_name.toLowerCase().includes(query));
  }, [allProviders, filter, searchTerm]);

  return (
    <div className="min-h-screen px-4 pt-8 pb-20 md:px-12">
      <Helmet>
        <title>Streaming Providers — Browse by Platform | AuraScreen</title>
        <meta
          name="description"
          content="Browse movies and TV shows by streaming platform — Netflix, Prime Video, Disney+, Apple TV+, and dozens of free services."
        />
      </Helmet>

      <div className="container mx-auto">
        <header className="mb-8">
          <h1 className="mb-2 text-2xl font-bold text-white md:text-4xl">Providers</h1>
          <p className="text-sm text-text-muted md:text-base">
            Browse content by streaming platform
          </p>
        </header>

        {/* Controls */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            role="group"
            aria-label="Filter providers by category"
            className="flex gap-2 overflow-x-auto scrollbar-hide"
          >
            {FILTERS.map(f => {
              const isActive = filter === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  aria-pressed={isActive}
                  className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent text-black"
                      : "border border-white/10 bg-white/5 text-text-muted hover:text-white"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full sm:ml-auto sm:w-64">
            <label htmlFor="provider-search" className="sr-only">
              Search providers
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              id="provider-search"
              type="search"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search providers..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-9 text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted transition-colors hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <ProvidersSkeleton />
        ) : error ? (
          <div
            role="alert"
            className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-surface/40 py-20 text-center"
          >
            <AlertTriangle className="h-12 w-12 text-warning" />
            <p className="text-text">{error}</p>
            <button
              onClick={() => setAttempt(a => a + 1)}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
            >
              <RotateCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        ) : filteredProviders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-20 text-center text-text-muted">
            <Tv className="h-12 w-12 opacity-30" />
            <p>
              No providers found
              {searchTerm ? ` for “${searchTerm}”` : " in this category"}.
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="text-sm font-medium text-accent hover:underline"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-text-muted">
              {filteredProviders.length}{" "}
              {filteredProviders.length === 1 ? "provider" : "providers"}
            </p>

            <div className={GRID}>
              {filteredProviders.map(provider => (
                <Link
                  key={provider.provider_id}
                  to={`/provider?watch_provider=${provider.provider_id}`}
                  // The whole tile is the target — the old version was a 64px
                  // logo with a 10px caption, a small hit area on touch.
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-surface/40 p-4 transition-colors hover:border-accent/40 hover:bg-surface/70 focus-visible:border-accent"
                >
                  <div className="aspect-square w-16 overflow-hidden rounded-xl bg-white/5 md:w-20">
                    <img
                      src={`https://image.tmdb.org/t/p/w154${provider.logo_path}`}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      // `object-contain` rather than `cover`: several provider
                      // marks are wordmarks that cover crops the edges off.
                      className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>

                  {/* Full name, wrapped. It used to be clamped to 80px at 10px
                      type, which cut off most multi-word provider names. */}
                  <span className="text-center text-xs font-medium leading-tight text-text-muted transition-colors group-hover:text-white md:text-sm">
                    {provider.provider_name}
                  </span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Providers;
