import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../services/tmdb";
import { Play, Bookmark } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toggleWatchLater } from "../store/userSlice";
import type { AppDispatch, RootState } from "../store/store";

interface MovieCardProps {
  id: number;
  title: string;
  posterUrl: string;
  is4K?: boolean;
  type: "movie" | "show" | "tv";
}

const MovieCard: React.FC<MovieCardProps> = ({ id, title, posterUrl, type, is4K }) => {
  const linkType = type === "show" ? "tv" : type;
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  
  const watchLaterList = useSelector((state: RootState) => state.user.watchLater);
  const isWatchLater = watchLaterList.some((item) => item.id === String(id));

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(
      "https://onionclose.com/ec1332j82?key=802db9e0c75cda5eb230f240cd0ed19f",
      "_blank"
    );
    setTimeout(() => {
      navigate(`/${linkType}/${id}`);
    }, 300);
  };

  const handleToggleWatchLater = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(toggleWatchLater({
      id: String(id),
      title,
      posterPath: posterUrl,
      mediaType: linkType as 'movie' | 'tv'
    }));
  };

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className="group relative w-full aspect-[2/3] rounded-md md:rounded-lg overflow-hidden bg-secondary cursor-pointer transition-all duration-300 transform md:hover:scale-110 md:hover:-translate-y-2 shadow-md md:shadow-lg md:hover:shadow-2xl md:hover:shadow-black/50 hover:z-50 active:scale-95 md:active:scale-100"
    >
      <img
        src={getImageUrl(posterUrl)}
        alt={title}
        className="w-full h-full object-cover transition-opacity duration-300 md:group-hover:opacity-50"
        loading="lazy"
      />
      
      {/* Sleek Play Button Overlay (Desktop Only) */}
      <div className="hidden md:flex absolute inset-0 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out z-20">
        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md border border-white/40 flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 ease-out hover:bg-white text-white hover:text-accent hover:scale-110">
          <Play className="w-7 h-7 fill-current ml-1" />
        </div>
      </div>

      {/* Expanded Meta Details at Bottom - Cinematic Fade (Desktop Only) */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10 hidden md:block">
      </div>
      
      <div className="hidden md:block absolute bottom-0 inset-x-0 p-4 z-20 opacity-0 md:group-hover:opacity-100 transition-all duration-300 translate-y-4 md:group-hover:translate-y-0">
        <h3 className="text-white text-md font-bold line-clamp-2 mb-1 drop-shadow-md">
          {title}
        </h3>
        <p className="text-xs text-green-400 font-semibold">98% Match</p>
      </div>

      {is4K && (
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-sm text-[10px] font-bold text-white border border-white/20 z-20 shadow-md">
          4K
        </div>
      )}
      
      {/* Watch Later Bookmark */}
      <button 
        onClick={handleToggleWatchLater}
        className="absolute top-2 left-2 z-20 p-1.5 rounded-full bg-black/40 hover:bg-black/80 backdrop-blur-sm transition text-white border border-white/20 opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 md:opacity-0 focus:opacity-100"
      >
        <Bookmark className="w-4 h-4" fill={isWatchLater ? "currentColor" : "none"} />
      </button>
    </div>
  );
};

export default MovieCard;
