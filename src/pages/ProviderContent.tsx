import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import ContentCarousel from "../components/ContentCarousel";
import MovieCard from "../components/MovieCard";
import { MovieCardSkeleton } from "../components/Skeleton";

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
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<any[]>([]);
  const [newMovies, setNewMovies] = useState<any[]>([]);
  const [tvShows, setTvShows] = useState<any[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

  const goToPage = (page: number) => {
    setSearchParams({ watch_provider: providerId, page: String(page) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
        (item: any) => item.poster_path || item.backdrop_path
      ),
      totalPages: Math.min(data.total_pages || 1, 500),
    };
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) { setSearchResults([]); setSearching(false); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/multi?query=${encodeURIComponent(query)}&page=1`,
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      const data = await res.json();
      setSearchResults((data.results || []).filter((i: any) => (i.media_type === 'movie' || i.media_type === 'tv') && i.poster_path));
    } catch (e) { console.error(e); }
    finally { setSearching(false); }
  };

  useEffect(() => {
    if (!providerId) return;

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
          (p: any) => p.provider_id === Number(providerId)
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
  }, [providerId, currentPage]);

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
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Provider not found
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Provider Hero Banner */}
      <div className="relative pt-20 pb-8 px-4 md:px-12 bg-gradient-to-b from-secondary/80 to-background">
        <div className="container mx-auto flex items-center gap-5">
          <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl overflow-hidden border border-white/20 shadow-2xl bg-secondary shrink-0">
            <img
              src={`https://image.tmdb.org/t/p/w154${provider.logo_path}`}
              alt={provider.provider_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-white">
              {provider.provider_name}
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Movies and TV shows available on {provider.provider_name}
            </p>
          </div>
        </div>

        {/* Search + Provider Filter */}
        <div className="container mx-auto mt-6 flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); handleSearch(e.target.value); }}
              placeholder={`Search on ${provider.provider_name}...`}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
            />
          </div>
          {/* Provider Switcher */}
          <select
            value={providerId}
            onChange={(e) => navigate(`/provider?watch_provider=${e.target.value}`)}
            className="bg-white/5 border border-white/10 rounded-lg py-2.5 px-4 text-sm text-white focus:outline-none focus:border-white/30 appearance-none cursor-pointer"
          >
            {allProviders.slice(0, 30).map((p) => (
              <option key={p.provider_id} value={p.provider_id} className="bg-gray-900">
                {p.provider_name}
              </option>
            ))}
          </select>
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
              {searchResults.map((item: any) => (
                <MovieCard key={item.id} id={item.id} title={item.title || item.name} posterUrl={item.poster_path} type={item.media_type || 'movie'} />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No results found</p>
          )}
        </div>
      )}

      {/* Content Sections */}
      <div className="space-y-4">
        {trendingMovies.length > 0 && (
          <ContentCarousel title="Popular Movies">
            {trendingMovies.map((movie: any) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterUrl={movie.poster_path}
                type="movie"
              />
            ))}
          </ContentCarousel>
        )}

        {tvShows.length > 0 && (
          <ContentCarousel title="Popular TV Shows">
            {tvShows.map((show: any) => (
              <MovieCard
                key={show.id}
                id={show.id}
                title={show.name}
                posterUrl={show.poster_path}
                type="tv"
              />
            ))}
          </ContentCarousel>
        )}

        {topRatedMovies.length > 0 && (
          <ContentCarousel title="Top Rated Movies">
            {topRatedMovies.map((movie: any) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterUrl={movie.poster_path}
                type="movie"
              />
            ))}
          </ContentCarousel>
        )}

        {topRatedTV.length > 0 && (
          <ContentCarousel title="Top Rated TV Shows">
            {topRatedTV.map((show: any) => (
              <MovieCard
                key={show.id}
                id={show.id}
                title={show.name}
                posterUrl={show.poster_path}
                type="tv"
              />
            ))}
          </ContentCarousel>
        )}

        {newMovies.length > 0 && (
          <ContentCarousel title="New Releases">
            {newMovies.map((movie: any) => (
              <MovieCard
                key={movie.id}
                id={movie.id}
                title={movie.title}
                posterUrl={movie.poster_path}
                type="movie"
              />
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
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                      page === currentPage
                        ? "bg-white text-black"
                        : "bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30"
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
              className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center text-xs text-gray-600 mt-3">
            Page {currentPage} of {totalPages}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProviderContent;
