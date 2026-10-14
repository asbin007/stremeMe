import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { tmdbService } from "../services/tmdb";
import type { Movie } from "../services/tmdb";
import MovieCard from "../components/MovieCard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import FilterBar from "../components/FilterBar";
import PlatformTabs from "../components/PlatformTabs";
import CategoryFAQ from "../components/CategoryFAQ";
import { CATEGORY_COPY } from "../constants/categoryCopy";
import { MovieCardSkeleton } from "../components/Skeleton";
import { SEOHead } from "../components/SEOHead";
import { generateBreadcrumbSchema, generateItemListSchema } from "../utils/seoUtils";
import { getImageUrl } from "../services/tmdb";

interface Genre {
  id: number;
  name: string;
}

const Movies: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<number | null>(null);
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
        providerId: selectedPlatform || undefined,
      });

      setMovies((prev) => {
        const newMovies = (data.results as Movie[]).filter(m => m.poster_path || m.backdrop_path);
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
  }, [page, selectedGenre, selectedPlatform, sortBy]);

  useEffect(() => {
    setMovies([]);
    setPage(1);
    setHasMore(true);
  }, [selectedGenre, selectedPlatform, sortBy]);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const lastMovieRef = useInfiniteScroll(
    () => setPage((prev) => prev + 1),
    hasMore,
    loading
  );

  const currentGenreName = selectedGenre ? genres.find((g) => g.id === selectedGenre)?.name : null;
  const pageTitle = currentGenreName
    ? `Free ${currentGenreName} Movies Online — Stream HD Movies | AuraScreen`
    : "Free Movies Online — Stream Latest HD Movies | AuraScreen";
  const pageDesc = currentGenreName
    ? `Watch the best free ${currentGenreName} movies online in HD on AuraScreen. No sign-up required.`
    : "Browse and stream thousands of free HD movies online. Watch top trending, action, comedy, horror, sci-fi movies and more.";

  const itemList = generateItemListSchema(
    currentGenreName ? `${currentGenreName} Movies` : "Popular Movies",
    movies.slice(0, 20).map(m => ({
      name: m.title,
      url: `/movie/${m.id}`,
      image: m.poster_path ? getImageUrl(m.poster_path, "w500") : undefined,
    }))
  );

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Movies", url: "/movies" },
    ...(currentGenreName ? [{ name: currentGenreName, url: `/movies?genre=${selectedGenre}` }] : [])
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground container mx-auto px-4 py-8">
      <SEOHead
        title={pageTitle}
        description={pageDesc}
        keywords={[
          "free movies",
          currentGenreName ? `${currentGenreName.toLowerCase()} movies` : "watch movies online",
          "HD movie streaming",
          "stream movies free",
          "AuraScreen"
        ]}
        structuredData={movies.length > 0 ? [breadcrumbs, itemList] : [breadcrumbs]}
      />
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500"
      >
        {selectedGenre
          ? `${genres.find((g) => g.id === selectedGenre)?.name} Movies`
          : "Explore Movies"}
      </motion.h1>

      <PlatformTabs selected={selectedPlatform} onSelect={setSelectedPlatform} />

      <FilterBar
        genres={genres}
        selectedGenre={selectedGenre}
        onSelectGenre={setSelectedGenre}
        sortBy={sortBy}
        onSortChange={setSortBy}
        type="movie"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
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

        {loading && (
          <>
            {Array.from({ length: 15 }).map((_, idx) => (
              <MovieCardSkeleton key={`skeleton-${idx}`} />
            ))}
          </>
        )}
      </div>

      <CategoryFAQ {...CATEGORY_COPY.movies} />
    </div>
  );
};

export default Movies;
