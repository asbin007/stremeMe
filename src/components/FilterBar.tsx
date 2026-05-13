import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Filter, SlidersHorizontal } from "lucide-react";
import clsx from "clsx";

interface Genre {
  id: number;
  name: string;
}

interface FilterBarProps {
  genres: Genre[];
  selectedGenre: number | null;
  onSelectGenre: (id: number | null) => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  type: "movie" | "tv";
}

const sortOptions = [
  { value: "popularity.desc", label: "Popular" },
  { value: "vote_average.desc", label: "Top Rated" },
  { value: "primary_release_date.desc", label: "Newest" },
];

const FilterBar: React.FC<FilterBarProps> = ({
  genres,
  selectedGenre,
  onSelectGenre,
  sortBy,
  onSortChange,
  type,
}) => {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedSortLabel = sortOptions.find(
    (opt) => opt.value === sortBy
  )?.label;

  return (
    <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/10 backdrop-blur-sm">
      {/* Genre Selector */}
      <div className="w-full lg:flex-1 overflow-hidden">
        <div className="flex items-center gap-3 mb-3 lg:mb-0">
          <div className="p-2 bg-accent/10 rounded-lg">
            <Filter className="w-5 h-5 text-accent" />
          </div>
          <span className="text-sm font-medium text-gray-400">Genres:</span>
        </div>

        <div className="flex overflow-x-auto gap-2 pb-2 lg:pb-0 scrollbar-hide mask-linear-fade">
          <button
            onClick={() => onSelectGenre(null)}
            className={clsx(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border",
              selectedGenre === null
                ? "bg-accent text-white border-accent shadow-lg shadow-accent/25"
                : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
            )}
          >
            All {type === "movie" ? "Movies" : "Shows"}
          </button>
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => onSelectGenre(genre.id)}
              className={clsx(
                "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 border",
                selectedGenre === genre.id
                  ? "bg-accent text-white border-accent shadow-lg shadow-accent/25"
                  : "bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:text-white"
              )}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Selector */}
      <div className="relative w-full lg:w-auto min-w-[200px]" ref={sortRef}>
        <div className="flex items-center gap-3 mb-2 lg:hidden">
          <div className="p-2 bg-accent/10 rounded-lg">
            <SlidersHorizontal className="w-5 h-5 text-accent" />
          </div>
          <span className="text-sm font-medium text-gray-400">Sort By:</span>
        </div>

        <button
          onClick={() => setIsSortOpen(!isSortOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-black/40 border border-white/10 rounded-xl hover:border-accent/50 transition-colors text-sm"
        >
          <span className="text-gray-300">{selectedSortLabel}</span>
          <ChevronDown
            className={clsx(
              "w-4 h-4 text-gray-400 transition-transform duration-200",
              isSortOpen && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence>
          {isSortOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-full lg:w-56 bg-secondary border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
            >
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value);
                    setIsSortOpen(false);
                  }}
                  className={clsx(
                    "w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between",
                    sortBy === option.value
                      ? "bg-accent/10 text-accent"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {option.label}
                  {sortBy === option.value && (
                    <motion.div
                      layoutId="activeSort"
                      className="w-1.5 h-1.5 rounded-full bg-accent"
                    />
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FilterBar;
