import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SEOHead } from "../components/SEOHead";
import { generateBreadcrumbSchema } from "../utils/seoUtils";
import { motion } from "framer-motion";
import { Play, Info, Star, Clock, Calendar, ChevronLeft } from "lucide-react";
import { tmdbService, getImageUrl, MAX_BACKDROP_SIZE } from "../services/tmdb";
import Button from "../components/Button";
import { slugify } from "../utils/slug";
import { useDispatch, useSelector } from "react-redux";
import { addToHistory } from "../store/userSlice";
import type { AppDispatch, RootState } from "../store/store";
import { getMediaTitle } from "../types/media";
import { SITE_URL } from "../const";
import type { Genre, MediaItem } from "../types/media";
import type { MovieDetails, TVShowDetails } from "../services/tmdb";

/**
 * Either detail shape can back this page; the slug decides which at runtime.
 *
 * Modelled as the merged-and-optional shape rather than a bare union, because
 * the markup reads `title`/`name` and `runtime`/`number_of_seasons` side by
 * side and guards each one — a union would require narrowing at every access.
 */
type WatchableDetails = Partial<MovieDetails> &
  Partial<TVShowDetails> & { id: number };

const Watch: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [content, setContent] = useState<WatchableDetails | null>(null);
  const [mediaType, setMediaType] = useState<"movie" | "tv">("movie");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      if (!slug) return;

      setLoading(true);
      setError(null);

      try {
        // Convert slug to search query (replace hyphens with spaces)
        const searchQuery = slug.replace(/-/g, " ");

        // Search for the best matching movie or series.
        const results = await tmdbService.searchMulti(searchQuery);
        const found = results.results.find(
          (r: MediaItem) =>
            (r.media_type === "movie" || r.media_type === "tv") &&
            slugify(r.title || r.name || "").includes(slug)
        ) || results.results.find(
          (r: MediaItem) => r.media_type === "movie" || r.media_type === "tv"
        );

        if (found) {
          // Fetch full details
          const resolvedType = found.media_type === "tv" ? "tv" : "movie";
          const details = await tmdbService.getDetails(resolvedType, found.id);
          setMediaType(resolvedType);
          setContent(details as WatchableDetails);

          if (isAuthenticated) {
            const watchTitle = getMediaTitle(details as MediaItem);
            dispatch(addToHistory({
              mediaId: String(details.id),
              mediaType: resolvedType,
              title: watchTitle,
              posterPath: details.poster_path || details.backdrop_path,
              progress: 0,
              duration: resolvedType === "movie" ? (details as MovieDetails).runtime || 120 : 45,
            }));
          }
        } else {
          setError("Title not found");
        }
      } catch {
        setError("Failed to load title");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [dispatch, isAuthenticated, slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-8">
        <div className="container mx-auto px-4">
          <div className="w-full aspect-video bg-secondary/20 rounded-2xl animate-pulse mb-6" />
          <div className="h-8 w-64 bg-secondary/20 rounded-lg animate-pulse mb-4" />
          <div className="h-4 w-full bg-secondary/20 rounded animate-pulse mb-2" />
          <div className="h-4 w-3/4 bg-secondary/20 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl text-white">Title not found</h1>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const title = content.title || content.name || "Untitled";
  const releaseDate = content.release_date || content.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const isMovie = mediaType === "movie";

  // Generate keywords from genres
  const keywords = content.genres?.map((g: Genre) => g.name).join(", ") || "";
  const allKeywords = `${title}, watch ${title} online, ${title} ${isMovie ? "movie" : "series"}, ${keywords}, streaming, AuraScreen`;

  // Schema.org structured data for SEO
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": isMovie ? "Movie" : "TVSeries",
    "name": title,
    "description": content.overview,
    "image": getImageUrl(content.backdrop_path || content.poster_path, MAX_BACKDROP_SIZE),
    "dateCreated": releaseDate,
    "aggregateRating": content.vote_average ? {
      "@type": "AggregateRating",
      "ratingValue": content.vote_average.toFixed(1),
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": "1000"
    } : undefined,
    "genre": content.genres?.map((g: Genre) => g.name) || [],
    "duration": content.runtime ? `PT${content.runtime}M` : undefined,
    "contentUrl": `${SITE_URL}/watch/${slug}`,
    "publisher": {
      "@type": "Organization",
      "name": "AuraScreen",
      "logo": {
        "@type": "ImageObject",
        "url": `${SITE_URL}/logo.svg`
      }
    }
  };

  const watchOgImage = getImageUrl(content.backdrop_path, MAX_BACKDROP_SIZE);
  const breadcrumbs = generateBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: isMovie ? "Movies" : "TV Shows", url: isMovie ? "/movies" : "/tv-shows" },
    { name: title, url: `/watch/${slug}` }
  ]);

  return (
    <>
      <SEOHead
        title={`Watch ${title} Online Free HD`}
        description={content.overview?.slice(0, 155) || `Stream ${title} online for free in high quality HD on AuraScreen.`}
        keywords={allKeywords}
        canonicalUrl={`${SITE_URL}/watch/${slug}`}
        ogImage={watchOgImage ? (watchOgImage.startsWith("http") ? watchOgImage : `https://www.aurascreen.me${watchOgImage}`) : undefined}
        ogType={isMovie ? "video.movie" : "video.tv_show"}
        structuredData={[breadcrumbs]}
      />

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>

      <div className="min-h-screen">
        {/* Hero Section */}
        <div
          className="relative h-[70vh] bg-cover bg-center"
          style={{
            backgroundImage: `url(${getImageUrl(content.backdrop_path, MAX_BACKDROP_SIZE)})`
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-transparent to-transparent" />

          <div className="relative container mx-auto px-4 h-full flex items-end pb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl"
            >
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-300 hover:text-white mb-6 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back</span>
              </button>

              <h1 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white mb-4">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                {(content.vote_average ?? 0) > 0 && (
                  <span className="flex items-center gap-1 bg-accent/20 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{content.vote_average?.toFixed(1)}</span>
                  </span>
                )}
                {year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {year}
                  </span>
                )}
                {(content.runtime ?? 0) > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.floor((content.runtime ?? 0) / 60)}h {(content.runtime ?? 0) % 60}m
                  </span>
                )}
              </div>

              {(content.genres?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {content.genres?.map((genre: Genre) => (
                    <span
                      key={genre.id}
                      className="px-3 py-1 bg-white/10 rounded-full text-sm text-white/80"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              <p className="text-gray-300 text-lg max-w-2xl line-clamp-3">
                {content.overview}
              </p>

              <div className="flex gap-4 mt-8">
                <Button
                  size="lg"
                  onClick={() => navigate(`/${mediaType}/${content.id}`)}
                  className="gap-2 bg-white hover:bg-white/90 text-black"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Now
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2"
                  onClick={() => navigate(`/${mediaType}/${content.id}`)}
                >
                  <Info className="w-5 h-5" />
                  More Info
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Movie Info Section */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl">
            <h2 className="text-2xl font-bold text-white mb-4">Synopsis</h2>
            <p className="text-gray-300 text-lg leading-relaxed">
              {content.overview || "No synopsis available."}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Watch;
