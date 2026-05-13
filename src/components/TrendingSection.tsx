import { Link } from "react-router-dom";
import { Play, TrendingUp, Star, Calendar } from "lucide-react";

export interface TrendingItem {
  id: number;
  title: string;
  description: string;
  image: string;
  rating?: number;
  date?: string;
  media_type?: string;
}

interface TrendingSectionProps {
  items: TrendingItem[];
}

export function TrendingSection({ items }: TrendingSectionProps) {
  if (!items || items.length === 0) return null;

  // Take top 3 items for the layout
  const mainFeature = items[0];
  const sideFeatures = items.slice(1, 3);

  return (
    <section className="py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative container mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-1.5 h-10 bg-gradient-to-b from-accent to-red-600 rounded-full shadow-[0_0_15px_rgba(255,0,0,0.5)]"></div>
          <div>
            <h2 className="text-3xl md:text-4xl font-black text-white flex items-center gap-3">
              Trending Now{" "}
              <TrendingUp className="w-8 h-8 text-accent animate-pulse" />
            </h2>
            <p className="text-gray-400 text-sm md:text-base mt-1">
              Movies & Shows everyone is talking about
            </p>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 auto-rows-[minmax(200px,auto)]">
          {/* Main Feature Card (Large) */}
          <Link
            to={`/${mainFeature.media_type || "movie"}/${mainFeature.id}`}
            className="md:col-span-2 relative group rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-accent/20 h-[300px] md:h-[400px] lg:h-[500px]"
          >
            <img
              src={mainFeature.image || "/placeholder.svg"}
              alt={mainFeature.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center z-20">
              <div className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center transform scale-50 group-hover:scale-100 transition-all duration-500 shadow-[0_0_50px_rgba(255,255,255,0.2)] hover:scale-110">
                <Play className="w-10 h-10 ml-1 fill-current" />
              </div>
            </div>

            <div className="absolute top-4 left-4 z-20">
              <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                #1 Trending
              </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 z-20 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
              <h3 className="text-2xl md:text-5xl font-black text-white mb-2 md:mb-3 drop-shadow-xl leading-tight">
                {mainFeature.title}
              </h3>
              <p className="text-gray-300 line-clamp-2 md:line-clamp-3 mb-3 md:mb-4 max-w-2xl text-xs md:text-lg font-medium drop-shadow-md">
                {mainFeature.description}
              </p>
              <div className="flex items-center gap-4 text-xs md:text-sm font-semibold text-gray-200">
                {mainFeature.rating && (
                  <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-md">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />{" "}
                    {mainFeature.rating.toFixed(1)}
                  </span>
                )}
                {mainFeature.date && (
                  <span className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-md">
                    <Calendar className="w-4 h-4 text-gray-400" />{" "}
                    {new Date(mainFeature.date).getFullYear()}
                  </span>
                )}
              </div>
            </div>
          </Link>

          {/* Side Stack (2 Smaller Cards) */}
          <div className="grid grid-cols-1 gap-4 md:gap-6 md:col-span-2 lg:col-span-1 lg:flex lg:flex-col">
            {sideFeatures.map((item, index) => (
              <Link
                to={`/${item.media_type || "movie"}/${item.id}`}
                key={item.id}
                className="relative flex-1 rounded-2xl overflow-hidden group shadow-lg cursor-pointer h-[200px] md:h-[240px] lg:h-auto"
              >
                <img
                  src={item.image || "/placeholder.svg"}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute top-3 left-3 z-20">
                  <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    Top {index + 2}
                  </span>
                </div>

                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                  <Play className="w-10 h-10 text-white drop-shadow-lg" />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5 z-20">
                  <h3 className="text-lg md:text-xl font-bold text-white mb-1 line-clamp-1 group-hover:text-accent transition-colors">
                    {item.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-300">
                    {item.rating && (
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />{" "}
                        {item.rating.toFixed(1)}
                      </span>
                    )}
                    {item.date && (
                      <span>{new Date(item.date).getFullYear()}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
