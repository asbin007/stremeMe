import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import ContentCarousel from "../components/ContentCarousel";

import MovieCard from "../components/MovieCard";
import VideoPlayer from "../components/VideoPlayer";
import HeroCarousel from "../components/HeroCarousel";
import { tmdbService } from "../services/tmdb";
import type { Movie } from "../services/tmdb";

const HindiMovies: React.FC = () => {
  const [showPlayer, setShowPlayer] = useState(false);
  const [heroMovies, setHeroMovies] = useState<Movie[]>([]);

  // Categories
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [bollywoodAction, setBollywoodAction] = useState<Movie[]>([]);
  const [bollywoodRomance, setBollywoodRomance] = useState<Movie[]>([]);
  const [bollywoodComedy, setBollywoodComedy] = useState<Movie[]>([]);
  const [southAction, setSouthAction] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [trending, newM, actionM, romanceM, comedyM, southActionM] =
          await Promise.all([
            tmdbService.getBollywoodMovies(), // Use general popularity for Hero
            tmdbService.getHindiNewReleases(),
            tmdbService.getHindiActionMovies(),
            tmdbService.getHindiRomanceMovies(),
            tmdbService.getHindiComedyMovies(),
            tmdbService.getSouthActionMovies(),
          ]);

        setHeroMovies(trending.results as Movie[]); // Top popular for Hero
        setNewReleases(newM.results as Movie[]);
        setBollywoodAction(actionM.results as Movie[]);
        setBollywoodRomance(romanceM.results as Movie[]);
        setBollywoodComedy(comedyM.results as Movie[]);
        setSouthAction(southActionM.results as Movie[]);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
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
    { id: "new-releases", title: "New Releases", data: newReleases },
    { id: "action", title: "Blockbuster Action", data: bollywoodAction },
    { id: "romance", title: "Romantic Hits", data: bollywoodRomance },
    { id: "south", title: "South Indian Action", data: southAction },
    { id: "comedy", title: "Comedy Entertainers", data: bollywoodComedy },
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

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden pb-20">
      {/* Hero Carousel */}
      {heroMovies.length > 0 && (
        <HeroCarousel movies={heroMovies.slice(0, 8)} />
      )}

      {/* Filter Chips */}
      <div className="relative z-10 container mx-auto px-4 md:px-8 -mt-24 mb-12 flex flex-wrap gap-3 pointer-events-none">
        {[
          { label: "New Releases", id: "new-releases" },
          { label: "Action", id: "action" },
          { label: "Romance", id: "romance" },
          { label: "Comedy", id: "comedy" },
          { label: "South Indian", id: "south" },
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

      {/* Content Sections */}
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

      <VideoPlayer videoUrl={null} onClose={() => setShowPlayer(false)} />

      {showPlayer && (
        <div
          className="fixed inset-0 z-40 bg-black/90"
          onClick={() => setShowPlayer(false)}
        />
      )}
    </div>
  );
};

export default HindiMovies;
