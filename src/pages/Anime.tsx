import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ContentCarousel from "../components/ContentCarousel";
import HeroCarousel from "../components/HeroCarousel";
import { tmdbService } from "../services/tmdb";
import type { Movie } from "../services/tmdb";

const Anime: React.FC = () => {
  const [trendingAnime, setTrendingAnime] = useState<Movie[]>([]);
  const [popularAnime, setPopularAnime] = useState<Movie[]>([]);
  const [topRatedAnime, setTopRatedAnime] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setLoading(true);
        // Fetch Anime (Genre ID 16 is Animation)
        // Fetch Trending Anime Movies first for the Hero Section
        const popularMovies = await tmdbService.discover("movie", 1, 16);
        setTrendingAnime(popularMovies.results as Movie[]);
        setLoading(false); // Show Hero immediately

        // Fetch other data in the background
        const [popularTV, topRatedTV] = await Promise.all([
          tmdbService.discover("tv", 1, 16), // Animation TV Shows
          tmdbService.discover("tv", 1, 16), // Top Rated Animation (using discover for now)
        ]);

        setPopularAnime(popularTV.results as any[]);
        setTopRatedAnime(topRatedTV.results as any[]);
      } catch (error) {
        console.error("Error fetching anime:", error);
        setLoading(false);
      }
    };

    fetchAnime();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20">
      {/* Hero Carousel with Trending Anime Movies */}
      <HeroCarousel movies={trendingAnime} />

      <div className="relative z-10 container mx-auto px-4 md:px-8 -mt-20 space-y-12">
        {/* Popular Anime Series */}
        {popularAnime.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <ContentCarousel
              title="Popular Anime Series"
              data={popularAnime}
              mediaType="tv"
            />
          </motion.div>
        )}

        {/* Trending Anime Movies */}
        {trendingAnime.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ContentCarousel
              title="Trending Anime Movies"
              data={trendingAnime}
              mediaType="movie"
            />
          </motion.div>
        )}

        {/* Top Rated Anime */}
        {topRatedAnime.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ContentCarousel
              title="Top Rated Anime"
              data={topRatedAnime}
              mediaType="tv"
            />
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Anime;
