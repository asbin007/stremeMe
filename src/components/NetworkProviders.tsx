import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode, Autoplay, A11y } from "swiper/modules";
import { ChevronRight } from "lucide-react";

import "swiper/swiper-bundle.css";
import { TMDB_LANGUAGE, WATCH_REGION } from "../constants/region";

interface ProviderData {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  /** TMDB's ranking of this provider *within the requested region*. */
  display_priority?: number;
}

/** How many of the region's top providers the row shows. */
const ROW_SIZE = 30;

/**
 * Fallback if the API call fails.
 *
 * Deliberately the services this audience actually has. The previous list was
 * Hulu, Max and Peacock, none of which operate in India or Nepal — so when the
 * request failed, every viewer saw a row of platforms they could not use.
 */
const FALLBACK_PROVIDERS: ProviderData[] = [
  { provider_id: 8, provider_name: "Netflix", logo_path: "/pbpMk2JmcoNnQwN5JGpXngfoWtp.jpg" },
  { provider_id: 119, provider_name: "Amazon Prime Video", logo_path: "/emthp39XA2YScoYL1p0sdbAH2WA.jpg" },
  { provider_id: 122, provider_name: "Disney+ Hotstar", logo_path: "/wrTOZ0LrxpNhrpXsIieAyLPnPmM.jpg" },
  { provider_id: 220, provider_name: "JioCinema", logo_path: "/8VCV78prwd9QzZnEm0ReO6bERDa.jpg" },
  { provider_id: 237, provider_name: "SonyLIV", logo_path: "/9NuMhrjLROVwmuiWyBaMcRTJ8Xa.jpg" },
  { provider_id: 232, provider_name: "ZEE5", logo_path: "/nnPtPHIQCjBFbGGb7XSxRLzHwCX.jpg" },
  { provider_id: 350, provider_name: "Apple TV+", logo_path: "/6uhKBfmtzFqOcLousHwZuzcrScK.jpg" },
  { provider_id: 283, provider_name: "Crunchyroll", logo_path: "/8Gt1iClBlzTeQs8WQm8UrCoIxnQ.jpg" },
];

function ProviderTileSkeleton() {
  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div className="h-16 w-16 animate-pulse rounded-2xl bg-surface/60 md:h-20 md:w-20" />
      <div className="h-2.5 w-12 animate-pulse rounded bg-surface/60" />
    </div>
  );
}

const NetworkProviders: React.FC = () => {
  const [providers, setProviders] = useState<ProviderData[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * The carousel scrolls itself continuously. That is decorative motion, and
   * the OS-level reduce-motion setting must switch it off — Swiper drives
   * autoplay in JavaScript, so the global CSS media query does not reach it.
   */
  const prefersReducedMotion = useMemo(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    []
  );

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const token = import.meta.env.VITE_TMDB_ACCESS_TOKEN;
        const response = await fetch(
          `https://api.themoviedb.org/3/watch/providers/movie?watch_region=${WATCH_REGION}&language=${TMDB_LANGUAGE}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          }
        );
        const data = await response.json();
        if (controller.signal.aborted) return;

        if (data.results) {
          // Ordered by TMDB's ranking for this region rather than a hardcoded
          // list of US provider ids, so the row reflects what viewers here
          // actually subscribe to.
          const ranked = (data.results as ProviderData[])
            .filter(p => p.logo_path)
            .sort(
              (a, b) => (a.display_priority ?? 999) - (b.display_priority ?? 999)
            )
            .slice(0, ROW_SIZE);

          setProviders(ranked);
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Failed to fetch providers:", error);
        setProviders(FALLBACK_PROVIDERS);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, []);

  // Render placeholder tiles rather than nothing. Returning null until the
  // request landed made the row appear from nowhere and shove the page down.
  if (loading) {
    return (
      <div className="space-y-4 px-4 py-6 md:px-12">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white md:text-2xl">Providers</h2>
        </div>
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 12 }).map((_, i) => (
            <ProviderTileSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (providers.length === 0) return null;

  return (
    <div className="space-y-4 px-4 py-6 md:px-12">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white md:text-2xl">Providers</h2>
        <Link
          to="/providers"
          className="flex items-center gap-1 text-sm text-text-muted transition-colors hover:text-white"
        >
          View All
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      <Swiper
        modules={[Navigation, FreeMode, Autoplay, A11y]}
        navigation
        freeMode
        loop
        a11y={{
          prevSlideMessage: "Previous providers",
          nextSlideMessage: "Next providers",
        }}
        autoplay={
          prefersReducedMotion
            ? false
            : {
                delay: 0,
                disableOnInteraction: false,
                // Without this the row keeps sliding while you try to click a
                // tile, so the target moves out from under the cursor.
                pauseOnMouseEnter: true,
              }
        }
        speed={prefersReducedMotion ? 300 : 4000}
        spaceBetween={12}
        slidesPerView="auto"
        // Fewer, larger tiles. It previously showed 12.5 across at 1280px,
        // which left 72px logos under 9px labels clamped to 60px wide — most
        // provider names were unreadable.
        breakpoints={{
          320: { slidesPerView: 3.5, spaceBetween: 10 },
          480: { slidesPerView: 4.5, spaceBetween: 12 },
          640: { slidesPerView: 5.5, spaceBetween: 12 },
          768: { slidesPerView: 7.5, spaceBetween: 14 },
          1024: { slidesPerView: 9.5, spaceBetween: 14 },
          1280: { slidesPerView: 11.5, spaceBetween: 16 },
        }}
        className="provider-carousel"
      >
        {providers.map(provider => (
          <SwiperSlide key={provider.provider_id} className="!w-auto py-2">
            <Link
              to={`/provider?watch_provider=${provider.provider_id}`}
              className="group flex flex-col items-center gap-2"
              title={provider.provider_name}
            >
              <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 border-white/10 bg-secondary shadow-lg transition-colors duration-200 group-hover:border-accent/50 group-focus-visible:border-accent md:h-20 md:w-20">
                <img
                  // w154 rather than w92: the tile is 80px, so w92 was blurry
                  // on any retina display.
                  src={`https://image.tmdb.org/t/p/w154${provider.logo_path}`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  // `cover` cropped the edges off wordmark logos.
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="line-clamp-1 max-w-[64px] text-center text-[10px] text-text-muted transition-colors group-hover:text-white md:max-w-[80px] md:text-xs">
                {provider.provider_name}
              </span>
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default NetworkProviders;
