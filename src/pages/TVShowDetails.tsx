import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Helmet } from "react-helmet-async";
import { tmdbService, getImageUrl, MAX_BACKDROP_SIZE } from "../services/tmdb";
import type {
  TVShowDetails as TVShowDetailsType,
  Episode,
} from "../services/tmdb";
import type { CastMember, MediaItem } from "../types/media";
import StreamingPlayer from "../components/StreamingPlayer";
import ContentCarousel from "../components/ContentCarousel";
import ShareButton from "../components/ShareButton";
import { Star, Play, Bookmark, ChevronDown } from "lucide-react";
import { DetailsSkeleton } from "../components/Skeleton";
import { addToHistory } from "../store/userSlice";
import type { AppDispatch } from "../store/store";

const TVShowDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [show, setShow] = useState<TVShowDetailsType | null>(null);
  const [similar, setSimilar] = useState<MediaItem[]>([]);
  const [cast, setCast] = useState<CastMember[]>([]);

  // Seeded from the URL so Continue Watching can drop the viewer straight back
  // onto the episode they stopped at.
  const [selectedSeason, setSelectedSeason] = useState(
    () => Number(searchParams.get("season")) || 1
  );
  const [selectedEpisode, setSelectedEpisode] = useState(
    () => Number(searchParams.get("episode")) || 1
  );
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSeasonDropdown, setShowSeasonDropdown] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const showData = (await tmdbService.getDetails(
          "tv",
          parseInt(id)
        )) as TVShowDetailsType;
        setShow(showData);
        setLoading(false);

        // History is recorded when an episode is actually played, not here.
        // Saving on page load meant every show you merely opened — including
        // ones you immediately backed out of — landed in Continue Watching,
        // burying the things you were genuinely part-way through.

        const [similarData, creditsData] = await Promise.all([
          tmdbService.getSimilar("tv", parseInt(id)),
          tmdbService.getCredits("tv", parseInt(id)),
        ]);

        setSimilar(similarData.results.filter((item: MediaItem) => item.poster_path));
        setCast(creditsData.cast.slice(0, 8));

        if (showData.number_of_seasons > 0) {
          // Load the season being resumed, not always season 1 — otherwise a
          // link to S3E7 opens showing season 1's episode list.
          const requested = Number(searchParams.get("season")) || 1;
          const seasonToLoad =
            requested >= 1 && requested <= showData.number_of_seasons ? requested : 1;

          const seasonData = await tmdbService.getSeasonDetails(
            parseInt(id),
            seasonToLoad
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
  // searchParams is read for the initial season only; re-running on every
  // param change would refetch the show each time an episode is picked.
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setSelectedEpisode(1);
      setShowSeasonDropdown(false);
    } catch (err) {
      console.error("Failed to load season details", err);
    }
  };

  const handleEpisodePlay = (episodeNumber: number) => {
    setSelectedEpisode(episodeNumber);

    // Record the resume point. Playing an episode is the signal that this show
    // belongs in Continue Watching, and the season/episode is what lets that
    // row link back into the player rather than to the show page.
    if (show && id) {
      dispatch(
        addToHistory({
          mediaId: id,
          mediaType: "tv",
          title: show.name,
          posterPath: show.poster_path || show.backdrop_path,
          progress: 0,
          duration: 0,
          season: selectedSeason,
          episode: episodeNumber,
        })
      );
    }

    // Keep the URL in step, so a refresh or a shared link lands on this episode.
    setSearchParams(
      { season: String(selectedSeason), episode: String(episodeNumber) },
      { replace: true }
    );

    document.getElementById("player")?.scrollIntoView({ behavior: "smooth" });
  };

  if (loading) return <DetailsSkeleton />;

  if (error || !show) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        {error || "TV Show not found"}
      </div>
    );
  }

  return (
    <>
      <Helmet>
        {/* Single interpolated string — see MovieDetails. As separate JSX
            children Helmet dropped it and the page had no title. */}
        <title>{`${show.name} (${show.first_air_date?.substring(0, 4)}) | AuraScreen`}</title>
        <meta name="description" content={show.overview?.slice(0, 160)} />
        <meta property="og:title" content={`${show.name} — Watch Free on AuraScreen`} />
        <meta property="og:description" content={show.overview?.slice(0, 160)} />
        <meta property="og:image" content={getImageUrl(show.backdrop_path || show.poster_path, "w780")} />
        <meta property="og:type" content="video.tv_show" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${show.name} — AuraScreen`} />
        <meta name="twitter:image" content={getImageUrl(show.backdrop_path || show.poster_path, "w780")} />
      </Helmet>
    <div className="min-h-screen pb-12">
      {/* Hero Backdrop */}
      <div className="relative h-[50vh] sm:h-[55vh] md:h-[60vh] w-full">
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 to-transparent z-10" />
        <img
          src={getImageUrl(show.backdrop_path, MAX_BACKDROP_SIZE)}
          alt={show.name}
          className="w-full h-full object-cover"
        />

        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 md:p-8 z-20">
          <div className="container mx-auto flex items-end gap-5 md:gap-8">
            {/* Poster */}
            <div className="hidden sm:block w-32 md:w-44 lg:w-52 shrink-0 rounded-lg overflow-hidden shadow-2xl border border-white/10">
              <img
                src={getImageUrl(show.poster_path, "w342")}
                alt={show.name}
                className="w-full h-auto"
              />
            </div>

            {/* Info */}
            <div className="flex-1 space-y-2 md:space-y-3">
              <div className="flex items-center gap-2 text-xs">
                <span className="px-2 py-0.5 bg-accent/20 border border-accent/30 rounded text-accent font-semibold">
                  Tv
                </span>
                <span className="flex items-center gap-1 text-white">
                  <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                  {show.vote_average.toFixed(1)}
                </span>
                <span className="text-gray-400">{show.first_air_date?.split("-")[0]}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white drop-shadow-lg">
                {show.name}
              </h1>

              {/* Genres inline */}
              <div className="flex flex-wrap gap-1.5">
                {show.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="text-xs text-gray-300"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-300 text-sm leading-relaxed max-w-3xl line-clamp-3">
                {show.overview}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="#player"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-white/90 transition-all text-sm"
                >
                  <Play className="w-4 h-4 fill-current" />
                  Play
                </a>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all text-sm">
                  <Bookmark className="w-4 h-4" />
                  Watchlist
                </button>
                <ShareButton title={show.name} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content — Single Column like CineHD */}
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

        {/* Episodes Section — CineHD Style */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">Episodes</h2>

            {/* Season Dropdown — CineHD style */}
            <div className="relative">
              <button
                onClick={() => setShowSeasonDropdown(!showSeasonDropdown)}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10 transition-colors"
              >
                Season {selectedSeason}
                <ChevronDown className={`w-4 h-4 transition-transform ${showSeasonDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showSeasonDropdown && (
                <div className="absolute right-0 top-full mt-1 bg-secondary border border-white/10 rounded-lg shadow-xl z-50 py-1 min-w-[140px] max-h-60 overflow-y-auto">
                  {show.seasons.map((season) => (
                    <button
                      key={season.id}
                      onClick={() => handleSeasonChange(season.season_number)}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                        selectedSeason === season.season_number
                          ? "bg-white/10 text-white"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {season.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Episode List — Vertical list like CineHD (not grid) */}
          <div className="space-y-2">
            {episodes && episodes.length > 0 ? (
              episodes.map((ep) => (
                <div
                  key={ep.id}
                  onClick={() => handleEpisodePlay(ep.episode_number)}
                  className={`flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-lg cursor-pointer transition-all ${
                    selectedEpisode === ep.episode_number
                      ? "bg-white/10 border border-white/20"
                      : "bg-white/[0.02] border border-transparent hover:bg-white/5"
                  }`}
                >
                  {/* Episode Thumbnail */}
                  <div className="relative w-28 md:w-40 shrink-0 aspect-video rounded-md overflow-hidden bg-black/50">
                    <img
                      src={getImageUrl(ep.still_path, "w300")}
                      alt={ep.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                      <Play className="w-6 h-6 text-white fill-current" />
                    </div>
                    {selectedEpisode === ep.episode_number && (
                      <div className="absolute top-1 left-1 w-2 h-2 rounded-full bg-white animate-pulse" />
                    )}
                  </div>

                  {/* Episode Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 font-medium">
                        {ep.episode_number}
                      </span>
                      <h4 className={`text-sm font-medium line-clamp-1 ${
                        selectedEpisode === ep.episode_number ? "text-white" : "text-gray-300"
                      }`}>
                        {ep.name}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {ep.overview || "No description available."}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-500 py-8 text-center text-sm">
                No episodes available for this season.
              </div>
            )}
          </div>
        </div>

        {/* Player — Below episodes like CineHD (click episode → plays here) */}
        <div id="player">
          <StreamingPlayer
            mediaType="tv"
            tmdbId={show.id}
            season={selectedSeason}
            episode={selectedEpisode}
            title={`${show.name} S${selectedSeason}E${selectedEpisode}`}
          />
        </div>

        {/* Similar Shows */}
        {similar.length > 0 && (
          <div className="pt-4 border-t border-white/5">
            <ContentCarousel
              title="You May Also Like"
              data={similar}
              mediaType="tv"
            />
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default TVShowDetails;
