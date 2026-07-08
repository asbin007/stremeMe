import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, FreeMode, Mousewheel, Autoplay } from "swiper/modules";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
    <div className="py-6 px-4 md:px-12 space-y-4">
      <div className="flex items-center justify-between mb-2 md:mb-3 group cursor-pointer lg:cursor-auto">
        <h2 className="text-lg md:text-2xl font-bold text-white md:text-gray-300 md:group-hover:text-white transition-colors duration-300 flex items-center shrink-0 w-auto gap-1.5 md:gap-2">
          {title}
          <span className="inline-block md:hidden text-accent text-[10px] uppercase font-bold tracking-wider ml-2 opacity-70">
            Explore
          </span>
          <span className="hidden md:inline-block text-accent text-xs font-bold tracking-widest uppercase opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0">
            Explore All {" >"}
          </span>
        </h2>
      </div>

      <div className="-mx-4 md:-mx-12 px-4 md:px-12">
        <Swiper
          modules={[Navigation, Pagination, FreeMode, Mousewheel, Autoplay]}
          navigation
          autoplay={{
            delay: 5000 + Math.random() * 2000, // Staggered start to avoid simultaneous movement
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          loop={true}
          freeMode={false} // Autoplay works better without freeMode usually
          mousewheel={{ forceToAxis: true }}
          spaceBetween={8}
          slidesPerView={"auto"}
          slidesPerGroup={1}
          breakpoints={{
            320: { slidesPerView: 2.5, slidesPerGroup: 2, spaceBetween: 8 },
            480: { slidesPerView: 3.5, slidesPerGroup: 3, spaceBetween: 10 },
            640: { slidesPerView: 4.5, slidesPerGroup: 4, spaceBetween: 10 },
            768: { slidesPerView: 5.5, slidesPerGroup: 5, spaceBetween: 12 },
            1024: { slidesPerView: 6.5, slidesPerGroup: 3, spaceBetween: 14 },
            1280: { slidesPerView: 7.5, slidesPerGroup: 4, spaceBetween: 14 },
            1536: { slidesPerView: 8.5, slidesPerGroup: 4, spaceBetween: 14 },
          }}
          className="content-carousel !pb-8 !overflow-visible"
        >
          {children
            ? React.Children.map(children, (child, index) => (
                <SwiperSlide key={index} className="!h-auto">
                  {child}
                </SwiperSlide>
              ))
            : data?.filter((item) => item.poster_path).map((item) => (
                <SwiperSlide key={item.id} className="!h-auto">
                  <div
                    className="group relative w-full rounded-md md:rounded-lg overflow-hidden cursor-pointer bg-secondary h-full border border-transparent md:hover:border-white/20 transition-all duration-300 transform md:hover:scale-110 md:hover:z-50 shadow-sm md:hover:shadow-2xl md:hover:shadow-black/60 md:hover:-translate-y-2 active:scale-95 md:active:scale-100"
                    onClick={() => handleItemClick(item.id)}
                  >
                    <div className="aspect-[2/3] w-full relative overflow-hidden bg-black/50">
                      <img
                        src={getImageUrl(item.poster_path)}
                        alt={item.title || item.name}
                        className="w-full h-full object-cover transition-opacity duration-300 md:group-hover:opacity-60"
                        loading="lazy"
                      />

                      {/* Cinematic Gradient Overlay (Desktop Only) */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10 hidden md:block" />

                      {/* Hover Details Panel (Desktop Only) */}
                      <div className="hidden md:flex absolute inset-0 flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full bg-white text-black flex items-center justify-center transform scale-50 group-hover:scale-100 transition-all duration-500 ease-out shadow-xl">
                          <Play className="h-7 w-7 fill-current ml-1" />
                        </div>

                        <div className="space-y-1 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                          <h3 className="text-white font-bold text-xs md:text-sm line-clamp-2 leading-tight drop-shadow-md">
                            {item.title || item.name}
                          </h3>
                          <div className="flex items-center gap-3 text-[10px] md:text-xs">
                             {item.vote_average ? (
                                <div className="flex items-center gap-1 text-white border border-white/30 px-1 py-px rounded-sm bg-black/40 backdrop-blur-sm">
                                  <span>⭐ {item.vote_average?.toFixed(1)}</span>
                                </div>
                             ) : null}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
        </Swiper>
      </div>
    </div>
  );
};

export default ContentCarousel;
