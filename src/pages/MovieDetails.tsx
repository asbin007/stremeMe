import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { tmdbService, getImageUrl } from "../services/tmdb";
import type { MovieDetails as MovieDetailsType } from "../services/tmdb";
import StreamingPlayer from "../components/StreamingPlayer";
import ContentCarousel from "../components/ContentCarousel";
import CastCarousel from "../components/CastCarousel";
import { Star, Calendar, Clock, DollarSign, Globe, Award } from "lucide-react";

import NativeAd from "../components/NativeAd";

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [cast, setCast] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [trailer, setTrailer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userComments, setUserComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    if (id) {
      const savedComments = localStorage.getItem(`comments_${id}`);
      if (savedComments) {
        setUserComments(JSON.parse(savedComments));
      } else {
        setUserComments([]);
      }
    }
  }, [id]);

  const handlePostComment = () => {
    if (!newComment.trim() || !id) return;

    const comment = {
      id: Date.now(),
      author: "Guest User",
      content: newComment,
      date: new Date().toLocaleDateString(),
    };

    const updatedComments = [comment, ...userComments];
    setUserComments(updatedComments);
    localStorage.setItem(`comments_${id}`, JSON.stringify(updatedComments));
    setNewComment("");
  };

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Fetch main movie details first
        const movieData = await tmdbService.getDetails("movie", parseInt(id));
        setMovie(movieData as MovieDetailsType);
        setLoading(false); // Show main content immediately

        // Fetch other data in the background - using allSettled to prevent one failure from breaking everything
        const [similarResult, creditsResult, videosResult, reviewsResult] =
          await Promise.allSettled([
            tmdbService.getSimilar("movie", parseInt(id)),
            tmdbService.getCredits("movie", parseInt(id)),
            tmdbService.getVideos("movie", parseInt(id)),
            tmdbService.getReviews("movie", parseInt(id)),
          ]);

        // Process results safely
        if (similarResult.status === "fulfilled") {
          setSimilar(similarResult.value.results);
        } else {
          console.error(
            "Failed to fetch similar movies:",
            similarResult.reason
          );
        }

        if (creditsResult.status === "fulfilled") {
          setCast(creditsResult.value.cast.slice(0, 15));
        } else {
          console.error("Failed to fetch cast:", creditsResult.reason);
        }

        if (videosResult.status === "fulfilled") {
          const trailerVideo = videosResult.value.results.find(
            (vid: any) => vid.type === "Trailer" && vid.site === "YouTube"
          );
          setTrailer(trailerVideo ? trailerVideo.key : null);
        } else {
          console.error("Failed to fetch videos:", videosResult.reason);
        }

        if (reviewsResult.status === "fulfilled") {
          setReviews(reviewsResult.value.results.slice(0, 3));
        } else {
          console.error("Failed to fetch reviews:", reviewsResult.reason);
        }
      } catch (err) {
        // Only main movie details failure triggers full page error
        setError("Failed to load movie details");
        console.error(err);
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "Movie not found"}
      </div>
    );
  }

  // Helper to format currency
  const formatMoney = (amount: number) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Backdrop */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent z-10" />
        <img
          src={getImageUrl(movie.backdrop_path, "original")}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full p-8 z-20">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {movie.title}
            </h1>

            {movie.tagline && (
              <p className="text-xl text-gray-300 italic mb-4 font-light">
                "{movie.tagline}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-text-muted mb-6 text-sm md:text-base">
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-white font-bold">
                  {movie.vote_average.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">/ 10</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                <span className="text-gray-200">
                  {movie.release_date.split("-")[0]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                <span className="text-gray-200">{movie.runtime} min</span>
              </div>
              <div className="flex gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-accent/20 border border-accent/30 rounded-full text-xs text-white backdrop-blur-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-lg text-gray-200 max-w-3xl leading-relaxed drop-shadow-md">
              {movie.overview}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Player and Main Info */}
          <div className="lg:col-span-2 space-y-12">
            {/* Streaming Player */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-accent pl-4 flex items-center gap-2">
                <PlayIcon className="w-6 h-6" /> Watch Now
              </h2>
              <div
                id="streaming-player"
                className="rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black"
              >
                <StreamingPlayer
                  mediaType="movie"
                  tmdbId={movie.id}
                  imdbId={movie.imdb_id}
                />
              </div>
            </div>

            {/* Native Ad Placement */}
            <NativeAd />

            {/* Cast Section (Now a Carousel) */}
            {cast.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-accent pl-4">
                  Top Cast
                </h2>
                <CastCarousel cast={cast} />
              </div>
            )}

            {/* Reviews Section */}
            {reviews.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-accent pl-4">
                  User Reviews
                </h2>
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="bg-secondary/20 p-6 rounded-xl border border-white/5"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-lg">
                          {review.author[0].toUpperCase()}
                        </div>
                        <div>
                          <h4 className="text-white font-semibold">
                            {review.author}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <Star className="w-3 h-3 text-yellow-500 fill-current" />
                            <span>
                              {review.author_details?.rating
                                ? `${review.author_details.rating}/10`
                                : "Rated"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm italic leading-relaxed line-clamp-4">
                        "{review.content}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Community Discussion Section (Local) */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-accent pl-4">
                Community Discussion
              </h2>
              <div className="bg-secondary/20 p-6 rounded-xl border border-white/5 space-y-4">
                <textarea
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-accent transition-colors min-h-[100px]"
                  placeholder="Join the discussion... share your thoughts on this movie!"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                />
                <div className="flex justify-end">
                  <button
                    onClick={handlePostComment}
                    disabled={!newComment.trim()}
                    className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Post Comment
                  </button>
                </div>

                {/* Local Comments List */}
                <div className="mt-8 space-y-4">
                  {userComments.length > 0 ? (
                    userComments.map((comment) => (
                      <div
                        key={comment.id}
                        className="bg-black/20 p-4 rounded-lg border border-white/5 animate-fade-in"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-white">
                            {comment.author}
                          </span>
                          <span className="text-xs text-gray-500">
                            {comment.date}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">
                          {comment.content}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <p>Be the first to comment!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="space-y-8">
            {/* Movie Info Grid */}
            <div className="bg-secondary/20 p-6 rounded-xl border border-white/10 space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Movie Info</h3>

              <div className="space-y-1">
                <span className="text-gray-400 text-sm block">
                  Original Title
                </span>
                <span className="text-white">{movie.title}</span>{" "}
                {/* Assuming original title wasn't in interface, fallback to title */}
              </div>

              <div>
                <span className="text-gray-400 text-sm block mb-1">Status</span>
                <span
                  className={
                    "px-2 py-1 rounded text-xs font-semibold " +
                    (movie.status === "Released"
                      ? "bg-green-500/20 text-green-400"
                      : "bg-yellow-500/20 text-yellow-400")
                  }
                >
                  {movie.status}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-gray-400 text-sm block">Language</span>
                  <span className="text-white uppercase">EN</span>{" "}
                  {/* Hardcoded/Simplified for now as lang isn't in main Movie interface strictly */}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-400" />
                <div>
                  <span className="text-gray-400 text-sm block">Budget</span>
                  <span className="text-white">
                    {(movie as any).budget
                      ? formatMoney((movie as any).budget)
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-yellow-400" />
                <div>
                  <span className="text-gray-400 text-sm block">Revenue</span>
                  <span className="text-white">
                    {(movie as any).revenue
                      ? formatMoney((movie as any).revenue)
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Trailer Section in Sidebar (Vertical) */}
            {trailer && (
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Trailer</h3>
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-lg border border-white/10">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer}`}
                    title="Official Trailer"
                    className="w-full h-full"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Similar Movies */}
        {similar.length > 0 && (
          <div className="mt-16 border-t border-white/10 pt-12">
            <ContentCarousel
              title="You May Also Like"
              data={similar}
              mediaType="movie"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Simple Icon component helper if needed, or import from lucide
function PlayIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

export default MovieDetails;
