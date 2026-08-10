import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import MovieCard from "../components/MovieCard";
import HeroCarousel from "../components/HeroCarousel";
import { tmdbService } from "../services/tmdb";
import type { Movie } from "../services/tmdb";
import { HeroSkeleton, CarouselSkeleton, MovieCardSkeleton } from "../components/Skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SEOHead } from "../components/SEOHead";
import { generateBreadcrumbSchema } from "../utils/seoUtils";

const HindiMovies: React.FC = () => {
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("popular");

  const tabs = [
    { id: "popular", label: "Popular" },
    { id: "new", label: "New Releases" },
    { id: "action", label: "Action" },
    { id: "romance", label: "Romance" },
    { id: "comedy", label: "Comedy" },
    { id: "south", label: "South Indian" },
  ];

  const fetchMovies = useCallback(async (tab: string, p: number) => {
    setPageLoading(true);
    try {
      let data;
      switch (tab) {
        case "new":
          data = await tmdbService.getHindiNewReleases(p);
          break;
        case "action":
          data = await tmdbService.getHindiActionMovies(p);
          break;
        case "romance":
          data = await tmdbService.getHindiRomanceMovies(p);
          break;
        case "comedy":
          data = await tmdbService.getHindiComedyMovies(p);
          break;
        case "south":
          data = await tmdbService.getSouthMovies(p);
          break;
        default:
          data = await tmdbService.getBollywoodMovies(p);
      }
      setMovies((data.results as Movie[]).filter(m => m.poster_path));
      setTotalPages(Math.min(data.total_pages, 20));
    } catch (e) {
      console.error(e);
    } finally {
      setPageLoading(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const data = await tmdbService.getBollywoodMovies();
        setHeroMovies((data.results as Movie[]).filter(m => m.backdrop_path).slice(0, 8));
      } catch (e) { console.error(e); }
    };
    fetchHero();
  }, []);

  useEffect(() => {
    fetchMovies(activeTab, page);
  }, [activeTab, page, fetchMovies]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setPage(1);
    window.scrollTo({ top: 400, behavior: "smooth" });
  };

  if (loading && heroMovies.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20">
        <HeroSkeleton />
        <div className="space-y-8 mt-12">
          <CarouselSkeleton />
          <CarouselSkeleton />
        </div>
      </div>
    );
  }

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Hindi Movies", url: "/hindi-movies" }
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20">
      <SEOHead
        title="Watch Free Hindi & Bollywood Movies Online HD — AuraScreen"
        description="Stream latest Bollywood movies, Hindi dubbed South Indian blockbusters, romance, action, and comedy films online for free in full HD on AuraScreen."
        keywords={[
          "free hindi movies",
          "bollywood movies online",
          "watch hindi movies HD",
          "south indian hindi dubbed",
          "stream bollywood free",
          "AuraScreen"
        ]}
        structuredData={[breadcrumbs]}
      />
      {/* Hero */}
      {heroMovies.length > 0 && <HeroCarousel movies={heroMovies} />}

      {/* Tabs */}
      <div className="container mx-auto px-4 md:px-8 -mt-16 relative z-10 mb-8">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? "bg-accent text-white shadow-lg shadow-accent/30"
                  : "bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Movie Grid */}
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
          {pageLoading
            ? Array.from({ length: 20 }).map((_, i) => <MovieCardSkeleton key={i} />)
            : movies.map((movie) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <MovieCard
                    id={movie.id}
                    title={movie.title}
                    posterUrl={movie.poster_path}
                    type="movie"
                  />
                </motion.div>
              ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 mt-10 pb-8">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
          >
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium text-sm transition-all ${
                    page === pageNum
                      ? "bg-accent text-white shadow-lg"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="flex items-center gap-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-all"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default HindiMovies;
