import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import ContentCarousel from "../components/ContentCarousel";
import NativeAd from "../components/NativeAd";
import MovieCard from "../components/MovieCard";
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
  const [seasonalMovies, setSeasonalMovies] = useState<Movie[]>([]);
  const [familyMovies, setFamilyMovies] = useState<Movie[]>([]);
  const [genres] = useState<Genre[]>([
    { id: 28, name: "Action" },
    { id: 12, name: "Adventure" },
    { id: 16, name: "Animation" },
    { id: 35, name: "Comedy" },
    { id: 878, name: "Sci-Fi" },
    { id: 18, name: "Drama" },
    { id: 27, name: "Horror" },
    { id: 53, name: "Thriller" },
  ]);
  const [trendingTV, setTrendingTV] = useState<TVShow[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Trending Movies first for the Hero Section
        const trendingM = await tmdbService.getTrending("movie", "week");
        setTrendingMovies(trendingM.results as Movie[]);
        setLoading(false); // Show Hero immediately

        // Fetch other data in the background
        const [
          popularM,
          topRatedS,
          topRatedM,
          upcomingM,
          trendingTV,
          nowPlayingM,
          seasonalM,
          familyM,
        ] = await Promise.all([
          tmdbService.getPopular("movie"),
          tmdbService.getTopRated("tv"),
          tmdbService.getTopRated("movie"),
          tmdbService.getUpcoming("movie"),
          tmdbService.getTrending("tv", "week"),
          tmdbService.getNowPlaying("movie"),
          tmdbService.getSeasonal("movie"), // New Seasonal Endpoint
          tmdbService.discover("movie", "1", "10751"), // Family Genre
        ]);

        setTop10Movies(popularM.results as Movie[]);
        setTop10Shows(topRatedS.results as TVShow[]);
        setTopRatedMovies(topRatedM.results as Movie[]);
        setUpcomingMovies(upcomingM.results as Movie[]); // upcomingM returns page 1 by default (20 items)
        setTrendingTV(trendingTV.results as TVShow[]);
        setNowPlayingMovies(nowPlayingM.results as Movie[]);
        setSeasonalMovies(seasonalM.results as Movie[]);
        setFamilyMovies(familyM.results as Movie[]);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Transform movies to TrendingItems with extra data
  const trendingItems: TrendingItem[] = trendingMovies.map((movie) => ({
    id: movie.id,
    title: movie.title,
    description: movie.overview,
    image: getImageUrl(movie.backdrop_path || movie.poster_path, "original"),
    rating: movie.vote_average,
    date: movie.release_date,
    media_type: "movie",
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
        {/* New Redesigned Trending Section */}
        {trendingItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <TrendingSection items={trendingItems.slice(0, 3)} />
          </motion.div>
        )}

        {/* Top Movies (Clean - No Numbers) */}
        {top10Movies && top10Movies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ContentCarousel title="Most Popular Movies">
              {top10Movies.map((movie) => (
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

        {/* Top IMDb Rated Movies (New Section) */}
        {topRatedMovies && topRatedMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.15 }}
          >
            <ContentCarousel title="Top IMDb Rated Movies">
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

        {/* Seasonal Picks (New Section) */}
        {seasonalMovies && seasonalMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ContentCarousel title="Seasonal Picks: Holiday Spirit">
              {seasonalMovies.map((movie) => (
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

        {/* Upcoming Movies */}
        {upcomingMovies && upcomingMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
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

        {/* Family Favorites (Other Category) */}
        {familyMovies && familyMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <ContentCarousel title="Family Togetherness">
              {familyMovies.map((movie) => (
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

        {/* Now Playing Movies */}
        {nowPlayingMovies && nowPlayingMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <ContentCarousel title="Now Playing in Theaters">
              {nowPlayingMovies.map((movie) => (
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

        {/* Trending TV Shows */}
        {trendingTV && trendingTV.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <ContentCarousel title="Trending TV Shows">
              {trendingTV.map((show) => (
                <MovieCard
                  key={show.id}
                  id={show.id}
                  title={show.name}
                  posterUrl={show.poster_path}
                  type="tv"
                />
              ))}
            </ContentCarousel>
          </motion.div>
        )}

        {/* Top TV Shows (Clean - No Numbers) */}
        {top10Shows && top10Shows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.45 }}
          >
            <ContentCarousel title="Top TV Shows">
              {top10Shows.map((show) => (
                <MovieCard
                  key={show.id}
                  id={show.id}
                  title={show.name}
                  posterUrl={show.poster_path}
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
            transition={{ duration: 0.6, delay: 0.5 + 0.05 * index }}
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
      const data = await tmdbService.discover("movie", "1", genreId.toString());
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
