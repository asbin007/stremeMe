import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectFade, Autoplay, Pagination } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { getImageUrl } from "../services/tmdb";
import type { Movie } from "../services/tmdb";
import Button from "./Button";

import "swiper/swiper-bundle.css";

interface HeroCarouselProps {
  movies: Movie[];
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ movies }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative h-[85vh] w-full overflow-hidden group">
      <Swiper
        modules={[EffectFade, Autoplay, Pagination]}
        effect="fade"
        autoplay={{
          delay: 8000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
          dynamicBullets: true,
        }}
        loop={true}
        className="h-full w-full"
      >
        {movies.slice(0, 5).map((movie) => (
          <SwiperSlide key={movie.id}>
            {({ isActive }) => (
              <div className="relative h-full w-full">
                {/* Background Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-out"
                  style={{
                    backgroundImage: `url(${getImageUrl(
                      movie.backdrop_path,
                      "original"
                    )})`,
                    transform: isActive ? "scale(1.05)" : "scale(1)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                </div>

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
                            className="flex gap-4 pt-4"
                          >
                            <Link to={`/movie/${movie.id}`}>
                              <Button
                                size="lg"
                                className="gap-2 bg-red-600 text-white hover:bg-red-700 border-0 font-bold px-6 h-12 sm:px-8 sm:h-14 rounded-md shadow-lg transition-all transform hover:scale-105"
                              >
                                <Play className="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                                Play
                              </Button>
                            </Link>
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
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;
