import { Link } from "react-router-dom";
import { Play } from "lucide-react";

export interface TrendingItem {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface TrendingSectionProps {
  items: TrendingItem[];
}

export function TrendingSection({ items }: TrendingSectionProps) {
  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6 px-4 md:px-12">
        <span className="w-1.5 h-8 bg-accent rounded-full"></span>
        <h2 className="text-2xl md:text-3xl font-bold text-white">
          Trending Now
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 md:px-12">
        {items.map((item) => (
          <Link
            to={`/movie/${item.id}`}
            key={item.id}
            className="relative aspect-[16/9] rounded-xl overflow-hidden cursor-pointer group hover:ring-2 hover:ring-accent transition-all duration-300 block shadow-lg"
          >
            <img
              src={item.image || "/placeholder.svg"}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Trending badge */}
            <div className="absolute top-4 left-4 z-20">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow-md uppercase tracking-wide">
                Trending
              </span>
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

            {/* Hover Play Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
              <div className="w-16 h-16 rounded-full bg-accent/90 flex items-center justify-center shadow-xl backdrop-blur-sm transform scale-0 group-hover:scale-100 transition-transform duration-300">
                <Play className="w-8 h-8 text-white fill-current ml-1" />
              </div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 drop-shadow-lg">
                {item.title}
              </h3>
              <p className="text-sm text-gray-300 line-clamp-2 max-w-xl drop-shadow-md">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
