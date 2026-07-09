import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Search } from "lucide-react";

interface ProviderData {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

// Curated top providers by category
const POPULAR_IDS = [8, 9, 350, 337, 15, 1899, 283, 386, 531, 43, 73, 300, 207, 526, 520, 257, 11, 191];
const STREAMING_IDS = [8, 9, 350, 337, 15, 1899, 283, 386, 531, 43, 387, 520, 526, 430, 73, 300, 207, 258, 11, 191, 99, 87, 151, 529, 538, 464];
const FREE_IDS = [73, 300, 207, 332, 235, 638, 613, 83, 318, 439, 446, 538, 2478];

type FilterCategory = "all" | "popular" | "streaming" | "free";

const Providers: React.FC = () => {
  const [allProviders, setAllProviders] = useState<ProviderData[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterCategory>("popular");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
        const response = await fetch(
          "https://api.themoviedb.org/3/watch/providers/movie?watch_region=US&language=en-US",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        if (data.results) {
          setAllProviders(data.results);
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProviders();
  }, []);

  // Apply filter
  useEffect(() => {
    let result = allProviders;

    if (filter === "popular") {
      result = POPULAR_IDS
        .map((id) => allProviders.find((p) => p.provider_id === id))
        .filter(Boolean) as ProviderData[];
    } else if (filter === "streaming") {
      result = STREAMING_IDS
        .map((id) => allProviders.find((p) => p.provider_id === id))
        .filter(Boolean) as ProviderData[];
    } else if (filter === "free") {
      result = FREE_IDS
        .map((id) => allProviders.find((p) => p.provider_id === id))
        .filter(Boolean) as ProviderData[];
    }

    // Apply search
    if (searchTerm.trim()) {
      result = allProviders.filter((p) =>
        p.provider_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProviders(result);
  }, [allProviders, filter, searchTerm]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-20 px-4 md:px-12">
        <div className="container mx-auto">
          <div className="h-10 w-48 bg-secondary/20 rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-64 bg-secondary/20 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-secondary/20 animate-pulse" />
                <div className="w-12 h-3 bg-secondary/20 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filters: { id: FilterCategory; label: string }[] = [
    { id: "popular", label: "Popular" },
    { id: "streaming", label: "Subscription" },
    { id: "free", label: "Free" },
    { id: "all", label: "All Providers" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-12">
      <div className="container mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">
          Providers
        </h1>
        <p className="text-gray-400 text-sm md:text-base mb-6">
          Browse content by streaming platform
        </p>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => { setFilter(f.id); setSearchTerm(""); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filter === f.id && !searchTerm
                    ? "bg-white text-black"
                    : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search providers */}
          <div className="relative w-full sm:w-64 sm:ml-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search providers..."
              className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>

        {/* Providers Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9 gap-4 md:gap-5">
          {filteredProviders.map((provider) => (
            <Link
              key={provider.provider_id}
              to={`/provider?watch_provider=${provider.provider_id}`}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-white/40 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl bg-secondary">
                <img
                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                  alt={provider.provider_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://image.tmdb.org/t/p/original${provider.logo_path}`;
                  }}
                />
              </div>
              <span className="text-[10px] md:text-xs text-gray-500 group-hover:text-white transition-colors text-center line-clamp-2 max-w-[80px]">
                {provider.provider_name}
              </span>
            </Link>
          ))}
        </div>

        {filteredProviders.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <p>No providers found{searchTerm ? ` for "${searchTerm}"` : ""}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Providers;
