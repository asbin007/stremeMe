import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import ContentCarousel from "../components/ContentCarousel";
import NativeAd from "../components/NativeAd";
import MovieCard from "../components/MovieCard";
import Top10Card from "../components/Top10Card";
import VideoPlayer from "../components/VideoPlayer";
import HeroCarousel from "../components/HeroCarousel";
import { tmdbService, getImageUrl } from "../services/tmdb";
import type { Movie, TVShow } from "../services/tmdb";
import { TrendingSection } from "../components/TrendingSection";
import type { TrendingItem } from "../components/TrendingSection";

interface Genre {
  id: number;
  name: string;
}

const Home: React.FC = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [top10Movies, setTop10Movies] = useState<Movie[]>([]);
  const [top10Shows, setTop10Shows] = useState<TVShow[]>([]);
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [genres] = useState<Genre[]>([
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 878, name: "Sci-Fi" },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Trending Movies first for the Hero Section
        const trendingM = await tmdbService.getTrending("movie", "week");
        setTrendingMovies(trendingM.results as Movie[]);
        setLoading(false); // Show Hero immediately

        // Fetch other data in the background
        const [popularM, topRatedS, topRatedM] = await Promise.all([
          tmdbService.getPopular("movie"),
          tmdbService.getTopRated("tv"),
          tmdbService.getTopRated("movie"),
        ]);

        setTop10Movies(popularM.results.slice(0, 10) as Movie[]);
        setTop10Shows(topRatedS.results.slice(0, 10) as TVShow[]);
        setTopRatedMovies(topRatedM.results.slice(0, 10) as Movie[]);
        setUpcomingMovies(popularM.results.slice(10, 20) as Movie[]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform movies to TrendingItems
  const trendingItems: TrendingItem[] = trendingMovies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    description: movie.overview,
    image: getImageUrl(movie.backdrop_path || movie.poster_path, "original"),
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20">
      {/* Hero Carousel */}
      <HeroCarousel movies={trendingMovies} />

      <NativeAd />

      {/* Content Sections */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 -mt-20 space-y-12">
        {/* Trending Now Section */}
        {trendingItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <TrendingSection items={trendingItems.slice(0, 4)} />
          </motion.div>
        )}

        {/* Top 10 Movies */}
        {top10Movies && top10Movies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ContentCarousel title="Top 10 Movies Today">
              {top10Movies.map((movie, index) => (
                <Top10Card
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.poster_path}
                  rank={index + 1}
                  type="movie"
                />
              ))}
            </ContentCarousel>
          </motion.div>
        )}

        {/* Upcoming Movies */}
        {upcomingMovies && upcomingMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white flex items-center gap-3 px-4 md:px-12">
              <span className="w-1.5 h-8 bg-accent rounded-full"></span>
              Upcoming Releases
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 px-4 md:px-12">
              {upcomingMovies.slice(0, 5).map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.poster_path}
                  type="movie"
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Top Rated Movies */}
        {topRatedMovies && topRatedMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ContentCarousel title="Critically Acclaimed Movies">
              {topRatedMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.poster_path}
                  type="movie"
                />
              ))}
            </ContentCarousel>
          </motion.div>
        )}

        {/* Top 10 Shows */}
        {top10Shows && top10Shows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ContentCarousel title="Top 10 TV Shows Today">
              {top10Shows.map((show, index) => (
                <Top10Card
                  key={show.id}
                  id={show.id}
                  title={show.name}
                  posterUrl={show.poster_path}
                  rank={index + 1}
                  type="show"
                />
              ))}
            </ContentCarousel>
          </motion.div>
        )}

        {/* Genre-based sections */}
        {genres.map((genre, index) => (
          <motion.div
            key={genre.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 * index }}
          >
            <GenreSection genreId={genre.id} genreName={genre.name} />
          </motion.div>
        ))}
      </div>

      <VideoPlayer
        videoUrl={null} // Placeholder until we fetch video
        onClose={() => setShowPlayer(false)}
      />

      {showPlayer && (
        <div
          className="fixed inset-0 z-40 bg-black/90"
          onClick={() => setShowPlayer(false)}
        />
      )}
    </div>
  );
};

function GenreSection({
  genreId,
  genreName,
}: {
  genreId: number;
  genreName: string;
}) {
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    const fetchGenreMovies = async () => {
      // Note: In a real app, we'd use discover API with with_genres
      const data = await tmdbService.discover("movie", 1, genreId);
      setMovies(data.results as Movie[]);
    };
    fetchGenreMovies();
  }, [genreId]);

  if (!movies || movies.length === 0) return null;

  return (
    <ContentCarousel title={`${genreName} Movies`}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          id={movie.id}
          title={movie.title}
          posterUrl={movie.poster_path}
          type="movie"
        />
      ))}
    </ContentCarousel>
  );
}

export default Home;
