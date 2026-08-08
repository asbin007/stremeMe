import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, ChevronDown, Tv } from "lucide-react";
import { Helmet } from "react-helmet-async";
import ContentCarousel from "../components/ContentCarousel";
import MovieCard from "../components/MovieCard";
import { MovieCardSkeleton } from "../components/Skeleton";
import { toMovieCardProps } from '../types/media';
import type { MediaItem, WatchProvider } from '../types/media';

interface ProviderMeta {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

const ProviderContent: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const providerId = searchParams.get("watch_provider") || "";
  const currentPage = Number(searchParams.get("page") || "1");
  const [provider, setProvider] = useState<ProviderMeta | null>(null);
  const [allProviders, setAllProviders] = useState<ProviderMeta[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<MediaItem[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<MediaItem[]>([]);
  const [newMovies, setNewMovies] = useState<MediaItem[]>([]);
  const [tvShows, setTvShows] = useState<MediaItem[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<MediaItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);
  const [searching, setSearching] = useState(false);

  const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

  const goToPage = (page: number) => {
    setSearchParams({ watch_provider: providerId, page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /**
   * Debounced title search.
   *
   * This used to fire a TMDB request from the input's onChange handler, so
   * typing "interstellar" issued twelve requests, with no cancellation — the
   * slowest response won regardless of what was actually typed.
   */
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
          `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&page=1`,
          {
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            signal: controller.signal,
          }
        );
        const data = await res.json();
        if (controller.signal.aborted) return;

        setSearchResults(
          (data.results || []).filter(
            (i: MediaItem) =>
              (i.media_type === "movie" || i.media_type === "tv") && i.poster_path
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
  }, [searchQuery, token]);

  useEffect(() => {
    if (!providerId) return;

    // Defined inside the effect: it closes over `providerId` and `token`, and
    // as a component-scope function it was recreated every render — so it
    // could not be listed as a dependency without looping.
    const fetchFromProvider = async (
      mediaType: "movie" | "tv",
      sortBy: string,
      page = 1
    ) => {
      const res = await fetch(
        `https://api.themoviedb.org/3/discover/${mediaType}?with_watch_providers=${providerId}&watch_region=US&sort_by=${sortBy}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await res.json();
      return {
        results: (data.results || []).filter(
          (item: MediaItem) => item.poster_path || item.backdrop_path
        ),
        totalPages: Math.min(data.total_pages || 1, 500),
      };
    };

    const fetchAll = async () => {
      setLoading(true);

      // Fetch provider meta + all providers for the switcher
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/watch/providers/movie?watch_region=US&language=en-US`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await res.json();
        setAllProviders(data.results || []);
        const found = data.results?.find(
          (p: WatchProvider) => p.provider_id === Number(providerId)
        );
        if (found) setProvider(found);
      } catch (e) {
        console.error(e);
      }

      // Fetch content sections in parallel with current page
      const [trending, topRated, newest, shows, topTV] = await Promise.all([
        fetchFromProvider("movie", "popularity.desc", currentPage),
        fetchFromProvider("movie", "vote_average.desc", currentPage),
        fetchFromProvider("movie", "primary_release_date.desc", currentPage),
        fetchFromProvider("tv", "popularity.desc", currentPage),
        fetchFromProvider("tv", "vote_average.desc", currentPage),
      ]);

      setTrendingMovies(trending.results);
      setTopRatedMovies(topRated.results);
      setNewMovies(newest.results);
      setTvShows(shows.results);
      setTopRatedTV(topTV.results);
      setTotalPages(Math.max(trending.totalPages, shows.totalPages, topRated.totalPages));
      setLoading(false);
    };

    fetchAll();
  }, [providerId, currentPage, token]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20">
        <div className="h-48 bg-secondary/30 animate-pulse" />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    // Distinguishes "no provider in the URL" from "we asked and it wasn't
    // there" — both previously rendered the same bare "Provider not found".
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
        <Tv className="h-14 w-14 text-text-muted opacity-40" />
        <h1 className="text-2xl font-bold text-white">
          {providerId ? "Provider not found" : "No provider selected"}
        </h1>
        <p className="max-w-md text-text-muted">
          {providerId
            ? "This provider isn't available in the US catalogue, or the request failed."
            : "Pick a streaming service to browse what's available on it."}
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

  return (
    <div className="min-h-screen pb-20">
      <Helmet>
        <title>{`Watch on ${provider.provider_name} — Movies & TV | AuraScreen`}</title>
        <meta
          name="description"
          content={`Browse movies and TV shows streaming on ${provider.provider_name}. Popular, top rated, and new releases.`}
        />
      </Helmet>

      {/* Provider Hero Banner */}
      <div className="relative pt-20 pb-8 px-4 md:px-12 bg-gradient-to-b from-secondary/80 to-background">
        <div className="container mx-auto flex items-center gap-5">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-secondary shrink-0">
            <img
              src={`https://image.tmdb.org/t/p/w154${provider.logo_path}`}
              alt={provider.provider_name}
              className="h-full w-full object-contain p-1"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              {provider.provider_name}
            </h1>
            <p className="mt-1 text-sm text-text-muted">
              Movies and TV shows available on {provider.provider_name}
            </p>
          </div>
        </div>

        {/* Search + Provider Filter */}
        <div className="container mx-auto mt-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
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
              // Honest placeholder: TMDB's search endpoint takes no provider
              // filter, so these results span everything, not just this
              // service. The old copy said "Search on {provider}...", which
              // promised filtering the request never did.
              placeholder="Search all movies & TV shows..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-accent focus:outline-none"
            />
          </div>

          {/* Provider switcher */}
          <div className="relative">
            <label htmlFor="provider-switch" className="sr-only">
              Switch streaming provider
            </label>
            <select
              id="provider-switch"
              value={providerId}
              onChange={(e) => navigate(`/provider?watch_provider=${e.target.value}`)}
              className="w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/5 py-2.5 pl-4 pr-10 text-sm text-white focus:border-accent focus:outline-none sm:w-56"
            >
              {allProviders.map((p) => (
                <option key={p.provider_id} value={p.provider_id} className="bg-gray-900">
                  {p.provider_name}
                </option>
              ))}
            </select>
            {/* `appearance-none` removes the native arrow, so the control read
                as a plain text box until this was added. */}
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
          </div>
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.trim() && (
        <div className="container mx-auto px-4 md:px-12 py-6">
          <h2 className="text-xl font-bold text-white mb-4">Search Results</h2>
          {searching ? (
            <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {searchResults.map((item: MediaItem) => (
                <MovieCard key={item.id} {...toMovieCardProps(item)} />
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-text-muted">No results found</p>
          )}
        </div>
      )}

      {/* Content Sections. `type` is set explicitly after the spread: these
          lists come from single-media endpoints, which omit `media_type`. */}
      <div className="space-y-4">
        {trendingMovies.length > 0 && (
          <ContentCarousel title="Popular Movies">
            {trendingMovies.map((movie: MediaItem) => (
              <MovieCard key={movie.id} {...toMovieCardProps(movie)} type="movie" />
            ))}
          </ContentCarousel>
        )}

        {tvShows.length > 0 && (
          <ContentCarousel title="Popular TV Shows">
            {tvShows.map((show: MediaItem) => (
              <MovieCard key={show.id} {...toMovieCardProps(show)} type="tv" />
            ))}
          </ContentCarousel>
        )}

        {topRatedMovies.length > 0 && (
          <ContentCarousel title="Top Rated Movies">
            {topRatedMovies.map((movie: MediaItem) => (
              <MovieCard key={movie.id} {...toMovieCardProps(movie)} type="movie" />
            ))}
          </ContentCarousel>
        )}

        {topRatedTV.length > 0 && (
          <ContentCarousel title="Top Rated TV Shows">
            {topRatedTV.map((show: MediaItem) => (
              <MovieCard key={show.id} {...toMovieCardProps(show)} type="tv" />
            ))}
          </ContentCarousel>
        )}

        {newMovies.length > 0 && (
          <ContentCarousel title="New Releases">
            {newMovies.map((movie: MediaItem) => (
              <MovieCard key={movie.id} {...toMovieCardProps(movie)} type="movie" />
            ))}
          </ContentCarousel>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && !searchQuery.trim() && (
        <div className="container mx-auto px-4 md:px-12 py-10">
          <div className="flex items-center justify-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage <= 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-text-muted hover:text-white hover:border-accent/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              Prev
            </button>

            {/* Page Numbers */}
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
                  <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                    …
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => goToPage(page)}
                    aria-current={page === currentPage ? "page" : undefined}
                    aria-label={`Go to page ${page}`}
                    className={`h-9 w-9 rounded-lg text-sm font-medium transition-all ${
                      page === currentPage
                        ? "bg-accent text-black"
                        : "bg-white/5 border border-white/10 text-text-muted hover:text-white hover:border-accent/40"
                    }`}
                  >
                    {page}
                  </button>
                )
              );
            })()}

            {/* Next Button */}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-text-muted hover:text-white hover:border-accent/40 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-text-muted">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProviderContent;
