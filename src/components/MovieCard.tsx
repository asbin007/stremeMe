import React, { useState } from "react";
import { Link } from "react-router-dom";
import { getImageUrl, prefetchDetails } from "../services/tmdb";
import { Play, Bookmark, Heart, Film } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  syncFavorite,
  syncWatchLater,
  toggleFavorite,
  toggleWatchLater,
} from "../store/userSlice";
import type { AppDispatch, RootState } from "../store/store";

interface MovieCardProps {
  id: number;
  title: string;
  posterUrl: string;
  is4K?: boolean;
  type: "movie" | "show" | "tv";
}

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  posterUrl,
  type,
  is4K,
}) => {
  const linkType = type === "show" ? "tv" : type;
  const dispatch = useDispatch<AppDispatch>();
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  const watchLaterList = useSelector((state: RootState) => state.user.watchLater);
  const favorites = useSelector((state: RootState) => state.user.favorites);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated
  );
  const isWatchLater = watchLaterList.some(item => item.id === String(id));
  const isFavorite = favorites.some(item => item.id === String(id));

  const imgSrc = getImageUrl(posterUrl);
  const showImage = posterUrl && imgSrc && !imgError;

  const item = {
    id: String(id),
    title,
    posterPath: posterUrl,
    mediaType: linkType as "movie" | "tv",
  };

  const handleToggleWatchLater = () => {
    dispatch(isAuthenticated ? syncWatchLater(item) : toggleWatchLater(item));
  };

  const handleToggleFavorite = () => {
    dispatch(isAuthenticated ? syncFavorite(item) : toggleFavorite(item));
  };

  return (
    // The action buttons are siblings of the link rather than children of it:
    // a button nested inside an anchor is invalid markup and browsers handle
    // the click target inconsistently.
    <div className="group relative aspect-[2/3] w-full overflow-hidden rounded-md bg-secondary shadow-md transition-all duration-300 hover:z-50 md:rounded-lg md:shadow-lg md:hover:-translate-y-2 md:hover:scale-110 md:hover:shadow-2xl md:hover:shadow-black/50">
      {/* A real link, so the card is keyboard reachable and supports
          middle-click, "open in new tab", and copy-link. It used to be a
          `<div onClick>`, which none of those work on. */}
      <Link
        to={`/${linkType}/${id}`}
        className="absolute inset-0 z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label={title}
        onMouseEnter={() => prefetchDetails(linkType as "movie" | "tv", id)}
        onFocus={() => prefetchDetails(linkType as "movie" | "tv", id)}
      >
        {showImage ? (
          <>
            {!imgLoaded && (
              <div
                aria-hidden="true"
                className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/5 via-white/10 to-white/5"
              />
            )}
            <img
              src={imgSrc}
              alt={`${title} poster`}
              className={`size-full object-cover transition-opacity duration-500 md:group-hover:opacity-50 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              loading="lazy"
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary p-2 text-text-muted">
            <Film className="mb-2 size-8 opacity-40" aria-hidden="true" />
            <span className="line-clamp-2 text-center text-[10px]">{title}</span>
          </div>
        )}

        {/* Play affordance (desktop hover only) */}
        <div className="absolute inset-0 hidden items-center justify-center opacity-0 transition-all duration-500 ease-out group-hover:opacity-100 md:flex">
          <div className="flex size-16 scale-50 items-center justify-center rounded-full bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all duration-500 ease-out group-hover:scale-100">
            <Play className="ml-1 size-8 fill-current" aria-hidden="true" />
          </div>
        </div>

        <div className="absolute inset-0 hidden bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 transition-opacity duration-300 md:block md:group-hover:opacity-100" />

        {/* Mobile title strip */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 md:hidden">
          <p className="line-clamp-1 text-[10px] font-medium text-white">
            {title}
          </p>
        </div>

        {/* Desktop hover title */}
        <div className="absolute inset-x-0 bottom-0 hidden translate-y-4 p-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:block">
          <p className="mb-1 line-clamp-2 text-base font-bold text-white drop-shadow-md">
            {title}
          </p>
        </div>
      </Link>

      {is4K && (
        <span className="absolute left-1/2 top-2 z-20 -translate-x-1/2 rounded-sm border border-white/20 bg-accent/90 px-1.5 py-0.5 text-[8px] font-bold text-primary shadow-md backdrop-blur-sm md:text-[10px]">
          4K
        </span>
      )}

      <button
        type="button"
        onClick={handleToggleWatchLater}
        aria-label={
          isWatchLater
            ? `Remove ${title} from watchlist`
            : `Add ${title} to watchlist`
        }
        aria-pressed={isWatchLater}
        className="absolute left-1.5 top-1.5 z-20 rounded-full border border-white/10 bg-black/40 p-1 text-white backdrop-blur-sm transition hover:bg-black/80 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:left-2 md:top-2 md:border-white/20 md:p-1.5 md:opacity-0 md:group-hover:opacity-100"
      >
        <Bookmark
          className="size-3 md:size-4"
          fill={isWatchLater ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>

      <button
        type="button"
        onClick={handleToggleFavorite}
        aria-label={
          isFavorite
            ? `Remove ${title} from favorites`
            : `Add ${title} to favorites`
        }
        aria-pressed={isFavorite}
        className="absolute right-1.5 top-1.5 z-20 rounded-full border border-white/10 bg-black/40 p-1 text-white backdrop-blur-sm transition hover:bg-black/80 focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:right-2 md:top-2 md:border-white/20 md:p-1.5 md:opacity-0 md:group-hover:opacity-100"
      >
        <Heart
          className="size-3 md:size-4"
          fill={isFavorite ? "currentColor" : "none"}
          aria-hidden="true"
        />
      </button>
    </div>
  );
};

export default MovieCard;
