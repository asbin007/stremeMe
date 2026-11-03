import React from "react";
import { Link } from "react-router-dom";
import { Play, Star } from "lucide-react";
import { getImageUrl, MAX_BACKDROP_SIZE } from "../services/tmdb";

/**
 * Imported by: src/pages/Home.tsx (Trending Today row, platform rails)
 * No API or data schema — pure presentational component.
 * Props: TMDB movie/show fields (id, title, overview, backdrop_path, vote_average, release_date, media_type).
 *
 * User instruction: "HOMEPAGE UI IS NOT GOOD, HOW CAN WE MAKE MORE BETTER, DONT YOU GENERIC THING"
 * This wide landscape card breaks the wall-of-identical-poster-carousels by
 * showing backdrop images with glass overlay info — visual variety without
 * copying Netflix's numbered-card pattern (user rejected that).
 */

interface BackdropCardProps {
  id: number;
  title: string;
  overview?: string;
  backdropPath: string;
  rating?: number;
  year?: string;
  mediaType: "movie" | "tv";
  rank?: number;
}

const BackdropCard: React.FC<BackdropCardProps> = ({
  id,
  title,
  overview,
  backdropPath,
  rating,
  year,
  mediaType,
  rank,
}) => {
  return (
    <Link
      to={`/${mediaType}/${id}`}
      className="group relative block w-full aspect-video overflow-hidden rounded-xl bg-surface ring-1 ring-white/10 transition-all duration-300 hover:ring-accent/40 md:hover:-translate-y-1 aura-card-glow"
    >
      <img
        src={getImageUrl(backdropPath, MAX_BACKDROP_SIZE)}
        alt=""
        loading="lazy"
        decoding="async"
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

      {rank && (
        <div className="absolute top-3 left-3 z-10">
          <span className="flex items-center gap-1 rounded-md bg-accent/90 px-2 py-0.5 text-[10px] font-black text-black uppercase tracking-wider shadow-lg">
            #{rank} Trending
          </span>
        </div>
      )}

      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-black shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300">
          <Play className="ml-0.5 h-7 w-7 fill-current" />
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-4 z-10">
        <h3 className="text-base md:text-xl font-bold text-white line-clamp-1 drop-shadow-lg group-hover:text-accent transition-colors">
          {title}
        </h3>
        {overview && (
          <p className="mt-1 text-[11px] md:text-sm text-gray-300 line-clamp-2 leading-relaxed max-w-lg">
            {overview}
          </p>
        )}
        <div className="mt-2 flex items-center gap-3 text-[10px] md:text-xs text-gray-400">
          {rating != null && rating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              {rating.toFixed(1)}
            </span>
          )}
          {year && <span>{year}</span>}
        </div>
      </div>
    </Link>
  );
};

export default BackdropCard;
