import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { tmdbService } from "../services/tmdb";
import type { TVShow } from "../services/tmdb";
import MovieCard from "../components/MovieCard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

interface Genre {
  id: number;
  name: string;
}

const TVShows: React.FC = () => {
  const [shows, setShows] = useState<TVShow[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await tmdbService.getGenres("tv");
        setGenres(data.genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  const fetchShows = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tmdbService.getContents("tv", {
        page,
        sortBy,
        genreId: selectedGenre || undefined,
      });

      setShows((prev) => {
        const newShows = data.results as TVShow[];
        // Filter out duplicates
        const uniqueShows = newShows.filter(
          (newShow) => !prev.some((existing) => existing.id === newShow.id)
        );
        return page === 1 ? newShows : [...prev, ...uniqueShows];
      });
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error("Error fetching TV shows:", error);
    } finally {
      setLoading(false);
    }
  }, [page, selectedGenre, sortBy]);

  useEffect(() => {
    setShows([]);
    setPage(1);
    setHasMore(true);
  }, [selectedGenre, sortBy]);

  useEffect(() => {
    fetchShows();
  }, [fetchShows]);

  const lastShowRef = useInfiniteScroll(
    () => setPage((prev) => prev + 1),
    hasMore,
    loading
  );

  return (
    <div className="min-h-screen bg-background text-foreground container mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold mb-8 text-center"
      >
        {selectedGenre
          ? `${genres.find((g) => g.id === selectedGenre)?.name} Shows`
          : "Explore TV Shows"}
      </motion.h1>

      <div className="flex flex-col md:flex-row gap-4 mb-8 items-center justify-between">
        {/* Genre Selector */}
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide max-w-full md:max-w-[70%]">
          <button
            onClick={() => setSelectedGenre(null)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedGenre === null
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
          >
            All
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => setSelectedGenre(genre.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                selectedGenre === genre.id
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
        >
          <option value="popularity.desc">Popular</option>
          <option value="vote_average.desc">Top Rated</option>
          <option value="first_air_date.desc">Newest</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {shows.map((show, index) => {
          if (shows.length === index + 1) {
            return (
              <div ref={lastShowRef} key={show.id}>
                <MovieCard
                  id={show.id}
                  title={show.name}
                  posterUrl={show.poster_path}
                  type="show"
                />
              </div>
            );
          } else {
            return (
              <motion.div
                key={show.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % 20) * 0.05 }}
              >
                <MovieCard
                  id={show.id}
                  title={show.name}
                  posterUrl={show.poster_path}
                  type="show"
                />
              </motion.div>
            );
          }
        })}
      </div>
      {loading && (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      )}
    </div>
  );
};

export default TVShows;
