import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { tmdbService } from "../services/tmdb";
import type { Movie } from "../services/tmdb";
import MovieCard from "../components/MovieCard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import FilterBar from "../components/FilterBar";

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
        className="text-4xl md:text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500"
      >
        {selectedGenre
          ? `${genres.find((g) => g.id === selectedGenre)?.name} Movies`
          : "Explore Movies"}
      </motion.h1>

      <FilterBar
        genres={genres}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
        sortBy={sortBy}
        onSortChange={setSortBy}
        type="movie"
      />

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
