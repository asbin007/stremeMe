import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../services/tmdb";
import { Play } from "lucide-react";

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

  return (
    <div
      ref={cardRef}
      onClick={handleClick}
      className="group relative w-full aspect-[2/3] rounded-lg overflow-hidden bg-secondary cursor-pointer transition-transform duration-300 hover:scale-105 shadow-md hover:shadow-2xl hover:shadow-accent/20 hover:z-10"
    >
      <img
        src={getImageUrl(posterUrl)}
        alt={title}
        className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-60"
        loading="lazy"
      />
      
      {/* Play Icon Centered */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="w-14 h-14 rounded-full bg-accent text-white flex items-center justify-center shadow-lg shadow-accent/50 transform scale-50 group-hover:scale-100 transition-transform duration-300 ease-out">
          <Play className="w-6 h-6 fill-current ml-1" />
        </div>
      </div>

      {/* Bottom Gradient and Title */}
      <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
        <h3 className="text-white text-sm md:text-base font-semibold truncate text-center">
          {title}
        </h3>
      </div>

      {is4K && (
        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-500 border border-yellow-500/30">
          4K
        </div>
      )}
    </div>
  );
};

export default MovieCard;
