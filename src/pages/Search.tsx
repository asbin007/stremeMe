import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Search as SearchIcon,
  Loader2,
  Film,
  Clock,
  X,
  ArrowUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { tmdbService, getImageUrl } from "../services/tmdb";

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(query);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"relevance" | "rating" | "year">(
    "relevance"
  );
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Keyboard shortcut to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Sync query to searchTerm (for back/forward navigation)
  useEffect(() => {
    setSearchTerm(query);
  }, [query]);

  // Debounce input to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== query) {
        setSearchParams(searchTerm.trim() ? { q: searchTerm } : {});
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm, query, setSearchParams]);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await tmdbService.searchMulti(query);
        const filteredResults = data.results.filter(
          (item: any) => 
            (item.media_type === "movie" || item.media_type === "tv") && 
            (item.poster_path || item.backdrop_path)
        );

        // Apply sorting
        if (sortBy === "rating") {
          filteredResults.sort(
            (a: any, b: any) => b.vote_average - a.vote_average
          );
        } else if (sortBy === "year") {
          filteredResults.sort((a: any, b: any) => {
            const dateA = new Date(
              a.release_date || a.first_air_date || 0
            ).getTime();
            const dateB = new Date(
              b.release_date || b.first_air_date || 0
            ).getTime();
            return dateB - dateA;
          });
        }

        setResults(filteredResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, sortBy]);

  const addToRecentSearches = (term: string) => {
    if (!term.trim()) return;
    setRecentSearches((prev) => {
      const newSearches = [term, ...prev.filter((s) => s !== term)].slice(0, 5);
      localStorage.setItem("recentSearches", JSON.stringify(newSearches));
      return newSearches;
    });
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const newSearches = prev.filter((s) => s !== term);
      localStorage.setItem("recentSearches", JSON.stringify(newSearches));
      return newSearches;
    });
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("recentSearches");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm });
      addToRecentSearches(searchTerm);
    }
  };

  const handleItemClick = (item: any) => {
    if (query) {
      addToRecentSearches(query);
    }
    navigate(`/${item.media_type}/${item.id}`);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, scale: 0.9 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <div className="min-h-screen pt-24 px-4 container mx-auto pb-20">
      <div className="max-w-4xl mx-auto mb-8">
        <form onSubmit={handleSearch} className="relative group mb-6">
          <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted h-6 w-6 group-focus-within:text-accent transition-colors" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search movies, TV shows... (Press '/')"
            className="w-full bg-secondary/50 backdrop-blur-sm border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-lg text-white placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-lg"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm("");
                setSearchParams({});
              }}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </form>

        {/* Controls: Recent Searches & Sorting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          {/* Recent Searches Chips */}
          {recentSearches.length > 0 && !query && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-text-muted flex items-center gap-1">
                <Clock className="w-4 h-4" /> Recent:
              </span>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => {
                    setSearchTerm(term);
                    setSearchParams({ q: term });
                  }}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-3 py-1 text-sm text-gray-300 flex items-center gap-2 transition-colors group"
                >
                  {term}
                  <X
                    className="w-3 h-3 opacity-0 group-hover:opacity-100 hover:text-red-400"
                    onClick={(e) => removeRecentSearch(term, e)}
                  />
                </button>
              ))}
              <button
                onClick={clearRecentSearches}
                className="text-xs text-text-muted hover:text-white underline ml-2"
              >
                Clear
              </button>
            </div>
          )}
          {/* Sorting Dropdown */}
          {results.length > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <ArrowUpDown className="w-4 h-4 text-text-muted" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-secondary/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-accent"
              >
                <option value="relevance">Relevance</option>
                <option value="rating">Top Rated</option>
                <option value="year">Newest First</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 text-accent animate-spin mb-4" />
          <p className="text-text-muted">Searching global database...</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {results.length > 0 ? (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-6"
            >
              {results.map((result) => (
                <motion.div
                  key={result.id}
                  variants={item}
                  onClick={() => handleItemClick(result)}
                  className="group relative rounded-xl overflow-hidden cursor-pointer bg-secondary/20 border border-white/5 hover:border-accent/50 transition-all hover:shadow-2xl hover:shadow-accent/10"
                >
                  <div className="aspect-[2/3] w-full bg-secondary relative overflow-hidden">
                    {result.poster_path ? (
                      <img
                        src={getImageUrl(result.poster_path)}
                        alt={result.title || result.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-secondary">
                        <Film className="w-12 h-12 text-white/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">
                        {result.title || result.name}
                      </h3>
                      <div className="flex items-center justify-between text-xs text-text-muted">
                        <span className="capitalize bg-accent/20 px-2 py-0.5 rounded text-accent">
                          {result.media_type}
                        </span>
                        <span>
                          {
                            (
                              result.release_date || result.first_air_date
                            )?.split("-")[0]
                          }
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : query ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Film className="w-16 h-16 text-text-muted mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-medium text-white mb-2">
                No results found
              </h3>
              <p className="text-text-muted">
                We couldn't find anything matching "{query}"
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <SearchIcon className="w-10 h-10 text-accent" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                What are you looking for?
              </h3>
              <p className="text-text-muted max-w-md mx-auto">
                Search for movies, TV shows, or people. Use{" "}
                <kbd className="bg-white/10 px-2 py-0.5 rounded text-xs border border-white/20">
                  /
                </kbd>{" "}
                to search anytime.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

export default Search;
