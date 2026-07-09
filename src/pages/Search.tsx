import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search as SearchIcon, Loader2, Film, X, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { tmdbService } from "../services/tmdb";
import MovieCard from "../components/MovieCard";
import { MovieCardSkeleton } from "../components/Skeleton";

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const watchProvider = searchParams.get("watch_provider") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(query);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [providerPage, setProviderPage] = useState(1);
  const [providerHasMore, setProviderHasMore] = useState(true);
  const [providerType, setProviderType] = useState<"movie" | "tv">(
    (searchParams.get("type") as "movie" | "tv") || "movie"
  );

  // Load trending on mount (for empty state)
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const data = await tmdbService.getTrending("all", "day");
        setTrending(
          data.results
            .filter((item: any) => (item.media_type === "movie" || item.media_type === "tv") && item.poster_path)
            .slice(0, 12)
        );
      } catch (e) {
        console.error(e);
      }
    };
    fetchTrending();
  }, []);

  // Focus search on mount
  useEffect(() => {
    searchInputRef.current?.focus();
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync URL → state
  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== query) {
        if (searchTerm.trim()) {
          setSearchParams({ q: searchTerm });
        } else {
          setSearchParams({});
        }
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset provider page
  useEffect(() => {
    setProviderPage(1);
    setResults([]);
    setProviderHasMore(true);
  }, [watchProvider, providerType]);

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (watchProvider) {
        setLoading(true);
        try {
          const response = await fetch(
            `https://api.themoviedb.org/3/discover/${providerType}?with_watch_providers=${watchProvider}&watch_region=US&sort_by=popularity.desc&page=${providerPage}`,
            {
              headers: {
                Authorization: `Bearer ${import.meta.env.VITE_TMDB_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
              },
            }
          );
          const data = await response.json();
          const filtered = (data.results || [])
            .filter((item: any) => item.poster_path || item.backdrop_path)
            .map((item: any) => ({ ...item, media_type: providerType }));

          setResults((prev) => {
            if (providerPage === 1) return filtered;
            const existing = new Set(prev.map((r: any) => r.id));
            return [...prev, ...filtered.filter((r: any) => !existing.has(r.id))];
          });
          setProviderHasMore(data.page < data.total_pages);
        } catch (error) {
          console.error("Provider search error:", error);
        } finally {
          setLoading(false);
        }
        return;
      }

      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await tmdbService.searchMulti(query);
        setResults(
          data.results.filter(
            (item: any) =>
              (item.media_type === "movie" || item.media_type === "tv") &&
              (item.poster_path || item.backdrop_path)
          )
        );
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, watchProvider, providerPage, providerType]);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search movies, shows..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-12 text-white text-base placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:bg-white/[0.07] transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSearchParams({});
                  searchInputRef.current?.focus();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Provider Type Toggle */}
        {watchProvider && (
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setProviderType("movie")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                providerType === "movie"
                  ? "bg-cyan-500 text-white"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
              }`}
            >
              Movies
            </button>
            <button
              onClick={() => setProviderType("tv")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                providerType === "tv"
                  ? "bg-cyan-500 text-white"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
              }`}
            >
              TV Shows
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && results.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 py-8">
            {Array.from({ length: 12 }).map((_, i) => (
              <MovieCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4"
          >
            {results.map((result: any) => (
              <MovieCard
                key={`${result.media_type}-${result.id}`}
                id={result.id}
                title={result.title || result.name}
                posterUrl={result.poster_path}
                type={result.media_type === "tv" ? "tv" : "movie"}
              />
            ))}
          </motion.div>
        )}

        {/* Load More */}
        {watchProvider && results.length > 0 && providerHasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setProviderPage((p) => p + 1)}
              disabled={loading}
              className="px-6 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white text-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && results.length === 0 && query && !watchProvider && (
          <div className="text-center py-20">
            <Film className="w-12 h-12 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400">No results for "{query}"</p>
          </div>
        )}

        {/* Empty State — Show Trending + Providers */}
        {!loading && results.length === 0 && !query && !watchProvider && (
          <div className="space-y-10">
            {/* Providers */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Providers</h2>
                <Link to="/providers" className="text-xs text-gray-500 hover:text-white transition-colors">
                  View All
                </Link>
              </div>
              <ProviderGrid />
            </div>

            {/* Trending */}
            {trending.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-lg font-semibold text-white">Trending Now</h2>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4">
                  {trending.map((item: any) => (
                    <MovieCard
                      key={`trending-${item.media_type}-${item.id}`}
                      id={item.id}
                      title={item.title || item.name}
                      posterUrl={item.poster_path}
                      type={item.media_type === "tv" ? "tv" : "movie"}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Provider grid for search empty state
const TOP_PROVIDERS = [8, 9, 350, 337, 15, 1899, 283, 386, 531, 73, 300, 207];

function ProviderGrid() {
  const [providers, setProviders] = useState<any[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
        const res = await fetch(
          "https://api.themoviedb.org/3/watch/providers/movie?watch_region=US&language=en-US",
          { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
        );
        const data = await res.json();
        if (data.results) {
          const filtered = TOP_PROVIDERS
            .map((id) => data.results.find((p: any) => p.provider_id === id))
            .filter(Boolean);
          setProviders(filtered);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchProviders();
  }, []);

  if (providers.length === 0) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {providers.map((p: any) => (
        <Link
          key={p.provider_id}
          to={`/provider?watch_provider=${p.provider_id}`}
          className="flex flex-col items-center gap-1.5 shrink-0 group"
        >
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10 group-hover:border-white/30 transition-all group-hover:scale-105 bg-secondary">
            <img
              src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
              alt={p.provider_name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <span className="text-[9px] text-gray-500 group-hover:text-white transition-colors text-center line-clamp-1 max-w-[60px]">
            {p.provider_name}
          </span>
        </Link>
      ))}
    </div>
  );
}

export default Search;
