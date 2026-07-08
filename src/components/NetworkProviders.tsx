import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import { ChevronRight } from "lucide-react";

import "swiper/swiper-bundle.css";

interface ProviderData {
  provider_id: number;
  provider_name: string;
  logo_path: string;
}

// Top provider IDs to display (in order of priority)
const TOP_PROVIDER_IDS = [
  8, 9, 350, 337, 15, 1899, 283, 386, 531, 2, 43, 73, 300, 257, 207, 526, 520, 387, 191, 11,
];

const NetworkProviders: React.FC = () => {
  const [providers, setProviders] = useState<ProviderData[]>([]);

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
        const response = await fetch(
          "https://api.themoviedb.org/3/watch/providers/movie?watch_region=US&language=en-US",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const data = await response.json();
        
        if (data.results) {
          // Filter to our top providers and sort by our priority order
          const filtered = TOP_PROVIDER_IDS
            .map((id) => data.results.find((p: ProviderData) => p.provider_id === id))
            .filter(Boolean) as ProviderData[];
          setProviders(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch providers:", error);
        // Fallback to hardcoded if API fails
        setProviders(FALLBACK_PROVIDERS);
      }
    };

    fetchProviders();
  }, []);

  if (providers.length === 0) return null;

  return (
    <div className="py-6 px-4 md:px-12 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg md:text-2xl font-bold text-white flex items-center gap-2">
          Providers
        </h2>
        <Link
          to="/providers"
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Provider Carousel */}
      <Swiper
        modules={[Navigation, FreeMode]}
        navigation
        freeMode
        spaceBetween={10}
        slidesPerView="auto"
        breakpoints={{
          320: { slidesPerView: 4.5, spaceBetween: 8 },
          480: { slidesPerView: 5.5, spaceBetween: 10 },
          640: { slidesPerView: 6.5, spaceBetween: 10 },
          768: { slidesPerView: 8.5, spaceBetween: 12 },
          1024: { slidesPerView: 10.5, spaceBetween: 12 },
          1280: { slidesPerView: 12.5, spaceBetween: 12 },
        }}
        className="!overflow-visible provider-carousel"
      >
        {providers.map((provider) => (
          <SwiperSlide key={provider.provider_id} className="!w-auto">
            <Link
              to={`/provider?watch_provider=${provider.provider_id}`}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 md:w-[72px] md:h-[72px] rounded-xl md:rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-white/40 transition-all duration-300 group-hover:scale-110 shadow-lg group-hover:shadow-xl group-hover:shadow-white/5 bg-secondary">
                <img
                  src={`https://image.tmdb.org/t/p/w92${provider.logo_path}`}
                  alt={provider.provider_name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // If w92 fails, try original
                    (e.target as HTMLImageElement).src = `https://image.tmdb.org/t/p/original${provider.logo_path}`;
                  }}
                />
              </div>
              <span className="text-[9px] md:text-[11px] text-gray-500 group-hover:text-white transition-colors text-center line-clamp-1 max-w-[60px] md:max-w-[72px]">
                {provider.provider_name}
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

// Fallback if API call fails
const FALLBACK_PROVIDERS: ProviderData[] = [
  { provider_id: 8, provider_name: "Netflix", logo_path: "/pbpMk2JmcoNnQwN5JGpXngfoWtp.jpg" },
  { provider_id: 9, provider_name: "Amazon Prime Video", logo_path: "/emthp39XA2YScoYL1p0sdbAH2WA.jpg" },
  { provider_id: 350, provider_name: "Apple TV+", logo_path: "/6uhKBfmtzFqOcLousHwZuzcrScK.jpg" },
  { provider_id: 337, provider_name: "Disney+", logo_path: "/7rwgEs15tFwyR9NPQ5vpzxTj19Q.jpg" },
  { provider_id: 15, provider_name: "Hulu", logo_path: "/zxrVdFjIjLqkfnwyghnfywTn3Lh.jpg" },
  { provider_id: 1899, provider_name: "Max", logo_path: "/6Q3KKEFIL2LPGBX40BR0WPnfPou.jpg" },
  { provider_id: 283, provider_name: "Crunchyroll", logo_path: "/8Gt1iClBlzTeQs8WQm8UrCoIxnQ.jpg" },
  { provider_id: 386, provider_name: "Peacock", logo_path: "/xTHltMrZPAJFLQ6qyCBjAnXSmZt.jpg" },
];

export default NetworkProviders;
