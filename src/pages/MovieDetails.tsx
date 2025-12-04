import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { tmdbService, getImageUrl } from "../services/tmdb";
import type { MovieDetails as MovieDetailsType } from "../services/tmdb";
import StreamingPlayer from "../components/StreamingPlayer";
import ContentCarousel from "../components/ContentCarousel";
import { Star, Calendar, Clock } from "lucide-react";

const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetailsType | null>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [movieData, similarData] = await Promise.all([
          tmdbService.getDetails("movie", parseInt(id)),
          tmdbService.getSimilar("movie", parseInt(id)),
        ]);

        setMovie(movieData as MovieDetailsType);
        setSimilar(similarData.results);
      } catch (err) {
        setError("Failed to load movie details");
        console.error(err);
      } finally {
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
          <h2 className="text-2xl font-bold text-white mb-6 border-l-4 border-accent pl-4">
            Watch Now
          </h2>
          <StreamingPlayer mediaType="movie" tmdbId={movie.id} />
        </div>

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
