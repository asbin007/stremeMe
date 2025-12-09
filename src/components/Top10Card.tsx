import React from "react";
import { useNavigate } from "react-router-dom";
import { getImageUrl } from "../services/tmdb";

interface Top10CardProps {
  id: number;
  title: string;
  posterUrl: string;
  rank: number;
  type: "movie" | "show" | "tv";
}

const Top10Card: React.FC<Top10CardProps> = ({
  id,
  title,
  posterUrl,
  rank,
  type,
}) => {
  const linkType = type === "show" ? "tv" : type;
  const navigate = useNavigate();

  return (
    <div
      className="relative flex items-end group cursor-pointer"
      onClick={() => {
        window.open(
          "https://www.effectivegatecpm.com/c4xq24286w?key=aef90db41813e2740b3c7c0caecdb42d",
          "_blank"
        );
        setTimeout(() => {
          navigate(`/${linkType}/${id}`);
        }, 300);
      }}
    >
      <span
        className="text-[100px] font-bold text-gray-800 leading-none -mr-4 z-0 stroke-white stroke-2"
        style={{ WebkitTextStroke: "2px #444" }}
      >
        {rank}
      </span>
      <div className="relative z-10 block w-full rounded-md overflow-hidden transition-transform duration-300 hover:scale-105">
        <div className="aspect-[2/3] w-full bg-gray-800">
          <img
            src={getImageUrl(posterUrl)}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default Top10Card;
