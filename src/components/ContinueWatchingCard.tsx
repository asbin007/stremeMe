import React from "react";
import { Link } from "react-router-dom";
import { Play } from "lucide-react";
import { getImageUrl } from "../services/tmdb";

interface ContinueWatchingCardProps {
  mediaId: string;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string;
  /** Seconds watched. */
  progress: number;
  /** Total runtime in seconds; 0 when unknown. */
  duration: number;
  season?: number | null;
  episode?: number | null;
}

/** Turns seconds into "1h 12m" / "48m", for the remaining-time label. */
function formatRemaining(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.round((total % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m left`;
  return "Almost done";
}

/**
 * A resumable entry in the Continue Watching row.
 *
 * The row used to render a plain MovieCard, which showed only a poster and
 * linked to the details page. Two things were missing for anyone actually
 * mid-way through something: how far in they were, and — for a series — which
 * episode. Resuming a show meant opening the details page and hunting for the
 * episode again.
 */
const ContinueWatchingCard: React.FC<ContinueWatchingCardProps> = ({
  mediaId,
  mediaType,
  title,
  posterPath,
  progress,
  duration,
  season,
  episode,
}) => {
  // Guard the divide: duration is 0 for anything saved before it was known,
  // and 0/0 renders as NaN%.
  const percent =
    duration > 0 ? Math.min(100, Math.max(0, (progress / duration) * 100)) : 0;
  const remaining = duration > 0 ? duration - progress : 0;

  const isSeries = mediaType === "tv";
  const hasEpisode = isSeries && season != null && episode != null;

  // Deep-link straight into the player at the right episode.
  const to = isSeries
    ? `/tv/${mediaId}${hasEpisode ? `?season=${season}&episode=${episode}` : ""}`
    : `/movie/${mediaId}`;

  return (
    <Link
      to={to}
      className="group block w-[150px] shrink-0 md:w-[180px]"
      aria-label={
        hasEpisode
          ? `Resume ${title}, season ${season} episode ${episode}`
          : `Resume ${title}`
      }
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-surface">
        {posterPath ? (
          <img
            src={getImageUrl(posterPath)}
            alt=""
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            {title}
          </div>
        )}

        {/* Resume affordance */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-black">
            <Play className="h-5 w-5 fill-current" />
          </span>
        </div>

        {hasEpisode && (
          <span className="absolute left-2 top-2 rounded-md bg-black/75 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
            S{season} E{episode}
          </span>
        )}

        {/* Progress bar, pinned to the bottom of the poster */}
        {percent > 0 && (
          <div className="absolute inset-x-0 bottom-0">
            {remaining > 0 && (
              <p className="bg-linear-to-t from-black/90 to-transparent px-2 pb-1 pt-4 text-[10px] font-medium text-white/90">
                {formatRemaining(remaining)}
              </p>
            )}
            <div
              className="h-1 w-full bg-white/25"
              role="progressbar"
              aria-valuenow={Math.round(percent)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${Math.round(percent)}% watched`}
            >
              <div className="h-full bg-accent" style={{ width: `${percent}%` }} />
            </div>
          </div>
        )}
      </div>

      <p className="mt-2 line-clamp-1 text-sm font-medium text-text transition-colors group-hover:text-accent">
        {title}
      </p>
    </Link>
  );
};

export default ContinueWatchingCard;
