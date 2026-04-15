import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { tmdbService, getImageUrl } from "../services/tmdb";
import type {
  TVShowDetails as TVShowDetailsType,
  Episode,
} from "../services/tmdb";
import StreamingPlayer from "../components/StreamingPlayer";
import ContentCarousel from "../components/ContentCarousel";
import CastCarousel from "../components/CastCarousel";
import { Star, Calendar, Layers, Globe, CheckCircle } from "lucide-react";

const TVShowDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<TVShowDetailsType | null>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [cast, setCast] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        // Fetch main show details first
        const showData = await tmdbService.getDetails("tv", parseInt(id));
        setShow(showData as TVShowDetailsType);
        setLoading(false); // Show main content immediately

        // Fetch other data in the background
        const [similarData, creditsData, reviewsData] = await Promise.all([
          tmdbService.getSimilar("tv", parseInt(id)),
          tmdbService.getCredits("tv", parseInt(id)),
          tmdbService.getReviews("tv", parseInt(id)),
        ]);

        setSimilar(similarData.results);
        setCast(creditsData.cast.slice(0, 15));
        setReviews(reviewsData.results.slice(0, 3));

        // Fetch episodes for season 1 initially
        if ((showData as TVShowDetailsType).number_of_seasons > 0) {
          const seasonData = await tmdbService.getSeasonDetails(
            parseInt(id),
            1
          );
          setEpisodes(seasonData.episodes);
        }
      } catch (err) {
        setError("Failed to load TV show details");
        console.error(err);
        setLoading(false);
      }
    };

    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleSeasonChange = async (seasonNumber: number) => {
    if (!id) return;
    try {
      const seasonData = await tmdbService.getSeasonDetails(
        parseInt(id),
        seasonNumber
      );
      setEpisodes(seasonData.episodes);
      setSelectedSeason(seasonNumber);
      setSelectedEpisode(1); // Reset to first episode of new season
    } catch (err) {
      console.error("Failed to load season details", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error || !show) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "TV Show not found"}
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      {/* Backdrop */}
      <div className="relative h-[60vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent z-10" />
        <img
          src={getImageUrl(show.backdrop_path, "original")}
          alt={show.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full p-8 z-20">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {show.name}
            </h1>

            {show.tagline && (
              <p className="text-xl text-gray-300 italic mb-4 font-light">
                "{show.tagline}"
              </p>
            )}

            <div className="flex flex-wrap items-center gap-6 text-text-muted mb-6 text-sm md:text-base">
              <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-white font-bold">
                  {show.vote_average.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">/ 10</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-accent" />
                <span className="text-gray-200">
                  {show.first_air_date.split("-")[0]}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-accent" />
                <span className="text-gray-200">
                  {show.number_of_seasons} Seasons
                </span>
              </div>
              <div className="flex gap-2">
                {show.genres.map((genre) => (
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
              {show.overview}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
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
                  mediaType="tv"
                  tmdbId={show.id}
                  season={selectedSeason}
                  episode={selectedEpisode}
                  title={show.name}
                />
              </div>
            </div>

            {/* Season & Episode Selection */}
            <div className="bg-secondary/10 p-6 rounded-xl border border-white/5">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Season List */}
                <div className="w-full md:w-1/4">
                  <h3 className="text-xl font-bold text-white mb-4">Seasons</h3>
                  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {show.seasons.map((season) => (
                      <button
                        key={season.id}
                        onClick={() => handleSeasonChange(season.season_number)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                          selectedSeason === season.season_number
                            ? "bg-accent text-white"
                            : "bg-secondary hover:bg-secondary/80 text-text-muted"
                        }`}
                      >
                        <div className="font-medium text-sm">{season.name}</div>
                        <div className="text-xs opacity-70">
                          {season.episode_count} Episodes
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Episode List */}
                <div className="w-full md:w-3/4">
                  <h3 className="text-xl font-bold text-white mb-4">
                    Episodes
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {episodes && episodes.length > 0 ? (
                      episodes.map((episode) => (
                        <div
                          key={episode.id}
                          onClick={() => {
                            window.open(
                              "https://www.effectivegatecpm.com/c4xq24286w?key=aef90db41813e2740b3c7c0caecdb42d",
                              "_blank"
                            );
                            setSelectedEpisode(episode.episode_number);
                          }}
                          className={`cursor-pointer rounded-lg overflow-hidden border transition-all ${
                            selectedEpisode === episode.episode_number
                              ? "border-accent ring-2 ring-accent/50"
                              : "border-white/10 hover:border-white/30"
                          }`}
                        >
                          <div className="relative aspect-video bg-secondary">
                            <img
                              src={getImageUrl(episode.still_path, "w300")}
                              alt={episode.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-black/60 px-2 py-1 rounded text-xs text-white">
                              Ep {episode.episode_number}
                            </div>
                          </div>
                          <div className="p-3 bg-secondary/50">
                            <h4
                              className={`font-medium mb-1 line-clamp-1 text-sm ${
                                selectedEpisode === episode.episode_number
                                  ? "text-accent"
                                  : "text-white"
                              }`}
                            >
                              {episode.name}
                            </h4>
                            <p className="text-xs text-text-muted line-clamp-2">
                              {episode.overview}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-400 p-4 col-span-full text-center">
                        No episodes found for this season.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Cast Section */}
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
                  placeholder="Join the discussion... share your thoughts on this show!"
                />
                <div className="flex justify-end">
                  <button className="bg-accent hover:bg-accent-hover text-white px-6 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                    Post Comment
                  </button>
                </div>

                {/* Empty state for now since no backend */}
                <div className="text-center py-8 text-gray-400">
                  <p>Be the first to comment!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar Info */}
          <div className="space-y-8">
            {/* Show Info Grid */}
            <div className="bg-secondary/20 p-6 rounded-xl border border-white/10 space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Show Info</h3>

              <div className="space-y-1">
                <span className="text-gray-400 text-sm block">
                  Original Name
                </span>
                <span className="text-white">{show.name}</span>
              </div>

              <div>
                <span className="text-gray-400 text-sm block mb-1">Status</span>
                <div className="flex items-center gap-2">
                  <span
                    className={
                      "px-2 py-1 rounded text-xs font-semibold " +
                      (show.status === "Ended"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-green-500/20 text-green-400")
                    }
                  >
                    {show.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-gray-400" />
                <div>
                  <span className="text-gray-400 text-sm block">Language</span>
                  <span className="text-white uppercase">EN</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Layers className="w-5 h-5 text-accent" />
                <div>
                  <span className="text-gray-400 text-sm block">Seasons</span>
                  <span className="text-white">{show.number_of_seasons}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-accent" />
                <div>
                  <span className="text-gray-400 text-sm block">Episodes</span>
                  <span className="text-white">{show.number_of_episodes}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Similar Shows */}
        {similar.length > 0 && (
          <div className="mt-16 border-t border-white/10 pt-12">
            <ContentCarousel
              title="You May Also Like"
              data={similar}
              mediaType="tv"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Simple Icon component helper if needed, or import from lucide
function PlayIcon(props: React.SVGProps<SVGSVGElement>) {
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

export default TVShowDetails;
