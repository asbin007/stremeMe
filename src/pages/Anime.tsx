import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ContentCarousel from "../components/ContentCarousel";
import { toMovieCardProps, type MediaItem } from "../types/media";
import HeroCarousel from "../components/HeroCarousel";
import MovieCard from "../components/MovieCard";
import { tmdbService } from "../services/tmdb";
import type { Movie } from "../services/tmdb";
import { HeroSkeleton, CarouselSkeleton } from "../components/Skeleton";
import { SEOHead } from "../components/SEOHead";
import { generateBreadcrumbSchema } from "../utils/seoUtils";

const Anime: React.FC = () => {
  const [heroAnime, setHeroAnime] = useState<Movie[]>([]);

  // Categories. The three series lists hold TV entries, which carry `name`
  // rather than `title` — they were typed `Movie[]` behind an `as` cast, which
  // is why the grid had to reach for `(item as any).name` to render a heading.
  const [popularSeries, setPopularSeries] = useState<MediaItem[]>([]);
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([]);
  const [actionAnime, setActionAnime] = useState<MediaItem[]>([]);
  const [romanceAnime, setRomanceAnime] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnime = async () => {
      try {
        setLoading(true);
        const [movies, series, action, romance] = await Promise.all([
          tmdbService.getAnimeMovies(),
          tmdbService.getAnimeSeries(),
          tmdbService.getAnimeAction(),
          tmdbService.getAnimeRomance(),
        ]);

        setHeroAnime(movies.results as Movie[]);
        setTrendingMovies(movies.results as Movie[]);
        setPopularSeries(series.results as MediaItem[]);
        setActionAnime(action.results as MediaItem[]);
        setRomanceAnime(romance.results as MediaItem[]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching anime:", error);
        setLoading(false);
      }
    };

    fetchAnime();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20">
        <HeroSkeleton />
        <div className="space-y-8 mt-12">
          <CarouselSkeleton />
          <CarouselSkeleton />
          <CarouselSkeleton />
        </div>
      </div>
    );
  }

  const sections = [
    { id: "popular", title: "Popular Series", data: popularSeries, type: "tv", viewAllLink: "/browse/anime-series" },
    {
      id: "movies",
      title: "Trending Movies",
      data: trendingMovies,
      type: "movie",
      viewAllLink: "/browse/anime-movies",
    },
    {
      id: "action",
      title: "High-Octane Action",
      data: actionAnime,
      type: "tv",
      viewAllLink: "/browse/anime-action",
    },
    { id: "romance", title: "Romance & Drama", data: romanceAnime, type: "tv", viewAllLink: "/browse/anime-romance" },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Anime", url: "/anime" }
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20">
      <SEOHead
        title="Watch Free Anime Online HD — Stream Anime Movies & TV Shows | AuraScreen"
        description="Stream popular anime movies and series online for free in HD quality on AuraScreen. Watch English subbed & dubbed anime, action, romance, and new releases with zero ads."
        keywords={[
          "free anime",
          "watch anime online",
          "stream anime free",
          "anime movies HD",
          "anime series subbed dubbed",
          "AuraScreen"
        ]}
        structuredData={[breadcrumbs]}
      />
      {/* Hero Carousel */}
      {heroAnime.length > 0 && <HeroCarousel movies={heroAnime.slice(0, 8)} />}

      {/* Filter Chips */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 -mt-24 mb-12 flex flex-wrap gap-3 pointer-events-none">
        {[
          { label: "Popular Series", id: "popular" },
          { label: "Movies", id: "movies" },
          { label: "Action", id: "action" },
          { label: "Romance", id: "romance" },
        ].map((chip) => (
          <div
            key={chip.id}
            onClick={() => scrollToSection(chip.id)}
            className="px-4 py-1.5 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-sm font-medium text-white/90 shadow-lg pointer-events-auto cursor-pointer hover:bg-accent hover:border-accent transition-colors active:scale-95 transform duration-200"
          >
            {chip.label}
          </div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-8 space-y-12">
        {sections.map(
          (section, index) =>
            section.data &&
            section.data.length > 0 && (
              <motion.div
                key={section.title}
                id={section.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <ContentCarousel title={section.title} viewAllLink={section.viewAllLink}>
                  {section.data.map((item) => (
                    <MovieCard
                      key={item.id}
                      {...toMovieCardProps(item)}
                      type={section.type as "movie" | "tv"}
                    />
                  ))}
                </ContentCarousel>
              </motion.div>
            )
        )}
      </div>
    </div>
  );
};

export default Anime;
