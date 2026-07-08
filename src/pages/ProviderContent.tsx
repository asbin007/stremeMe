import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ContentCarousel from "../components/ContentCarousel";
import MovieCard from "../components/MovieCard";
import { MovieCardSkeleton } from "../components/Skeleton";

interface ProviderMeta {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

const ProviderContent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get("watch_provider") || "";
  const [provider, setProvider] = useState<ProviderMeta | null>(null);
  const [trendingMovies, setTrendingMovies] = useState<any[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<any[]>([]);
  const [newMovies, setNewMovies] = useState<any[]>([]);
  const [tvShows, setTvShows] = useState<any[]>([]);
  const [topRatedTV, setTopRatedTV] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;

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
    return (data.results || []).filter(
      (item: any) => item.poster_path || item.backdrop_path
    );
  };

  useEffect(() => {
    if (!providerId) return;

    const fetchAll = async () => {
      setLoading(true);

      // Fetch provider meta
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
        const found = data.results?.find(
          (p: any) => p.provider_id === Number(providerId)
        );
        if (found) setProvider(found);
      } catch (e) {
        console.error(e);
      }

      // Fetch content sections in parallel
      const [trending, topRated, newest, shows, topTV] = await Promise.all([
        fetchFromProvider("movie", "popularity.desc"),
        fetchFromProvider("movie", "vote_average.desc"),
        fetchFromProvider("movie", "primary_release_date.desc"),
        fetchFromProvider("tv", "popularity.desc"),
        fetchFromProvider("tv", "vote_average.desc"),
      ]);

      setTrendingMovies(trending);
      setTopRatedMovies(topRated);
      setNewMovies(newest);
      setTvShows(shows);
      setTopRatedTV(topTV);
      setLoading(false);
    };

    fetchAll();
  }, [providerId]);

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
      </div>

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
    </div>
  );
};

export default ProviderContent;
