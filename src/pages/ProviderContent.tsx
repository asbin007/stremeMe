import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Tv,
  X,
  Film,
  MonitorPlay,
  AlertTriangle,
  RotateCw,
} from "lucide-react";
import { SEOHead } from "../components/SEOHead";
import { generateBreadcrumbSchema } from "../utils/seoUtils";
import MovieCard from "../components/MovieCard";
import { MovieCardSkeleton } from "../components/Skeleton";
import { toMovieCardProps } from "../types/media";
import type { MediaItem } from "../types/media";
import { TMDB_LANGUAGE, WATCH_REGION } from "../constants/region";
import { getImageUrl } from "../services/tmdb";

interface ProviderMeta {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  display_priority?: number;
}

interface GenreItem {
  id: number;
  name: string;
}

type MediaTab = "movie" | "tv";

const SORT_OPTIONS = [
  { id: "popularity.desc", label: "Popular" },
  { id: "vote_average.desc", label: "Top Rated" },
  { id: "newest", label: "Newest" },
] as const;

type SortId = (typeof SORT_OPTIONS)[number]["id"];

const GRID =
  "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4";

function GridSkeleton({ count = 18 }: { count?: number }) {
  return (
    <div className={GRID}>
      {Array.from({ length: count }).map((_, i) => (
        <MovieCardSkeleton key={i} />
      ))}
    </div>
  );
}

const ProviderContent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const providerId = searchParams.get("watch_provider") || "";
  const currentPage = Number(searchParams.get("page") || "1");
  const activeTab: MediaTab =
    (searchParams.get("tab") as MediaTab) || "movie";
  const selectedGenre = searchParams.get("genre")
    ? Number(searchParams.get("genre"))
    : null;
  const sortBy: SortId =
    (searchParams.get("sort") as SortId) || "popularity.desc";

  const [provider, setProvider] = useState<ProviderMeta | null>(null);
  const [allProviders, setAllProviders] = useState<ProviderMeta[]>([]);
  const [genres, setGenres] = useState<GenreItem[]>([]);
  const [results, setResults] = useState<MediaItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [providerLoading, setProviderLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
  const headers = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };

  const updateParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  useEffect(() => {
    if (!providerId) return;
    const controller = new AbortController();

    (async () => {
      setProviderLoading(true);
      setImgError(false);
      try {
        const [movieRes, tvRes] = await Promise.allSettled([
          fetch(
            `https://api.themoviedb.org/3/watch/providers/movie?watch_region=${WATCH_REGION}&language=${TMDB_LANGUAGE}`,
            { headers, signal: controller.signal }
          ),
          fetch(
            `https://api.themoviedb.org/3/watch/providers/tv?watch_region=${WATCH_REGION}&language=${TMDB_LANGUAGE}`,
            { headers, signal: controller.signal }
          ),
        ]);

        if (controller.signal.aborted) return;

        const seen = new Map<number, ProviderMeta>();
        for (const res of [movieRes, tvRes]) {
          if (res.status === "fulfilled") {
            const d = await res.value.json();
            for (const p of d.results || []) {
              if (!seen.has(p.provider_id)) seen.set(p.provider_id, p);
            }
          }
        }

        const providers = [...seen.values()].sort((a, b) =>
          a.provider_name.localeCompare(b.provider_name)
        );
        setAllProviders(providers);

        const found = providers.find(
          (p) => p.provider_id === Number(providerId)
        );
        setProvider(
          found || {
            provider_id: Number(providerId),
            provider_name: `Provider #${providerId}`,
            logo_path: "",
          }
        );
      } catch (e) {
        if (!controller.signal.aborted) console.error(e);
      } finally {
        if (!controller.signal.aborted) setProviderLoading(false);
      }
    })();

    return () => controller.abort();
  }, [providerId]);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/genre/${activeTab}/list?language=${TMDB_LANGUAGE}`,
          { headers, signal: controller.signal }
        );
        const data = await res.json();
        if (!controller.signal.aborted) setGenres(data.genres || []);
      } catch (e) {
        if (!controller.signal.aborted) console.error(e);
      }
    })();

    return () => controller.abort();
  }, [activeTab]);

  useEffect(() => {
    if (!providerId) return;
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);

      const realSort =
        sortBy === "newest"
          ? activeTab === "movie"
            ? "primary_release_date.desc"
            : "first_air_date.desc"
          : sortBy;

      let url = `https://api.themoviedb.org/3/discover/${activeTab}?with_watch_providers=${providerId}&watch_region=${WATCH_REGION}&sort_by=${realSort}&page=${currentPage}&language=${TMDB_LANGUAGE}`;

      if (selectedGenre) url += `&with_genres=${selectedGenre}`;
      if (sortBy === "vote_average.desc") url += "&vote_count.gte=50";

      try {
        let res = await fetch(url, { headers, signal: controller.signal });
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        let data = await res.json();

        if (
          (!data.results || data.results.length === 0) &&
          WATCH_REGION !== "US"
        ) {
          const fallbackUrl = url.replace(
            `watch_region=${WATCH_REGION}`,
            "watch_region=US"
          );
          res = await fetch(fallbackUrl, {
            headers,
            signal: controller.signal,
          });
          data = await res.json();
        }

        if (controller.signal.aborted) return;

        setResults(
          (data.results || []).filter(
            (item: MediaItem) => item.poster_path || item.backdrop_path
          )
        );
        setTotalPages(Math.min(data.total_pages || 1, 500));
      } catch (e) {
        if (controller.signal.aborted) return;
        console.error(e);
        setError("Could not load content. Check your connection and retry.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [providerId, activeTab, selectedGenre, sortBy, currentPage, attempt]);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    setSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&page=1&language=${TMDB_LANGUAGE}`,
          { headers, signal: controller.signal }
        );
        const data = await res.json();
        if (controller.signal.aborted) return;
        setSearchResults(
          (data.results || []).filter(
            (i: MediaItem) =>
              (i.media_type === "movie" || i.media_type === "tv") &&
              i.poster_path
          )
        );
      } catch (e) {
        if (!controller.signal.aborted) console.error(e);
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 400);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const goToPage = (page: number) => {
    updateParams({ page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!providerId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <Tv className="h-14 w-14 text-text-muted opacity-40" />
        <h1 className="text-2xl font-bold text-white">No provider selected</h1>
        <p className="max-w-md text-text-muted">
          Pick a streaming service to browse its catalog.
        </p>
        <Link
          to="/providers"
          className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
        >
          Browse providers
        </Link>
      </div>
    );
  }

  if (providerLoading) {
    return (
      <div className="min-h-screen">
        <div className="animate-pulse bg-secondary/30 px-4 pb-6 pt-20 md:px-12 md:pt-32">
          <div className="container mx-auto flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-white/5 md:h-24 md:w-24" />
            <div>
              <div className="h-8 w-48 rounded bg-white/5" />
              <div className="mt-2 h-4 w-32 rounded bg-white/5" />
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 md:px-12">
          <GridSkeleton />
        </div>
      </div>
    );
  }

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Providers", url: "/providers" },
    ...(provider
      ? [
          {
            name: provider.provider_name,
            url: `/provider?watch_provider=${provider.provider_id}`,
          },
        ]
      : []),
  ]);

  const logoSrc = provider?.logo_path
    ? provider.logo_path.startsWith("http")
      ? provider.logo_path
      : getImageUrl(provider.logo_path, "w154")
    : null;

  const activeGenreName = selectedGenre
    ? genres.find((g) => g.id === selectedGenre)?.name
    : null;

  return (
    <div className="min-h-screen pb-20">
      {provider && (
        <SEOHead
          title={`${provider.provider_name} — Free Movies & TV Shows | AuraScreen`}
          description={`Browse movies and TV shows streaming on ${provider.provider_name}. Stream popular, top rated, and new releases free on AuraScreen.`}
          keywords={[
            provider.provider_name.toLowerCase(),
            `free ${provider.provider_name} movies`,
            `watch ${provider.provider_name} online`,
            "AuraScreen",
          ]}
          ogImage={logoSrc || undefined}
          structuredData={[breadcrumbs]}
        />
      )}

      {/* Hero */}
      <div className="relative bg-gradient-to-b from-secondary/60 via-secondary/30 to-background px-4 pb-4 pt-20 md:px-12 md:pb-6 md:pt-32">
        <div className="container mx-auto">
          <div className="flex items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-secondary shadow-2xl md:h-24 md:w-24">
              {logoSrc && !imgError ? (
                <img
                  src={logoSrc}
                  alt={provider?.provider_name}
                  className="h-full w-full object-contain p-1"
                  onError={() => setImgError(true)}
                />
              ) : (
                <Tv className="h-8 w-8 text-accent opacity-80" />
              )}
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-white md:text-4xl">
                {provider?.provider_name}
              </h1>
              <p className="mt-1 text-sm text-text-muted">
                {activeTab === "movie" ? "Movies" : "TV Shows"}
                {activeGenreName ? ` · ${activeGenreName}` : ""} on{" "}
                {provider?.provider_name}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row md:mt-6">
            <div className="relative flex-1">
              <label htmlFor="title-search" className="sr-only">
                Search all movies and TV shows
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <input
                id="title-search"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all movies & TV shows..."
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-10 text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-text-muted transition-colors hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="relative">
              <label htmlFor="provider-switch" className="sr-only">
                Switch streaming provider
              </label>
              <select
                id="provider-switch"
                value={providerId}
                onChange={(e) =>
                  navigate(`/provider?watch_provider=${e.target.value}`)
                }
                className="w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/5 py-2.5 pl-4 pr-10 text-sm text-white focus:border-accent focus:outline-none sm:w-56"
              >
                {allProviders.map((p) => (
                  <option
                    key={p.provider_id}
                    value={p.provider_id}
                    className="bg-gray-900"
                  >
                    {p.provider_name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            </div>
          </div>
        </div>
      </div>

      {/* Search overlay */}
      {searchQuery.trim() && (
        <div className="container mx-auto px-4 py-6 md:px-12">
          <h2 className="mb-4 text-xl font-bold text-white">Search Results</h2>
          {searching ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className={GRID}>
              {searchResults.map((item: MediaItem) => (
                <MovieCard key={item.id} {...toMovieCardProps(item)} />
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-text-muted">
              No results found
            </p>
          )}
        </div>
      )}

      {/* Filter controls + content */}
      {!searchQuery.trim() && (
        <>
          <div className="sticky top-[4.5rem] z-10 border-b border-white/5 bg-background/95 backdrop-blur-sm md:top-[6.125rem]">
            <div className="container mx-auto px-4 md:px-12">
              <div className="flex items-center justify-between gap-4 py-3">
                <div
                  className="flex gap-1 rounded-lg bg-white/5 p-1"
                  role="tablist"
                >
                  {(
                    [
                      { id: "movie" as MediaTab, label: "Movies", Icon: Film },
                      {
                        id: "tv" as MediaTab,
                        label: "TV Shows",
                        Icon: MonitorPlay,
                      },
                    ] as const
                  ).map((tab) => (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={activeTab === tab.id}
                      onClick={() =>
                        updateParams({ tab: tab.id, page: "1", genre: null })
                      }
                      className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                        activeTab === tab.id
                          ? "bg-accent text-black"
                          : "text-text-muted hover:text-white"
                      }`}
                    >
                      <tab.Icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      updateParams({ sort: e.target.value, page: "1" })
                    }
                    aria-label="Sort by"
                    className="cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/5 py-1.5 pl-3 pr-8 text-sm text-text-muted focus:border-accent focus:text-white focus:outline-none"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option
                        key={opt.id}
                        value={opt.id}
                        className="bg-gray-900"
                      >
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted" />
                </div>
              </div>

              <div
                className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide"
                role="group"
                aria-label="Filter by genre"
              >
                <button
                  onClick={() => updateParams({ genre: null, page: "1" })}
                  className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                    !selectedGenre
                      ? "bg-accent text-black"
                      : "border border-white/10 bg-white/5 text-text-muted hover:text-white"
                  }`}
                >
                  All
                </button>
                {genres.map((genre) => (
                  <button
                    key={genre.id}
                    onClick={() =>
                      updateParams({ genre: String(genre.id), page: "1" })
                    }
                    className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
                      selectedGenre === genre.id
                        ? "bg-accent text-black"
                        : "border border-white/10 bg-white/5 text-text-muted hover:text-white"
                    }`}
                  >
                    {genre.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4 py-6 md:px-12">
            {loading ? (
              <GridSkeleton />
            ) : error ? (
              <div
                role="alert"
                className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-surface/40 py-20 text-center"
              >
                <AlertTriangle className="h-12 w-12 text-warning" />
                <p className="text-text">{error}</p>
                <button
                  onClick={() => setAttempt((a) => a + 1)}
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
                >
                  <RotateCw className="h-4 w-4" />
                  Retry
                </button>
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-20 text-center text-text-muted">
                <Tv className="h-12 w-12 opacity-30" />
                <p>
                  No {activeTab === "movie" ? "movies" : "TV shows"} found
                  {activeGenreName ? ` in ${activeGenreName}` : ""}.
                </p>
                {selectedGenre && (
                  <button
                    onClick={() => updateParams({ genre: null, page: "1" })}
                    className="text-sm font-medium text-accent hover:underline"
                  >
                    Clear genre filter
                  </button>
                )}
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-text-muted">
                  {results.length} results · Page {currentPage} of {totalPages}
                </p>
                <div className={GRID}>
                  {results.map((item: MediaItem) => (
                    <MovieCard
                      key={item.id}
                      {...toMovieCardProps(item)}
                      type={activeTab}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {totalPages > 1 && !loading && !error && (
            <div className="container mx-auto px-4 py-10 md:px-12">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-text-muted transition-all hover:border-accent/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Prev
                </button>

                {(() => {
                  const pages: (number | string)[] = [];
                  const maxVisible = 7;
                  if (totalPages <= maxVisible) {
                    for (let i = 1; i <= totalPages; i++) pages.push(i);
                  } else {
                    pages.push(1);
                    if (currentPage > 3) pages.push("...");
                    const start = Math.max(2, currentPage - 1);
                    const end = Math.min(totalPages - 1, currentPage + 1);
                    for (let i = start; i <= end; i++) pages.push(i);
                    if (currentPage < totalPages - 2) pages.push("...");
                    pages.push(totalPages);
                  }
                  return pages.map((page, idx) =>
                    typeof page === "string" ? (
                      <span key={`e-${idx}`} className="px-2 text-gray-500">
                        …
                      </span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        aria-current={
                          page === currentPage ? "page" : undefined
                        }
                        aria-label={`Go to page ${page}`}
                        className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                          page === currentPage
                            ? "bg-accent text-black"
                            : "border border-white/10 bg-white/5 text-text-muted hover:border-accent/40 hover:text-white"
                        }`}
                      >
                        {page}
                      </button>
                    )
                  );
                })()}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-text-muted transition-all hover:border-accent/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-3 text-center text-xs text-text-muted">
                Page {currentPage} of {totalPages}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProviderContent;
