import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { getImageUrl, tmdbService } from "../services/tmdb";
import VideoPreview from "./VideoPreview";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Plus } from "lucide-react";

interface MovieCardProps {
  id: number;
  title: string;
  posterUrl: string;
  is4K?: boolean;
  type: "movie" | "show" | "tv";
}

interface MovieDetails {
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genres?: { name: string }[];
  runtime?: number;
}

const MovieCard: React.FC<MovieCardProps> = ({
  id,
  title,
  posterUrl,
  type,
}) => {
  const linkType = type === "show" ? "tv" : type;
  const [isHovered, setIsHovered] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [details, setDetails] = useState<MovieDetails | null>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
      });
    }

    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(true);
      fetchDetails();
    }, 400); // Reduced delay for snappier feel
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(false);
    setIsVideoPlaying(false);
  };

  const fetchDetails = async () => {
    if (details) return;
    try {
      const data = await tmdbService.getDetails(linkType, id);
      setDetails(data as any);
    } catch (error) {
      console.error("Error fetching details:", error);
    }
  };

  const getYear = () => {
    const date = details?.release_date || details?.first_air_date;
    return date ? new Date(date).getFullYear() : "";
  };

  return (
    <>
      <div
        ref={cardRef}
        className="relative w-full aspect-[2/3] z-0 transition-all duration-300 cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={() => {
          window.open(
            "https://www.effectivegatecpm.com/c4xq24286w?key=aef90db41813e2740b3c7c0caecdb42d",
            "_blank"
          );
          // Slight delay to ensure ad opens before navigation
          setTimeout(() => {
            navigate(`/${linkType}/${id}`);
          }, 300);
        }}
      >
        <div className="w-full h-full rounded-md overflow-hidden bg-gray-900 shadow-md">
          <img
            src={getImageUrl(posterUrl)}
            alt={title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* Portal for Hover Card */}
      {createPortal(
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1.2 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed z-[9999] bg-[#141414] rounded-lg shadow-2xl overflow-hidden ring-1 ring-white/10"
              style={{
                top: position.top - 40, // Offset to center vertically roughly
                left: position.left - position.width * 0.1, // Center horizontally
                width: position.width * 1.2, // 1.2x scale
                height: "auto",
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => {
                setIsHovered(false);
                setIsVideoPlaying(false);
              }}
            >
              {/* Video/Image Area */}
              <div className="relative aspect-video w-full bg-black">
                <VideoPreview
                  id={id}
                  type={linkType}
                  isActive={isHovered}
                  onVideoPlay={() => setIsVideoPlaying(true)}
                />
                <img
                  src={getImageUrl(posterUrl)}
                  alt={title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                    isVideoPlaying ? "opacity-0" : "opacity-100"
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
              </div>

              {/* Info Area */}
              <div className="p-4 space-y-3">
                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(
                        "https://www.effectivegatecpm.com/c4xq24286w?key=aef90db41813e2740b3c7c0caecdb42d",
                        "_blank"
                      );
                      setTimeout(() => {
                        navigate(`/${linkType}/${id}`);
                      }, 300);
                    }}
                    className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                  <button className="w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 flex items-center justify-center hover:border-white hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/${linkType}/${id}`);
                    }}
                    className="w-8 h-8 rounded-full border-2 border-gray-400 text-gray-400 flex items-center justify-center hover:border-white hover:text-white transition-colors ml-auto"
                  >
                    <Info className="w-4 h-4" />
                  </button>
                </div>

                {/* Metadata */}
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-sm line-clamp-1">
                    {title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-300 font-medium">
                    <span className="text-green-400 font-bold">
                      {details?.vote_average
                        ? `${Math.round(details.vote_average * 10)}% Match`
                        : ""}
                    </span>
                    <span className="border border-gray-600 px-1 rounded text-[10px]">
                      HD
                    </span>
                    <span>{getYear()}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {details?.genres?.slice(0, 3).map((g) => (
                      <span
                        key={g.name}
                        className="text-[10px] text-gray-400 flex items-center"
                      >
                        <span className="w-1 h-1 rounded-full bg-gray-600 mr-1.5" />
                        {g.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};

export default MovieCard;
