import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { tmdbService, getImageUrl } from "../services/tmdb";
import type {
  TVShowDetails as TVShowDetailsType,
  Episode,
} from "../services/tmdb";
import StreamingPlayer from "../components/StreamingPlayer";
import ContentCarousel from "../components/ContentCarousel";
import { Star, Calendar, Layers } from "lucide-react";
import NativeAd from "../components/NativeAd";

const TVShowDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [show, setShow] = useState<TVShowDetailsType | null>(null);
  const [similar, setSimilar] = useState<any[]>([]);
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
        const [similarData] = await Promise.all([
          tmdbService.getSimilar("tv", parseInt(id)),
        ]);

        setSimilar(similarData.results);

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
      <div className="relative h-[50vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent z-10" />
        <img
          src={getImageUrl(show.backdrop_path, "original")}
          alt={show.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 w-full p-8 z-20">
          <div className="container mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {show.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-text-muted mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                <span className="text-white font-bold">
                  {show.vote_average.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-5 h-5" />
                <span>{show.first_air_date.split("-")[0]}</span>
              </div>
              <div className="flex items-center gap-1">
                <Layers className="w-5 h-5" />
                <span>{show.number_of_seasons} Seasons</span>
              </div>
              <div className="flex gap-2">
                {show.genres.map((genre) => (
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
              {show.overview}
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

          <div id="streaming-player">
            <StreamingPlayer
              mediaType="tv"
              tmdbId={show.id}
              season={selectedSeason}
              episode={selectedEpisode}
            />
          </div>
          <NativeAd />
        </div>

        {/* Season & Episode Selection */}
        <div className="mb-12">
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
                    <div className="font-medium">{season.name}</div>
                    <div className="text-xs opacity-70">
                      {season.episode_count} Episodes
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Episode List */}
            <div className="w-full md:w-3/4">
              <h3 className="text-xl font-bold text-white mb-4">Episodes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {episodes.map((episode) => (
                  <div
                    key={episode.id}
                    onClick={() => {
                      window.open(
                        "https://www.effectivegatecpm.com/p1ti6fg46?key=02bddff71e147b8dcaa0db926c4dc7e9",
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
                        className={`font-medium mb-1 line-clamp-1 ${
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
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Similar Shows */}
        {similar.length > 0 && (
          <ContentCarousel
            title="You May Also Like"
            data={similar}
            mediaType="tv"
          />
        )}
      </div>
    </div>
  );
};

export default TVShowDetails;
