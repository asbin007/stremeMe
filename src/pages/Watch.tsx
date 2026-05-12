import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Play, Info, Star, Clock, Calendar, ChevronLeft } from "lucide-react";
import { tmdbService, getImageUrl } from "../services/tmdb";
import Button from "../components/Button";
import { slugify } from "../utils/slug";
import { useDispatch, useSelector } from "react-redux";
import { addToHistory } from "../store/userSlice";
import type { AppDispatch, RootState } from "../store/store";

const Watch: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const [content, setContent] = useState<any>(null);
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
          (r: any) =>
            (r.media_type === "movie" || r.media_type === "tv") &&
            slugify(r.title || r.name || "").includes(slug)
        ) || results.results.find(
          (r: any) => r.media_type === "movie" || r.media_type === "tv"
        );

        if (found) {
          // Fetch full details
          const resolvedType = found.media_type === "tv" ? "tv" : "movie";
          const details = await tmdbService.getDetails(resolvedType, found.id);
          setMediaType(resolvedType);
          setContent(details);

          if (isAuthenticated) {
            const watchTitle = resolvedType === "movie" ? (details as any).title : (details as any).name;
            dispatch(addToHistory({
              mediaId: String(details.id),
              mediaType: resolvedType,
              title: watchTitle,
              posterPath: details.poster_path || details.backdrop_path,
              progress: 0,
              duration: resolvedType === "movie" ? ((details as any).runtime || 120) : 45,
            }));
          }
        } else {
          setError("Title not found");
        }
      } catch (err) {
        setError("Failed to load title");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [dispatch, isAuthenticated, slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
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

  const title = content.title || content.name;
  const releaseDate = content.release_date || content.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  const isMovie = mediaType === "movie";

  // Generate keywords from genres
  const keywords = content.genres?.map((g: any) => g.name).join(", ") || "";
  const allKeywords = `${title}, watch ${title} online, ${title} ${isMovie ? "movie" : "series"}, ${keywords}, streaming, AuraScreen`;

  // Schema.org structured data for SEO
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": isMovie ? "Movie" : "TVSeries",
    "name": title,
    "description": content.overview,
    "image": getImageUrl(content.backdrop_path || content.poster_path, "original"),
    "dateCreated": releaseDate,
    "aggregateRating": content.vote_average ? {
      "@type": "AggregateRating",
      "ratingValue": content.vote_average.toFixed(1),
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": "1000"
    } : undefined,
    "genre": content.genres?.map((g: any) => g.name) || [],
    "duration": content.runtime ? `PT${content.runtime}M` : undefined,
    "contentUrl": `https://yourdomain.com/watch/${slug}`,
    "publisher": {
      "@type": "Organization",
      "name": "AuraScreen",
      "logo": {
        "@type": "ImageObject",
        "url": "https://yourdomain.com/logo.png"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{title} | Watch Online - AuraScreen</title>
        <meta name="description" content={content.overview?.slice(0, 160) || `Watch ${title} online in high quality. Stream your favorite titles on AuraScreen.`} />
        <meta name="keywords" content={allKeywords} />

        {/* Open Graph / Social */}
        <meta property="og:type" content={isMovie ? "video.movie" : "video.tv_show"} />
        <meta property="og:title" content={`${title} | Watch Online - AuraScreen`} />
        <meta property="og:description" content={content.overview?.slice(0, 200) || ""} />
        <meta property="og:image" content={getImageUrl(content.backdrop_path, "original")} />
        <meta property="og:url" content={`https://yourdomain.com/watch/${slug}`} />
        <meta property="og:site_name" content="AuraScreen" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${title} | Watch Online - AuraScreen`} />
        <meta name="twitter:description" content={content.overview?.slice(0, 200) || ""} />
        <meta name="twitter:image" content={getImageUrl(content.backdrop_path, "original")} />

        {/* Canonical URL */}
        <link rel="canonical" href={`https://yourdomain.com/watch/${slug}`} />

        {/* Additional SEO */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="AuraScreen" />
        <meta name="language" content="English" />

        {/* Video metadata */}
        {content.runtime && <meta property="video:duration" content={String(content.runtime * 60)} />}
        {releaseDate && <meta property="video:release_date" content={releaseDate} />}
      </Helmet>

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>

      <div className="min-h-screen">
        {/* Hero Section */}
        <div
          className="relative h-[70vh] bg-cover bg-center"
          style={{
            backgroundImage: `url(${getImageUrl(content.backdrop_path, "original")})`
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

              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                {title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-300 mb-4">
                {content.vote_average > 0 && (
                  <span className="flex items-center gap-1 bg-accent/20 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{content.vote_average.toFixed(1)}</span>
                  </span>
                )}
                {year && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {year}
                  </span>
                )}
                {content.runtime > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {Math.floor(content.runtime / 60)}h {content.runtime % 60}m
                  </span>
                )}
              </div>

              {content.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {content.genres.map((genre: any) => (
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
                  onClick={() => window.open("https://onionclose.com/ec1332j82?key=802db9e0c75cda5eb230f240cd0ed19f", "_blank")}
                  className="gap-2 bg-red-600 hover:bg-red-700 text-white"
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
