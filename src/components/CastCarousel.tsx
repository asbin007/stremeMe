import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { FreeMode, Scrollbar, Navigation, Mousewheel } from "swiper/modules";
import { getImageUrl } from "../services/tmdb";

import "swiper/swiper-bundle.css";

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface CastCarouselProps {
  cast: CastMember[];
}

const CastCarousel: React.FC<CastCarouselProps> = ({ cast }) => {
  if (!cast || cast.length === 0) return null;

  return (
    <div className="py-4">
      <Swiper
        modules={[FreeMode, Scrollbar, Navigation, Mousewheel]}
        spaceBetween={16}
        slidesPerView={2.5}
        freeMode={true}
        navigation
        mousewheel={{ forceToAxis: true }}
        scrollbar={{ draggable: true, hide: true }}
        breakpoints={{
          640: {
            slidesPerView: 3.5,
          },
          768: {
            slidesPerView: 4.5,
          },
          1024: {
            slidesPerView: 6.5,
          },
        }}
        className="w-full"
      >
        {cast.map((actor) => (
          <SwiperSlide key={actor.id} className="pb-4">
            <div className="group relative">
              <div className="aspect-[3/4] rounded-lg overflow-hidden bg-white/5 mb-3">
                <img
                  src={getImageUrl(actor.profile_path, "w185")}
                  alt={actor.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
              <h3 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-accent transition-colors">
                {actor.name}
              </h3>
              <p className="text-xs text-text-muted line-clamp-1">
                {actor.character}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CastCarousel;
