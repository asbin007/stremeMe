import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";

import ContentCarousel from "../components/ContentCarousel";
import BackdropCard from "../components/BackdropCard";

import MovieCard from "../components/MovieCard";
import NetworkProviders from "../components/NetworkProviders";
import ContinueWatchingCard from "../components/ContinueWatchingCard";
import VideoPlayer from "../components/VideoPlayer";
import HeroCarousel from "../components/HeroCarousel";
import { tmdbService, getImageUrl, MAX_BACKDROP_SIZE } from "../services/tmdb";
import type { Movie, TVShow } from "../services/tmdb";
import { TrendingSection } from "../components/TrendingSection";
import type { TrendingItem } from "../components/TrendingSection";
import { HeroSkeleton, CarouselSkeleton } from "../components/Skeleton";
import { fetchFavorites, fetchHistory, fetchWatchlist } from "../store/userSlice";
import type { RootState, AppDispatch } from "../store/store";
import { Link } from "react-router-dom";
import { Flame, MonitorPlay, Sparkles, Tv, Clapperboard, Popcorn, Globe } from "lucide-react";
import { isPlayableMedia } from "../types/media";
import { SEOHead } from "../components/SEOHead";
import { generateWebsiteSchema, generateOrganizationSchema, generateSiteNavigationSchema } from "../utils/seoUtils";

interface Genre {
  id: number;
  name: string;
}

const Home: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { favorites, history, watchLater } = useSelector((state: RootState) => state.user);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [recommendedForYou, setRecommendedForYou] = useState<Movie[]>([]);

  /**
   * What actually belongs in "Continue Watching".
   *
   * The row previously rendered raw history, so a film watched to the credits
   * sat at the front of the queue forever and the things genuinely in progress
   * were pushed off the end. Anything effectively finished is dropped, and the
   * rest is ordered by how recently it was watched.
   *
   * Series are kept regardless of progress: finishing an episode does not mean
   * finishing the show, and the stored season/episode is the resume point.
   */
  const continueWatching = useMemo(() => {
    if (!history) return [];

    const FINISHED_RATIO = 0.92;

    return [...history]
      .filter(item => {
        if (item.mediaType === "tv") return true;
        if (!item.duration || item.duration <= 0) return true;
        return item.progress / item.duration < FINISHED_RATIO;
      })
      .sort(
        (a, b) =>
          new Date(b.lastWatchedAt ?? 0).getTime() -
          new Date(a.lastWatchedAt ?? 0).getTime()
      )
      .slice(0, 20);
  }, [history]);

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
  // NetMirror-style platform-specific rails. Each is TMDB /discover filtered
  // by with_watch_providers (US). Sorted by popularity so the row surfaces
  // what people are actually streaming on that service right now.
  const [netflixRail, setNetflixRail] = useState<Movie[]>([]);
  const [primeRail, setPrimeRail] = useState<Movie[]>([]);
  const [disneyRail, setDisneyRail] = useState<Movie[]>([]);
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
          netflixM,
          primeM,
          disneyM,
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
          tmdbService.getContents("movie", { providerId: 8 }),   // Netflix
          tmdbService.getContents("movie", { providerId: 9 }),   // Prime
          tmdbService.getContents("movie", { providerId: 337 }), // Disney+
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
        setNetflixRail((netflixM.results as Movie[]).filter(m => m.poster_path));
        setPrimeRail((primeM.results as Movie[]).filter(m => m.poster_path));
        setDisneyRail((disneyM.results as Movie[]).filter(m => m.poster_path));
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
    image: getImageUrl(movie.backdrop_path || movie.poster_path, MAX_BACKDROP_SIZE),
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
      <SEOHead
        title="AuraScreen — Free Movies, TV Shows, Anime & Live TV Streaming"
        description="Watch thousands of free movies, TV shows, anime, and live channels in HD quality online. No account or subscription needed."
        structuredData={[generateWebsiteSchema(), generateOrganizationSchema(), generateSiteNavigationSchema()]}
      />
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
        {continueWatching.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
          >
            <ContentCarousel title="Continue Watching">
              {continueWatching.map((item) => (
                <ContinueWatchingCard
                  key={`history-${item.id}`}
                  mediaId={item.mediaId}
                  mediaType={item.mediaType === "tv" ? "tv" : "movie"}
                  title={item.title}
                  posterPath={item.posterPath}
                  progress={item.progress}
                  duration={item.duration}
                  season={item.season}
                  episode={item.episode}
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

        {/* Trending Today — wide backdrop cards instead of poster carousel */}
        {trendingToday && trendingToday.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="px-4 md:px-12 space-y-4"
          >
            <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
              <span className="w-1 h-6 md:w-1.5 md:h-8 bg-gradient-to-b from-accent to-cyan-600 rounded-full" />
              Trending Today
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {trendingToday
                .filter(isPlayableMedia)
                .filter(item => item.backdrop_path)
                .slice(0, 6)
                .map((item, idx) => (
                  <BackdropCard
                    key={`today-${item.media_type}-${item.id}`}
                    id={item.id}
                    title={"title" in item ? item.title : (item as TVShow).name}
                    overview={item.overview}
                    backdropPath={item.backdrop_path!}
                    rating={item.vote_average}
                    year={("release_date" in item ? item.release_date : (item as TVShow).first_air_date)?.slice(0, 4)}
                    mediaType={item.media_type === "tv" ? "tv" : "movie"}
                    rank={idx < 3 ? idx + 1 : undefined}
                  />
                ))}
            </div>
          </motion.div>
        )}

        {/* Platform rails — tabbed to reduce carousel spam */}
        {(netflixRail.length > 0 || primeRail.length > 0 || disneyRail.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <PlatformTabs
              netflix={netflixRail}
              prime={primeRail}
              disney={disneyRail}
            />
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

        {/* Movies — tabbed: Popular | Top Rated */}
        {(top10Movies.length > 0 || topRatedMovies.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <TabbedCarousel
              tabs={[
                { label: "Popular Movies", data: top10Movies },
                { label: "Top Rated", data: topRatedMovies },
              ]}
              mediaType="movie"
            />
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

        {/* Recently Added — backdrop cards for visual variety */}
        {nowPlayingMovies && nowPlayingMovies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="px-4 md:px-12 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
                <span className="w-1 h-6 md:w-1.5 md:h-8 bg-gradient-to-b from-green-400 to-emerald-600 rounded-full" />
                Recently Added
              </h2>
              <Link
                to="/movies"
                className="text-xs text-gray-400 hover:text-white transition-colors px-3 py-1 rounded-lg border border-white/10 hover:border-white/30"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {nowPlayingMovies
                .filter(m => m.backdrop_path)
                .slice(0, 8)
                .map((movie) => (
                  <BackdropCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    overview={movie.overview}
                    backdropPath={movie.backdrop_path!}
                    rating={movie.vote_average}
                    year={movie.release_date?.slice(0, 4)}
                    mediaType="movie"
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

        {/* Indian Cinema — tabbed: Bollywood | South */}
        {(bollywoodMovies.length > 0 || southMovies.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.32 }}
          >
            <TabbedCarousel
              tabs={[
                { label: "Bollywood", data: bollywoodMovies },
                { label: "South Indian", data: southMovies },
              ]}
              mediaType="movie"
            />
          </motion.div>
        )}

        {/* TV Shows — tabbed: Trending | Top Rated */}
        {(trendingTV.length > 0 || top10Shows.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <TabbedCarousel
              tabs={[
                { label: "Trending Series", data: trendingTV.map(s => ({ ...s, title: s.name })) as unknown as Movie[] },
                { label: "Top Rated Shows", data: top10Shows.map(s => ({ ...s, title: s.name })) as unknown as Movie[] },
              ]}
              mediaType="tv"
            />
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

        {/* SEO Descriptive Content Section */}
        <SEOContentSection />
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
    { label: "Trending", to: "#trending", icon: Flame, gradient: "from-orange-600/80 to-red-700/80" },
    { label: "Movies", to: "/movies", icon: Clapperboard, gradient: "from-blue-600/80 to-indigo-700/80" },
    { label: "Series", to: "/tv", icon: Tv, gradient: "from-purple-600/80 to-violet-700/80" },
    { label: "Anime", to: "/anime", icon: Sparkles, gradient: "from-pink-600/80 to-rose-700/80" },
    { label: "Bollywood", to: "/hindi-movies", icon: Popcorn, gradient: "from-amber-600/80 to-yellow-700/80" },
    { label: "Live TV", to: "/live-tv", icon: MonitorPlay, gradient: "from-emerald-600/80 to-green-700/80" },
    { label: "Providers", to: "/providers", icon: Globe, gradient: "from-cyan-600/80 to-teal-700/80" },
  ];

  return (
    <div className="px-4 md:px-12 pb-8">
      <div className="flex gap-2.5 md:gap-3 overflow-x-auto pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        {categories.map((category) => {
          const Icon = category.icon;
          const className = `flex h-14 md:h-16 shrink-0 items-center gap-2 md:gap-2.5 rounded-2xl bg-gradient-to-br ${category.gradient} px-4 md:px-5 text-xs md:text-sm font-bold text-white shadow-lg shadow-black/20 backdrop-blur-md transition-all duration-200 hover:scale-105 hover:shadow-xl hover:shadow-black/30 active:scale-95`;

          if (category.to.startsWith("#")) {
            return (
              <a key={category.label} href={category.to} className={className}>
                <Icon className="h-5 w-5 md:h-6 md:w-6" />
                {category.label}
              </a>
            );
          }

          return (
            <Link key={category.label} to={category.to} className={className}>
              <Icon className="h-5 w-5 md:h-6 md:w-6" />
              {category.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Tabbed carousel — shows one carousel at a time with clickable tabs.
 * Reduces homepage from ~20 carousels to ~12 by merging related rows.
 */
function TabbedCarousel({
  tabs,
  mediaType,
}: {
  tabs: { label: string; data: Movie[] }[];
  mediaType: "movie" | "tv";
}) {
  const [active, setActive] = useState(0);
  const validTabs = tabs.filter(t => t.data.length > 0);
  if (validTabs.length === 0) return null;

  const current = validTabs[active] ?? validTabs[0];

  return (
    <div className="space-y-1">
      {/* Tab header */}
      <div className="flex items-center gap-4 px-4 md:px-12 pb-2">
        <span className="w-1 h-6 md:w-1.5 md:h-8 bg-accent rounded-full shrink-0" />
        {validTabs.map((tab, idx) => (
          <button
            key={tab.label}
            onClick={() => setActive(idx)}
            className={`text-sm md:text-lg font-bold transition-colors duration-200 pb-1 border-b-2 ${
              idx === active
                ? "text-white border-accent"
                : "text-gray-500 border-transparent hover:text-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <ContentCarousel title="" key={current.label}>
        {current.data.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}
            title={movie.title}
            posterUrl={movie.poster_path || movie.backdrop_path}
            type={mediaType}
          />
        ))}
      </ContentCarousel>
    </div>
  );
}

/**
 * Platform tabs — Netflix / Prime / Disney+ in a single tabbed section.
 */
function PlatformTabs({
  netflix,
  prime,
  disney,
}: {
  netflix: Movie[];
  prime: Movie[];
  disney: Movie[];
}) {
  const platforms = [
    { label: "Netflix", data: netflix, color: "bg-red-600" },
    { label: "Prime Video", data: prime, color: "bg-blue-500" },
    { label: "Disney+", data: disney, color: "bg-indigo-600" },
  ].filter(p => p.data.length > 0);

  const [active, setActive] = useState(0);
  if (platforms.length === 0) return null;
  const current = platforms[active];

  return (
    <div className="space-y-1">
      <div className="flex items-center gap-3 px-4 md:px-12 pb-2">
        <span className="w-1 h-6 md:w-1.5 md:h-8 bg-accent rounded-full shrink-0" />
        <span className="text-sm md:text-lg font-bold text-white mr-1">Popular on</span>
        {platforms.map((p, idx) => (
          <button
            key={p.label}
            onClick={() => setActive(idx)}
            className={`text-xs md:text-sm font-bold px-3 py-1 rounded-full transition-all duration-200 ${
              idx === active
                ? `${p.color} text-white shadow-lg`
                : "bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <ContentCarousel title="" key={current.label}>
        {current.data.map((m) => (
          <MovieCard
            key={`platform-${m.id}`}
            id={m.id}
            title={m.title}
            posterUrl={m.poster_path}
            type="movie"
          />
        ))}
      </ContentCarousel>
    </div>
  );
}

function SEOContentSection() {
  return (
    <section className="mt-16 mx-auto max-w-7xl px-4 md:px-12 text-text-muted border-t border-white/10 pt-12 pb-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            AuraScreen — Free HD Movies, TV Shows, Anime & Live Channels
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-gray-300">
            Welcome to <strong className="text-white">AuraScreen</strong> (also known as <span className="text-white">Aura Screen</span> or <span className="text-white">AuraScreen TV</span>), the world's premier free online video streaming platform. AuraScreen gives movie lovers and binge-watchers instant access to thousands of blockbuster movies, popular TV series, viral anime releases, regional Indian cinema, and live TV channels in full HD and 4K quality — with zero mandatory subscriptions, fees, or account registration.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-base font-semibold text-white mb-2">🎬 Unlimited Free Movies</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">
              Explore thousands of Hollywood blockbusters, action-packed thrillers, classic dramas, and horror hits. Filter content by release year, rating, or category.
            </p>
            <Link to="/movies" className="text-accent text-xs font-medium hover:underline">
              Browse Free Movies &rarr;
            </Link>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-base font-semibold text-white mb-2">📺 Full TV Series & Anime</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">
              Stream top-rated TV series, binge-worthy K-Dramas, and current seasonal anime episodes in HD audio and multi-language subtitles.
            </p>
            <div className="flex gap-3 text-xs">
              <Link to="/tv-shows" className="text-accent font-medium hover:underline">
                TV Series &rarr;
              </Link>
              <Link to="/anime" className="text-accent font-medium hover:underline">
                Anime &rarr;
              </Link>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <h3 className="text-base font-semibold text-white mb-2">🇮🇳 Bollywood & Regional Cinema</h3>
            <p className="text-gray-400 text-xs leading-relaxed mb-3">
              Watch new Hindi movies, South Indian blockbusters (Tamil, Telugu, Malayalam, Kannada), and classic Indian releases for free.
            </p>
            <Link to="/hindi-movies" className="text-accent text-xs font-medium hover:underline">
              Hindi & South Cinema &rarr;
            </Link>
          </div>
        </div>

        <div className="space-y-4 text-xs md:text-sm text-gray-400 leading-relaxed">
          <h3 className="text-lg font-semibold text-white">Why Choose AuraScreen for Free Streaming?</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-4 list-disc text-gray-300">
            <li><strong>High Definition & 4K Playback:</strong> Crisp video resolutions with fast buffer-free player mirrors.</li>
            <li><strong>No Credit Card Required:</strong> Watch movies and TV shows instantly without creating an account or paying monthly fees.</li>
            <li><strong>Cross-Platform Compatibility:</strong> Seamless streaming across desktop, iOS, Android, tablets, and Smart TV browsers.</li>
            <li><strong>Network Provider Directory:</strong> Filter movies and shows by your favourite streaming service via our <Link to="/providers" className="text-accent hover:underline">Providers Guide</Link> (Netflix, Prime Video, Hotstar, JioCinema, Apple TV+, Crunchyroll).</li>
          </ul>
        </div>

        <div className="border-t border-white/10 pt-6">
          <h3 className="text-sm font-semibold text-white mb-3">Popular Categories & Internal Links</h3>
          <div className="flex flex-wrap gap-2 text-xs">
            {[
              { label: "Free Movies", path: "/movies" },
              { label: "TV Shows", path: "/tv-shows" },
              { label: "Anime Streaming", path: "/anime" },
              { label: "Hindi Movies", path: "/hindi-movies" },
              { label: "Live TV Channels", path: "/live-tv" },
              { label: "Sports Streams", path: "/sports" },
              { label: "Streaming Networks", path: "/providers" },
              { label: "Action Movies", path: "/browse/action" },
              { label: "Comedy Movies", path: "/browse/comedy" },
              { label: "Sci-Fi Movies", path: "/browse/sci-fi" },
              { label: "Horror Movies", path: "/browse/horror" },
              { label: "Drama Movies", path: "/browse/drama" },
              { label: "Animation Movies", path: "/browse/animation" },
            ].map(link => (
              <Link
                key={link.label}
                to={link.path}
                className="rounded-full bg-white/5 border border-white/10 px-3 py-1 text-gray-300 transition hover:border-accent hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
