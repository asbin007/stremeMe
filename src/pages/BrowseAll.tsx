import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { tmdbService } from "../services/tmdb";
import type { Movie, TVShow } from "../services/tmdb";
import MovieCard from "../components/MovieCard";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";
import { MovieCardSkeleton } from "../components/Skeleton";
import type { MediaItem } from '../types/media';

type CategoryConfig = {
  title: string;
  mediaType: "movie" | "tv";
  fetcher: (page: number) => Promise<{ results: MediaItem[]; total_pages: number; page: number }>;
};

const CATEGORIES: Record<string, CategoryConfig> = {
  // Anime categories
  "anime-series": {
    title: "Popular Anime Series",
    mediaType: "tv",
    fetcher: (page) => tmdbService.getAnimeSeries(page),
  },
  "anime-movies": {
    title: "Anime Movies",
    mediaType: "movie",
    fetcher: (page) => tmdbService.getAnimeMovies(page),
  },
  "anime-action": {
    title: "Action Anime",
    mediaType: "tv",
    fetcher: (page) => tmdbService.getAnimeAction(page),
  },
  "anime-romance": {
    title: "Romance & Drama Anime",
    mediaType: "tv",
    fetcher: (page) => tmdbService.getAnimeRomance(page),
  },
  // Hindi Movies categories
  "hindi-new-releases": {
    title: "Hindi New Releases",
    mediaType: "movie",
    fetcher: (page) => tmdbService.getHindiNewReleases(page),
  },
  "hindi-action": {
    title: "Bollywood Action",
    mediaType: "movie",
    fetcher: (page) => tmdbService.getHindiActionMovies(page),
  },
  "hindi-romance": {
    title: "Bollywood Romance",
    mediaType: "movie",
    fetcher: (page) => tmdbService.getHindiRomanceMovies(page),
  },
  "hindi-comedy": {
    title: "Bollywood Comedy",
    mediaType: "movie",
    fetcher: (page) => tmdbService.getHindiComedyMovies(page),
  },
  "south-action": {
    title: "South Indian Action",
    mediaType: "movie",
    fetcher: (page) => tmdbService.getSouthActionMovies(page),
  },
  // General categories
  "bollywood": {
    title: "Bollywood Movies",
    mediaType: "movie",
    fetcher: (page) => tmdbService.getBollywoodMovies(page),
  },
};

const BrowseAll: React.FC = () => {
  const { category } = useParams<{ category: string }>();
  const navigate = useNavigate();
  // `MediaItem`, not `Movie | TVShow`: the category fetchers hit mixed
  // endpoints, and TMDB omits `name` on films and `title` on series.
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const config = category ? CATEGORIES[category] : undefined;

  const fetchItems = useCallback(async () => {
    if (!config) return;
    try {
      setLoading(true);
      const data = await config.fetcher(page);

      setItems((prev) => {
        const newItems = (data.results || []).filter(
          (item: MediaItem) => item.poster_path || item.backdrop_path
        );
        const uniqueItems = newItems.filter(
          (newItem: MediaItem) => !prev.some((existing) => existing.id === newItem.id)
        );
        return page === 1 ? newItems : [...prev, ...uniqueItems];
      });
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error("Error fetching content:", error);
    } finally {
      setLoading(false);
    }
  }, [page, config]);

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
  }, [category]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const lastItemRef = useInfiniteScroll(
    () => setPage((prev) => prev + 1),
    hasMore,
    loading
  );

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Category not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground container mx-auto px-4 py-8">
      {/* Back button + Title */}
      <div className="flex items-center gap-3 mb-8">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/30 hover:bg-white/10 transition-all"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </button>
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-500"
        >
          {config.title}
        </motion.h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
        {items.map((item, index) => {
          const title = (item as Movie).title || (item as TVShow).name;
          const type = config.mediaType === "tv" ? "show" : "movie";

          if (items.length === index + 1) {
            return (
              <div ref={lastItemRef} key={item.id}>
                <MovieCard
                  id={item.id}
                  title={title}
                  posterUrl={item.poster_path || item.backdrop_path || ""}
                  type={type}
                />
              </div>
            );
          }
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index % 20) * 0.05 }}
            >
              <MovieCard
                id={item.id}
                title={title}
                posterUrl={item.poster_path || item.backdrop_path || ""}
                type={type}
              />
            </motion.div>
          );
        })}

        {loading && (
          <>
            {Array.from({ length: 16 }).map((_, idx) => (
              <MovieCardSkeleton key={`skeleton-${idx}`} />
            ))}
          </>
        )}
      </div>

      {!loading && items.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p>No content found</p>
        </div>
      )}
    </div>
  );
};

export default BrowseAll;
