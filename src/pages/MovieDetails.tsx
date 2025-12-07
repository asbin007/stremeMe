import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { tmdbService, getImageUrl } from "../services/tmdb";
import type { MovieDetails as MovieDetailsType } from "../services/tmdb";
import StreamingPlayer from "../components/StreamingPlayer";
import ContentCarousel from "../components/ContentCarousel";
import { Star, Calendar, Clock, Download } from "lucide-react";

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [cast, setCast] = useState<any[]>([]);
  const [trailer, setTrailer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Fetch main movie details first
        const movieData = await tmdbService.getDetails("movie", parseInt(id));
        setMovie(movieData as MovieDetailsType);
        setLoading(false); // Show main content immediately

        // Fetch other data in the background
        const [similarData, creditsData, videosData] = await Promise.all([
          tmdbService.getSimilar("movie", parseInt(id)),
          tmdbService.getCredits("movie", parseInt(id)),
          tmdbService.getVideos("movie", parseInt(id)),
        ]);

        setSimilar(similarData.results);
        setCast(creditsData.cast.slice(0, 10)); // Top 10 cast members

        const trailerVideo = videosData.results.find(
          (vid: any) => vid.type === "Trailer" && vid.site === "YouTube"
        );
        setTrailer(trailerVideo ? trailerVideo.key : null);
      } catch (err) {
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

  return (
    <div className="min-h-screen pb-12">
      {/* Backdrop */}
      <div className="relative h-[50vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent z-10" />
        <img
          src={getImageUrl(movie.backdrop_path, "original")}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full p-8 z-20">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {movie.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-text-muted mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-white font-bold">
                  {movie.vote_average.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-5 h-5" />
                <span>{movie.release_date.split("-")[0]}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-5 h-5" />
                <span>{movie.runtime} min</span>
              </div>
              <div className="flex gap-2">
                {movie.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-white/10 rounded-full text-sm backdrop-blur-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
            <p className="text-lg text-text-muted max-w-3xl line-clamp-3">
              {movie.overview}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Streaming Player */}
        <div className="mb-12">
            title="Watch Now"
          >
            Watch Now
          </h2>
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => {
                const playerElement = document.getElementById("streaming-player");
                if (playerElement) {
                  playerElement.scrollIntoView({ behavior: "smooth" });
                  // Optional: Highlight the player temporarily
                  playerElement.classList.add("ring-2", "ring-green-500");
                  setTimeout(() => playerElement.classList.remove("ring-2", "ring-green-500"), 2000);
                  // Show tooltip or toast
                  alert("Please check the video player for available download options from the server.");
                }
              }}
              className="flex items-center gap-2 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              <Download className="w-5 h-5" />
              Download Movie
            </button>
          </div>
          <div id="streaming-player">
            <StreamingPlayer
              mediaType="movie"
              tmdbId={movie.id}
              imdbId={movie.imdb_id}
            />
          </div>
        </div>

        {/* Cast Section */}
        {cast.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-accent pl-4">
              Top Cast
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
              {cast.map((actor) => (
                <div
                  key={actor.id}
                  className="bg-secondary/30 rounded-lg overflow-hidden hover:bg-secondary/50 transition-colors group"
                >
                  <div className="aspect-[2/3] overflow-hidden relative">
                    {actor.profile_path ? (
                      <img
                        src={getImageUrl(actor.profile_path, "w185")}
                        alt={actor.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                        No Image
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h3
                      className="font-semibold text-white text-sm truncate"
                      title={actor.name}
                    >
                      {actor.name}
                    </h3>
                    <p
                      className="text-xs text-gray-400 truncate"
                      title={actor.character}
                    >
                      {actor.character}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trailer Section */}
        {trailer && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-accent pl-4">
              Official Trailer
            </h2>
            <div className="aspect-video w-full max-w-4xl mx-auto rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${trailer}`}
                title="Official Trailer"
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          </div>
        )}

        {/* Similar Movies */}
        {similar.length > 0 && (
          <ContentCarousel
            title="You May Also Like"
            data={similar}
            mediaType="movie"
          />
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
