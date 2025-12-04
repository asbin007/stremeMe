import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";
import { tmdbService, getImageUrl } from "../services/tmdb";

const Search: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState(query);

  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await tmdbService.searchMulti(query);
        // Filter out people, only show movies and tv shows
        const filteredResults = data.results.filter(
          (item: any) => item.media_type === "movie" || item.media_type === "tv"
        );
        setResults(filteredResults);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm });
    }
  };

  const handleItemClick = (item: any) => {
    navigate(`/${item.media_type}/${item.id}`);
  };

  return (
    <div className="min-h-screen pt-24 px-4 container mx-auto">
      <div className="max-w-2xl mx-auto mb-12">
        <form onSubmit={handleSearch} className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted h-5 w-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for movies or TV shows..."
            className="w-full bg-secondary border border-white/10 rounded-full py-4 pl-12 pr-6 text-white placeholder-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
          />
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              className="group relative rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105"
            >
              <div className="aspect-[2/3] w-full bg-secondary">
                <img
                  src={getImageUrl(item.poster_path)}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-sm line-clamp-2">
                  {item.title || item.name}
                </h3>
                <div className="flex items-center space-x-2 text-xs text-text-muted mt-1">
                  <span className="capitalize">{item.media_type}</span>
                  <span>•</span>
                  <span>
                    {(item.release_date || item.first_air_date)?.split("-")[0]}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && query && results.length === 0 && (
        <div className="text-center text-text-muted mt-12">
          No results found for "{query}"
        </div>
      )}
    </div>
  );
};

export default Search;
