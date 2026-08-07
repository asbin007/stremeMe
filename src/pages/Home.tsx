import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import ContentCarousel from "../components/ContentCarousel";

import MovieCard from "../components/MovieCard";
import NetworkProviders from "../components/NetworkProviders";
import VideoPlayer from "../components/VideoPlayer";
import HeroCarousel from "../components/HeroCarousel";
import { tmdbService, getImageUrl } from "../services/tmdb";
import type { Movie, TVShow } from "../services/tmdb";
import { TrendingSection } from "../components/TrendingSection";
import type { TrendingItem } from "../components/TrendingSection";
import { HeroSkeleton, CarouselSkeleton } from "../components/Skeleton";
import { fetchFavorites, fetchHistory, fetchWatchlist } from "../store/userSlice";
import type { RootState, AppDispatch } from "../store/store";
import { Link } from "react-router-dom";
import { Film, Flame, MonitorPlay, Sparkles, Tv } from "lucide-react";
import { isPlayableMedia, toMovieCardProps } from "../types/media";

interface Genre {
  id: number;
  name: string;
}

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { favorites, history, watchLater } = useSelector((state: RootState) => state.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [recommendedForYou, setRecommendedForYou] = useState<Movie[]>([]);

  const [showPlayer, setShowPlayer] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [trendingToday, setTrendingToday] = useState<(Movie | TVShow)[]>([]);
  const [top10Movies, setTop10Movies] = useState<Movie[]>([]);
  const [top10Shows, setTop10Shows] = useState<TVShow[]>([]);
  const [topRatedMovies, setTopRatedMovies] = useState<Movie[]>([]);
  const [seasonalMovies, setSeasonalMovies] = useState<Movie[]>([]);
  const [familyMovies, setFamilyMovies] = useState<Movie[]>([]);
  const [bollywoodMovies, setBollywoodMovies] = useState<Movie[]>([]);
  const [southMovies, setSouthMovies] = useState<Movie[]>([]);
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
    if (isAuthenticated) {
      dispatch(fetchHistory());
      dispatch(fetchWatchlist());
      dispatch(fetchFavorites());
    }
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      const lastWatchedMovie = history.find(item => item.mediaType === 'movie');
      if (lastWatchedMovie?.mediaId) {
        try {
          const recs = await tmdbService.getRecommendations('movie', Number(lastWatchedMovie.mediaId));
          setRecommendedForYou(recs.results as Movie[]);
        } catch (error) {
          console.error("Error fetching recommendations:", error);
        }
      }
    };
    if (history && history.length > 0) {
      fetchRecommendations();
    }
  }, [history]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Trending Movies first for the Hero Section
        const trendingM = await tmdbService.getTrending("movie", "week");
        setTrendingMovies((trendingM.results as Movie[]).filter(m => m.poster_path || m.backdrop_path));
        setLoading(false); // Show Hero immediately

        // Fetch other data in the background
        const [
          popularM,
          topRatedS,
          topRatedM,
          trendingTV,
          nowPlayingM,
          seasonalM,
          familyM,
          bollywoodM,
          southM,
          trendingDay,
        ] = await Promise.all([
          tmdbService.getPopular("movie"),
          tmdbService.getTopRated("tv"),
          tmdbService.getTopRated("movie"),
          tmdbService.getTrending("tv", "week"),
          tmdbService.getNowPlaying("movie"),
          tmdbService.getSeasonal("movie"), // New Seasonal Endpoint
          tmdbService.discover("movie", 1, "10751"), // Family Genre
          tmdbService.getBollywoodMovies(),
          tmdbService.getSouthMovies(),
          tmdbService.getTrending("all", "day"),
        ]);

        setTop10Movies((popularM.results as Movie[]).filter(m => m.poster_path || m.backdrop_path));
        setTop10Shows((topRatedS.results as TVShow[]).filter(s => s.poster_path || s.backdrop_path));
        setTopRatedMovies((topRatedM.results as Movie[]).filter(m => m.poster_path || m.backdrop_path));
        setTrendingTV((trendingTV.results as TVShow[]).filter(s => s.poster_path || s.backdrop_path));
        setNowPlayingMovies((nowPlayingM.results as Movie[]).filter(m => m.poster_path || m.backdrop_path));
        setSeasonalMovies((seasonalM.results as Movie[]).filter(m => m.poster_path || m.backdrop_path));
        setFamilyMovies((familyM.results as Movie[]).filter(m => m.poster_path || m.backdrop_path));
        setBollywoodMovies((bollywoodM.results as Movie[]).filter(m => m.poster_path || m.backdrop_path));
        setSouthMovies((southM.results as Movie[]).filter(m => m.poster_path || m.backdrop_path));
        setTrendingToday((trendingDay.results as (Movie | TVShow)[]).filter(item => item.poster_path || item.backdrop_path));
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
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20">
        <HeroSkeleton />
        <div className="space-y-8 mt-12">
          <CarouselSkeleton />
          <CarouselSkeleton />
          <CarouselSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20">
      {/* Hero Carousel */}
      <HeroCarousel movies={trendingMovies} />

      {/* Content Sections */}
      <div className="relative mx-auto space-y-8 md:space-y-12">
        {/* Category Rail - Positioned below hero with proper spacing */}
        <div className="-mt-12 md:-mt-20 pb-8">
          <CategoryRail />
        </div>

        {/* Providers Section — like CineHD */}
        <NetworkProviders />
        
        {/* Continue Watching / History */}
        {history && history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <ContentCarousel title="Continue Watching">
              {history.map((item) => (
                <MovieCard
                  key={`history-${item.id}`}
                  id={Number(item.mediaId)}
                  title={item.title}
                  posterUrl={item.posterPath}
                  type={item.mediaType === "tv" ? "tv" : "movie"}
                />
              ))}
            </ContentCarousel>
          </motion.div>
        )}

        {/* Favorites */}
        {favorites && favorites.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            <ContentCarousel title="Favorites">
              {favorites.map((item) => (
                <MovieCard
                  key={`favorite-${item.mediaType}-${item.id}`}
                  id={Number(item.id)}
                  title={item.title}
                  posterUrl={item.posterPath}
                  type={item.mediaType}
                />
              ))}
            </ContentCarousel>
          </motion.div>
        )}

        {/* Watchlist */}
        {watchLater && watchLater.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.08 }}
          >
            <ContentCarousel title="Watchlist">
              {watchLater.map((item) => (
                <MovieCard
                  key={`watchlist-${item.mediaType}-${item.id}`}
                  id={Number(item.id)}
                  title={item.title}
                  posterUrl={item.posterPath}
                  type={item.mediaType}
                />
              ))}
            </ContentCarousel>
          </motion.div>
        )}

        {/* Trending Today */}
        {trendingToday && trendingToday.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ContentCarousel title="Trending Today">
              {trendingToday
                .filter(isPlayableMedia)
                .map((item) => (
                  <MovieCard
                    key={`today-${item.media_type}-${item.id}`}
                    {...toMovieCardProps(item)}
                  />
                ))}
            </ContentCarousel>
          </motion.div>
        )}

        {/* Recommended for You */}
        {recommendedForYou && recommendedForYou.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <ContentCarousel title="Recommended for You">
              {recommendedForYou.map((movie) => (
                <MovieCard
                  key={`rec-${movie.id}`}
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.poster_path || movie.backdrop_path}
                  type="movie"
                />
              ))}
            </ContentCarousel>
          </motion.div>
        )}

        {/* New Redesigned Trending Section */}
        {trendingItems.length > 0 && (
          <motion.div
            id="trending"
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
            <ContentCarousel title="Movies">
              {top10Movies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.poster_path || movie.backdrop_path}
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
                  posterUrl={movie.poster_path || movie.backdrop_path}
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
                  posterUrl={movie.poster_path || movie.backdrop_path}
                  type="movie"
                />
              ))}
            </ContentCarousel>
          </motion.div>
        )}

        {/* Upcoming Movies */}
        {nowPlayingMovies && nowPlayingMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <h2 className="text-xl md:text-3xl font-bold mb-4 md:mb-6 text-white flex items-center gap-2 md:gap-3 px-4 md:px-12">
              <span className="w-1 h-6 md:w-1.5 md:h-8 bg-accent rounded-full"></span>
              Recently Added
            </h2>
            <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-6 px-4 md:px-12">
              {nowPlayingMovies.slice(0, 16).map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.poster_path || movie.backdrop_path}
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
                  posterUrl={movie.poster_path || movie.backdrop_path}
                  type="movie"
                />
              ))}
            </ContentCarousel>
          </motion.div>
        )}

        {/* Best of Bollywood */}
        {bollywoodMovies && bollywoodMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.32 }}
          >
            <ContentCarousel title="Best of Bollywood">
              {bollywoodMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.poster_path || movie.backdrop_path}
                  type="movie"
                />
              ))}
            </ContentCarousel>
          </motion.div>
        )}

        {/* South Indian Hits */}
        {southMovies && southMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.34 }}
          >
            <ContentCarousel title="South Indian Hits">
              {southMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  posterUrl={movie.poster_path || movie.backdrop_path}
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
            <ContentCarousel title="Series">
              {trendingTV.map((show) => (
                <MovieCard
                  key={show.id}
                  id={show.id}
                  title={show.name}
                  posterUrl={show.poster_path || show.backdrop_path}
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
                  posterUrl={show.poster_path || show.backdrop_path}
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
      const data = await tmdbService.discover("movie", 1, genreId.toString());
      setMovies((data.results as Movie[]).filter(m => m.poster_path || m.backdrop_path));
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

function CategoryRail() {
  const categories = [
    { label: "Trending", to: "#trending", icon: Flame },
    { label: "Movies", to: "/movies", icon: Film },
    { label: "Series", to: "/tv", icon: Tv },
    { label: "Anime", to: "/anime", icon: Sparkles },
    { label: "Live TV", to: "/live-tv", icon: MonitorPlay },
  ];

  return (
    <div className="px-4 md:px-12 pb-8">
      <div className="flex gap-2 md:gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map((category) => {
          const Icon = category.icon;
          const className =
            "flex h-10 md:h-12 shrink-0 items-center gap-1.5 md:gap-2 rounded-lg border border-white/10 bg-black/50 px-3 md:px-4 text-xs md:text-sm font-semibold text-white backdrop-blur-md transition hover:border-accent/60 hover:bg-white/10";

          if (category.to.startsWith("#")) {
            return (
              <a key={category.label} href={category.to} className={className}>
                <Icon className="h-4 w-4 text-accent" />
                {category.label}
              </a>
            );
          }

          return (
            <Link key={category.label} to={category.to} className={className}>
              <Icon className="h-4 w-4 text-accent" />
              {category.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export default Home;
