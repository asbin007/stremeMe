import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { SEOHead } from "../components/SEOHead";
import { generateMovieSchema, generateBreadcrumbSchema, generateMovieVideoObject } from "../utils/seoUtils";
import { tmdbService, getImageUrl, MAX_BACKDROP_SIZE } from "../services/tmdb";
import type { MovieDetails as MovieDetailsType } from "../services/tmdb";
import StreamingPlayer from "../components/StreamingPlayer";
import ContentCarousel from "../components/ContentCarousel";
import ShareButton from "../components/ShareButton";
import WatchProviderBadges from "../components/WatchProviderBadges";
import { Star, Clock, Play, Bookmark } from "lucide-react";
import { DetailsSkeleton } from "../components/Skeleton";
import {
  addToHistory,
  syncWatchLater,
  toggleWatchLater,
} from "../store/userSlice";
import type { AppDispatch, RootState } from "../store/store";
import type { CastMember, MediaItem, VideoResult } from '../types/media';

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [similar, setSimilar] = useState<MediaItem[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);
  const [trailer, setTrailer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const watchLater = useSelector((state: RootState) => state.user.watchLater);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const isInWatchlist = watchLater.some(item => item.id === String(id));

  /** Playing is what puts a film in Continue Watching. */
  const handlePlay = () => {
    if (!movie || !id) return;

    dispatch(
      addToHistory({
        mediaId: id,
        mediaType: "movie",
        title: movie.title,
        posterPath: movie.poster_path || movie.backdrop_path,
        progress: 0,
        // TMDB reports runtime in minutes; history is in seconds.
        duration: (movie.runtime || 0) * 60,
      })
    );
  };

  const handleToggleWatchlist = () => {
    if (!movie || !id) return;

    const item = {
      id: String(id),
      title: movie.title,
      posterPath: movie.poster_path || movie.backdrop_path,
      mediaType: "movie" as const,
    };

    // Signed out, the list is local only — same behaviour as the cards.
    dispatch(isAuthenticated ? syncWatchLater(item) : toggleWatchLater(item));
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const movieData = (await tmdbService.getDetails(
          "movie",
          parseInt(id)
        )) as MovieDetailsType;
        setMovie(movieData);
        setLoading(false);

        // Recorded on Play, not on page load — opening a page to read the
        // synopsis should not put a film in Continue Watching.

        const [similarResult, creditsResult, videosResult] =
          await Promise.allSettled([
            tmdbService.getSimilar("movie", parseInt(id)),
            tmdbService.getCredits("movie", parseInt(id)),
            tmdbService.getVideos("movie", parseInt(id)),
          ]);

        if (similarResult.status === "fulfilled") {
          setSimilar(similarResult.value.results.filter((item: MediaItem) => item.poster_path));
        }
        if (creditsResult.status === "fulfilled") {
          setCast(creditsResult.value.cast.slice(0, 8));
        }
        if (videosResult.status === "fulfilled") {
          const trailerVideo = videosResult.value.results.find(
            (vid: VideoResult) => vid.type === "Trailer" && vid.site === "YouTube"
          );
          setTrailer(trailerVideo ? trailerVideo.key : null);
        }
      } catch (err) {
        setError("Failed to load movie details");
        console.error(err);
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [id, dispatch]);

  if (loading) return <DetailsSkeleton />;

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "Movie not found"}
      </div>
    );
  }

  const yearStr = movie.release_date ? ` (${movie.release_date.slice(0, 4)})` : "";
  const pageTitle = `Watch ${movie.title}${yearStr} Free HD — AuraScreen`;
  const metaDesc = movie.overview 
    ? movie.overview.slice(0, 155) 
    : `Stream ${movie.title} for free in full HD on AuraScreen. No registration or payment required.`;
  const movieOgImage = `https://www.aurascreen.me/api/og?t=${encodeURIComponent(movie.title)}&y=${encodeURIComponent(yearStr.replace(/[^0-9]/g, ''))}&r=${encodeURIComponent(movie.vote_average?.toFixed(1) || '')}&bg=${encodeURIComponent(movie.backdrop_path || '')}`;

  const movieKeywords = [
    `watch ${movie.title} free`,
    `${movie.title} online`,
    `stream ${movie.title}`,
    `${movie.title} HD`,
    ...(movie.genres?.map(g => g.name.toLowerCase()) || []),
    "free movies online",
    "AuraScreen"
  ];

  const movieSchema = generateMovieSchema(movie, cast);
  const videoSchema = generateMovieVideoObject(movie);
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Movies", url: "/movies" },
    { name: movie.title, url: `/movie/${movie.id}` }
  ]);

  return (
    <>
      <SEOHead
        title={pageTitle}
        description={metaDesc}
        keywords={movieKeywords}
        ogImage={movieOgImage}
        ogType="video.movie"
        structuredData={[movieSchema, videoSchema, breadcrumbSchema]}
      />
    <div className="min-h-screen pb-12">
      {/* Hero Backdrop */}
      <div className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent z-10" />
        <img
          src={getImageUrl(movie.backdrop_path, MAX_BACKDROP_SIZE)}
          alt={movie.title}
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 md:p-8 z-20">
          <div className="container mx-auto flex items-end gap-5 md:gap-8">
            {/* Poster */}
            <div className="hidden sm:block w-32 md:w-44 lg:w-52 shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <img
                src={getImageUrl(movie.poster_path, "w342")}
                alt={movie.title}
                className="w-full h-auto"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-accent/20 border border-accent/30 rounded text-accent font-semibold">
                  Movie
                </span>
                <span className="flex items-center gap-1 text-white">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                  {movie.vote_average.toFixed(1)}
                </span>
                <span className="text-gray-400">{movie.release_date?.split("-")[0]}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                {movie.title}
              </h1>

              {/* Genres + Runtime inline */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
                {movie.genres.map((genre, i) => (
                  <React.Fragment key={genre.id}>
                    <span>{genre.name}</span>
                    {i < movie.genres.length - 1 && <span className="text-gray-600">•</span>}
                  </React.Fragment>
                ))}
                {movie.runtime > 0 && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {movie.runtime} min
                    </span>
                  </>
                )}
              </div>

              <WatchProviderBadges mediaType="movie" id={movie.id} />

              <p className="text-gray-300 text-sm leading-relaxed max-w-3xl line-clamp-3">
                {movie.overview}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="#player"
                  onClick={handlePlay}
                  className="flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-bold text-black transition-colors hover:bg-accent-hover"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Play
                </a>

                {/* This button had no onClick at all — it rendered, hovered,
                    and did nothing when clicked. */}
                <button
                  onClick={handleToggleWatchlist}
                  aria-pressed={isInWatchlist}
                  className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition-colors ${
                    isInWatchlist
                      ? "border-accent/40 bg-accent/20 text-accent"
                      : "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  <Bookmark
                    className={`h-4 w-4 ${isInWatchlist ? "fill-current" : ""}`}
                  />
                  {isInWatchlist ? "In Watchlist" : "Watchlist"}
                </button>
                <ShareButton title={movie.title} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content — Single column, max-width like CineHD */}
      <div className="container mx-auto px-4 pt-8 max-w-5xl space-y-8">
        {/* Cast — Horizontal row like CineHD */}
        {cast.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-3">Cast</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {cast.map((person: CastMember) => (
                <div key={person.id} className="flex flex-col items-center shrink-0 w-16 md:w-20">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden bg-secondary border border-white/10">
                    {person.profile_path ? (
                      <img
                        src={getImageUrl(person.profile_path, "w185")}
                        alt={person.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-bold">
                        {person.name?.[0]}
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] md:text-xs text-gray-400 mt-1.5 text-center line-clamp-1">
                    {person.name}
                  </span>
                  <span className="text-[9px] text-gray-600 text-center line-clamp-1">
                    {person.character}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Player */}
        <div id="player">
          <StreamingPlayer
            mediaType="movie"
            tmdbId={movie.id}
            imdbId={movie.imdb_id}
            title={movie.title}
            posterPath={movie.poster_path || movie.backdrop_path}
          />
        </div>

        {/* Full Synopsis & Movie Guide */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-6 space-y-4">
          <h2 className="text-xl font-bold text-white">Full Synopsis & Overview</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {movie.overview || `Watch ${movie.title} free online in HD on AuraScreen. Experience high-definition video playback with multi-language audio and subtitle tracks with zero mandatory subscriptions.`}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-white/10 text-xs">
            <div>
              <h3 className="font-semibold text-white mb-2">Why Watch {movie.title} on AuraScreen?</h3>
              <ul className="list-disc pl-4 space-y-1 text-gray-300">
                <li>Full HD (1080p) & 4K Ultra HD video streaming choices.</li>
                <li>Instant playback with zero mandatory registration or fees.</li>
                <li>Cross-device support for desktop, mobile, and smart TVs.</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-white mb-2">Movie Specifications</h3>
              <div className="space-y-1 text-gray-300">
                <p><strong className="text-white">Title:</strong> {movie.title}</p>
                <p><strong className="text-white">Release Date:</strong> {movie.release_date || "N/A"}</p>
                <p><strong className="text-white">Runtime:</strong> {movie.runtime ? `${movie.runtime} minutes` : "N/A"}</p>
                <p><strong className="text-white">Rating:</strong> {movie.vote_average.toFixed(1)} / 10 ({movie.vote_count} votes)</p>
                {movie.genres?.length > 0 && (
                  <p><strong className="text-white">Genres:</strong> {movie.genres.map(g => g.name).join(", ")}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Trailer */}
        {trailer && (
          <div>
            <h2 className="text-lg font-bold text-white mb-3">Trailer</h2>
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${trailer}`}
                title="Trailer"
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {similar.length > 0 && (
          <div className="pt-4 border-t border-white/5">
            <ContentCarousel
              title="You May Also Like"
              data={similar}
              mediaType="movie"
            />
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default MovieDetails;
