import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { tmdbService } from "../services/tmdb";
import type { TVShow } from "../services/tmdb";
import MovieCard from "../components/MovieCard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import FilterBar from "../components/FilterBar";
import { MovieCardSkeleton } from "../components/Skeleton";

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
        const newShows = (data.results as TVShow[]).filter(s => s.poster_path || s.backdrop_path);
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
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500"
      >
        {selectedGenre
          ? `${genres.find((g) => g.id === selectedGenre)?.name} Shows`
          : "Explore TV Shows"}
      </motion.h1>

      <FilterBar
        genres={genres}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
        sortBy={sortBy}
        onSortChange={setSortBy}
        type="tv"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
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

        {loading && (
          <>
            {Array.from({ length: 15 }).map((_, idx) => (
              <MovieCardSkeleton key={`skeleton-${idx}`} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default TVShows;
