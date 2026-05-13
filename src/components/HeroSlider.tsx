import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";
import { Play, Info } from "lucide-react";

import "swiper/swiper-bundle.css";

// Mock data for hero slider
const heroSlides = [
  {
    id: 1,
    title: "Inception",
    description:
      "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
    image:
      "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop",
    rating: "9.3",
    year: "2010",
  },
  {
    id: 2,
    title: "Interstellar",
    description:
      "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.",
    image:
      "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=2013&auto=format&fit=crop",
    rating: "8.9",
    year: "2014",
  },
  {
    id: 3,
    title: "The Dark Knight",
    description:
      "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
    image:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e63?q=80&w=2068&auto=format&fit=crop",
    rating: "9.0",
    year: "2008",
  },
];

const HeroSlider: React.FC = () => {
  return (
    <div className="relative h-[80vh] w-full">
      <Swiper
        spaceBetween={0}
        centeredSlides={true}
        autoplay={{
          delay: 8000,
          disableOnInteraction: true,
          pauseOnMouseEnter: true,
        }}
        effect={"fade"}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        className="h-full w-full"
      >
        {heroSlides.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative h-full w-full">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/30 to-transparent" />
              </div>

              <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 pb-24">
                <div className="max-w-3xl space-y-4">
                  <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-2">
                    {slide.title}
                  </h1>
                  <div className="flex items-center space-x-4 text-sm md:text-base text-text-muted">
                    <span className="text-green-400 font-semibold">
                      {slide.rating} Rating
                    </span>
                    <span>{slide.year}</span>
                    <span className="border border-text-muted px-2 py-0.5 rounded text-xs">
                      HD
                    </span>
                  </div>
                  <p className="text-text-muted text-lg line-clamp-3 md:line-clamp-none max-w-2xl">
                    {slide.description}
                  </p>
                  <div className="flex items-center space-x-4 pt-4">
                    <button className="flex items-center space-x-2 bg-white hover:bg-white/90 text-black px-6 py-3 rounded-full font-semibold transition-colors">
                      <Play className="fill-current h-5 w-5" />
                      <span>Watch Now</span>
                    </button>
                    <button className="flex items-center space-x-2 bg-secondary/80 hover:bg-secondary text-white px-6 py-3 rounded-full font-semibold transition-colors backdrop-blur-sm">
                      <Info className="h-5 w-5" />
                      <span>More Info</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroSlider;
