import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { Play, Star, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { getImageUrl } from "../services/tmdb";

import "swiper/swiper-bundle.css";

interface Content {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
}

interface ContentCarouselProps {
  title: string;
  data?: Content[];
  mediaType?: "movie" | "tv";
  children?: React.ReactNode;
}

const ContentCarousel: React.FC<ContentCarouselProps> = ({
  title,
  data,
  mediaType,
  children,
}) => {
  const navigate = useNavigate();

  const handleItemClick = (id: number) => {
    if (mediaType) {
      navigate(`/${mediaType}/${id}`);
    }
  };

  return (
    <div className="py-10 px-4 md:px-12 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white border-l-4 border-accent pl-4">
          {title}
        </h2>
      </div>

      <Swiper
        modules={[Navigation, Pagination]}
        navigation
        pagination={{ clickable: true, dynamicBullets: true }}
        spaceBetween={20}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1280: { slidesPerView: 6 },
        }}
        className="content-carousel !pb-12"
      >
        {children
          ? React.Children.map(children, (child, index) => (
              <SwiperSlide key={index} className="!h-auto">
                {child}
              </SwiperSlide>
            ))
          : data?.map((item) => (
              <SwiperSlide key={item.id} className="!h-auto">
                <motion.div
                  whileHover={{ y: -10, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="group relative rounded-xl overflow-hidden cursor-pointer bg-secondary shadow-lg h-full border border-white/5"
                  onClick={() => handleItemClick(item.id)}
                >
                  <div className="aspect-[2/3] w-full relative overflow-hidden">
                    <img
                      src={getImageUrl(item.poster_path)}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Hover Content */}
                    <div className="absolute inset-0 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="self-center bg-accent hover:bg-accent-hover text-white p-3 rounded-full mb-auto mt-auto transform scale-0 group-hover:scale-100 transition-transform duration-300 delay-100 shadow-lg shadow-accent/50">
                        <Play className="h-6 w-6 fill-current" />
                      </button>

                      <div className="space-y-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                        <h3 className="text-white font-bold text-sm line-clamp-2 leading-tight">
                          {item.title || item.name}
                        </h3>
                        <div className="flex items-center justify-between text-xs text-gray-300">
                          <div className="flex items-center gap-1 text-yellow-400">
                            <Star className="w-3 h-3 fill-current" />
                            <span>{item.vote_average?.toFixed(1)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {
                                (
                                  item.release_date || item.first_air_date
                                )?.split("-")[0]
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
      </Swiper>
    </div>
  );
};

export default ContentCarousel;
