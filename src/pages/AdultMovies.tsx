import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ContentCarousel from "../components/ContentCarousel";
import HeroCarousel from "../components/HeroCarousel";
import MovieCard from "../components/MovieCard";

import { tmdbService } from "../services/tmdb";
import type { Movie } from "../services/tmdb";
import { SEOHead } from "../components/SEOHead";
import { generateBreadcrumbSchema } from "../utils/seoUtils";

const AdultMovies: React.FC = () => {
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);
  const [matureMovies, setMatureMovies] = useState<Movie[]>([]);
  const [adultRomance, setAdultRomance] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [mature, romance] = await Promise.all([
          tmdbService.getMatureMovies(),
          tmdbService.getAdultRomance(),
        ]);

        setHeroMovies(mature.results as Movie[]);
        setMatureMovies(mature.results as Movie[]);
        setAdultRomance(romance.results as Movie[]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching mature content:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  const sections = [
    { id: "mature", title: "Mature Thrillers & Crime", data: matureMovies },
    { id: "romance", title: "Steamy Romance", data: adultRomance },
  ];

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  };

  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "18+ Mature Movies", url: "/18-plus" }
  ]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20">
      <SEOHead
        title="18+ Mature & Romance Movies — Stream Online | AuraScreen"
        description="Stream mature 18+ thriller and romance movies online on AuraScreen."
        keywords={["mature movies", "18+ movies free", "romance thrillers", "AuraScreen"]}
        structuredData={[breadcrumbs]}
      />
      {/* Hero Carousel */}
      {heroMovies.length > 0 && (
        <HeroCarousel movies={heroMovies.slice(0, 8)} />
      )}

      {/* Filter Chips */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 -mt-24 mb-12 flex flex-wrap gap-3 pointer-events-none">
        {[
          { label: "Mature Thrillers", id: "mature" },
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

      {/* Content */}
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
                <ContentCarousel title={section.title}>
                  {section.data.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      id={movie.id}
                      title={movie.title}
                      posterUrl={movie.poster_path}
                      type="movie"
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

export default AdultMovies;
