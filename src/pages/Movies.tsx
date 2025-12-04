import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { tmdbService } from "../services/tmdb";
import type { Movie } from "../services/tmdb";
import MovieCard from "../components/MovieCard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

interface Genre {
  id: number;
  name: string;
}

const Movies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState("popularity.desc");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await tmdbService.getGenres("movie");
        setGenres(data.genres);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    fetchGenres();
  }, []);

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const data = await tmdbService.getContents("movie", {
        page,
        sortBy,
        genreId: selectedGenre || undefined,
      });

      setMovies((prev) => {
        const newMovies = data.results as Movie[];
        // Filter out duplicates
        const uniqueMovies = newMovies.filter(
          (newMovie) => !prev.some((existing) => existing.id === newMovie.id)
        );
        return page === 1 ? newMovies : [...prev, ...uniqueMovies];
      });
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setLoading(false);
    }
  }, [page, selectedGenre, sortBy]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [selectedGenre, sortBy]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const lastMovieRef = useInfiniteScroll(
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
          ? `${genres.find((g) => g.id === selectedGenre)?.name} Movies`
          : "Explore Movies"}
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
          <option value="primary_release_date.desc">Newest</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {movies.map((movie, index) => {
          if (movies.length === index + 1) {
            return (
              <div ref={lastMovieRef} key={movie.id}>
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.poster_path}
                  type="movie"
                />
              </div>
            );
          } else {
            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (index % 20) * 0.05 }}
              >
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.poster_path}
                  type="movie"
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

export default Movies;
