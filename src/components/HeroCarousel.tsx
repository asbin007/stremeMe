import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Pagination } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info, Volume2, VolumeX } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import YouTube from "react-youtube";
import { getImageUrl, tmdbService } from "../services/tmdb";
import type { Movie } from "../services/tmdb";
import Button from "./Button";

import "swiper/swiper-bundle.css";

interface HeroCarouselProps {
  movies: Movie[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ movies }) => {
  const navigate = useNavigate();
  const [trailers, setTrailers] = useState<{ [key: number]: string }>({});
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Fetch trailers for the top 5 movies
  useEffect(() => {
    const fetchTrailers = async () => {
      const trailerMap: { [key: number]: string } = {};
      const topMovies = movies.slice(0, 5);

      await Promise.all(
        topMovies.map(async (movie) => {
          try {
            const data = await tmdbService.getVideos("movie", movie.id);
            const trailer = data.results.find(
              (vid) =>
                vid.site === "YouTube" &&
                (vid.type === "Trailer" || vid.type === "Teaser")
            );
            if (trailer) {
              trailerMap[movie.id] = trailer.key;
            }
          } catch (error) {
            console.error(
              `Failed to fetch trailer for movie ${movie.id}`,
              error
            );
          }
        })
      );
      setTrailers(trailerMap);
    };

    if (movies.length > 0) {
      fetchTrailers();
    }
  }, [movies]);

  // Handle slide change logic
  const handleSlideChange = (swiper: any) => {
    setActiveSlideIndex(swiper.realIndex);
    setShowVideo(false); // Reset video state on slide change
  };

  const handleMouseEnter = () => {
    setShowVideo(true);
  };

  const handleMouseLeave = () => {
    setShowVideo(false);
  };

  if (!movies || movies.length === 0) return null;

  const videoOptions = {
    height: "100%",
    width: "100%",
    playerVars: {
      autoplay: 1,
      controls: 0,
      rel: 0,
      showinfo: 0,
      mute: isMuted ? 1 : 0,
      loop: 1,
      modestbranding: 1, // Hide YouTube logo
      iv_load_policy: 3, // Hide annotations
      playlist: "", // Will be set key for looping
    },
  };

  return (
    <div className="relative h-[60vh] md:h-[85vh] w-full overflow-hidden group bg-black">
      <Swiper
        modules={[EffectFade, Autoplay, Pagination]}
        effect="fade"
        onSlideChange={handleSlideChange}
        autoplay={{
          delay: 10000, // Longer delay to allow video to play
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        loop={true}
        className="h-full w-full"
      >
        {movies.slice(0, 5).map((movie, index) => {
          const trailerKey = trailers[movie.id];
          const isCurrentSlide = index === activeSlideIndex;
          const shouldPlayVideo = isCurrentSlide && showVideo && trailerKey;

          return (
            <SwiperSlide key={movie.id} className="bg-black">
              {({ isActive }) => (
                <div
                  className="relative h-full w-full overflow-hidden"
                  onMouseEnter={() => isCurrentSlide && handleMouseEnter()}
                  onMouseLeave={() => isCurrentSlide && handleMouseLeave()}
                >
                  {/* Video Background Layer */}
                  {shouldPlayVideo && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                      {/* 
                         responsive video container that mimics object-fit: cover
                         The video is sized to be at least 100% of width and height, 
                         maintaining 16:9 aspect ratio.
                      */}
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100vw] h-[56.25vw] min-h-full min-w-[177.78vh]">
                        <YouTube
                          videoId={trailerKey}
                          className="w-full h-full"
                          iframeClassName="w-full h-full object-cover"
                          opts={{
                            ...videoOptions,
                            playerVars: {
                              ...videoOptions.playerVars,
                              playlist: trailerKey,
                              playsinline: 1,
                            },
                          }}
                          onReady={(e) => {
                            e.target.setPlaybackQuality("hd1080");
                            e.target.playVideo();
                          }}
                          onEnd={(e) => e.target.playVideo()}
                        />
                      </div>
                    </div>
                  )}

                  {/* Image Background Layer (Always present, fades out if video plays) */}
                  <motion.div
                    className="absolute inset-0 bg-cover bg-center z-0"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: shouldPlayVideo ? 0 : 1 }}
                    transition={{ duration: 1 }}
                    style={{
                      backgroundImage: `url(${getImageUrl(
                        movie.backdrop_path,
                        "original"
                      )})`,
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                  </motion.div>

                  {/* Gradient Overlay for Video (Ensure text readability) */}
                  {shouldPlayVideo && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-0" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-0" />
                    </>
                  )}

                  {/* Content */}
                  <div className="relative container mx-auto px-4 h-full flex items-center z-10">
                    <div className="max-w-3xl space-y-6 pt-20">
                      <AnimatePresence mode="wait">
                        {isActive && (
                          <>
                            <motion.h1
                              initial={{ opacity: 0, y: 30 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.8, delay: 0.2 }}
                              className="text-3xl sm:text-5xl md:text-7xl font-bold text-white leading-tight drop-shadow-2xl"
                            >
                              {movie.title}
                            </motion.h1>

                            <motion.p
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.8, delay: 0.4 }}
                              className="text-sm sm:text-lg md:text-xl text-gray-200 line-clamp-3 leading-relaxed max-w-2xl drop-shadow-lg"
                            >
                              {movie.overview}
                            </motion.p>

                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.8, delay: 0.6 }}
                              className="flex gap-4 pt-4 items-center"
                            >
                              <Button
                                size="lg"
                                onClick={() => {
                                  window.open(
                                    "https://onionclose.com/ec1332j82?key=802db9e0c75cda5eb230f240cd0ed19f",
                                    "_blank"
                                  );
                                  setTimeout(() => {
                                    navigate(`/movie/${movie.id}`);
                                  }, 300);
                                }}
                                className="gap-2 bg-red-600 text-white hover:bg-red-700 border-0 font-bold px-6 h-12 sm:px-8 sm:h-14 rounded-md shadow-lg transition-all transform hover:scale-105"
                              >
                                <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                                Play
                              </Button>
                              <Link to={`/movie/${movie.id}`}>
                                <Button
                                  size="lg"
                                  variant="secondary"
                                  className="gap-2 bg-gray-500/70 text-white hover:bg-gray-500/50 border-0 font-bold px-6 h-12 sm:px-8 sm:h-14 rounded-md transition-all transform hover:scale-105"
                                >
                                  <Info className="h-5 w-5 sm:h-6 sm:w-6" />
                                  More Info
                                </Button>
                              </Link>

                              {/* Mute Toggle Button */}
                              {shouldPlayVideo && (
                                <button
                                  onClick={() => setIsMuted(!isMuted)}
                                  className="ml-4 p-3 rounded-full border border-white/30 bg-black/20 backdrop-blur-sm hover:bg-white/20 transition-all text-white"
                                  title={isMuted ? "Unmute" : "Mute"}
                                >
                                  {isMuted ? (
                                    <VolumeX className="w-6 h-6" />
                                  ) : (
                                    <Volume2 className="w-6 h-6" />
                                  )}
                                </button>
                              )}
                            </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;
