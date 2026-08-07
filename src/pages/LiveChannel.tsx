import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Play, Info, ChevronLeft, Globe, Tv } from "lucide-react";
import Button from "../components/Button";

interface LiveChannel {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  logo: string;
  genre: string;
  country: string;
}

// Mock live channel data (replace with API in production)
const liveChannels: LiveChannel[] = [
  {
    id: "1",
    name: "Star Sports 1",
    slug: "star-sports-1",
    description: "Premium sports channel featuring cricket, football, and more. Watch live IPL, FIFA World Cup, and exclusive sports content.",
    category: "Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Star_Sports_Logo.svg/200px-Star_Sports_Logo.svg.png",
    genre: "Sports",
    country: "India"
  },
  {
    id: "2",
    name: "Sony Ten 1",
    slug: "sony-ten-1",
    description: "Premier sports broadcasting channel. Live coverage of cricket tournaments, WWE, and international sporting events.",
    category: "Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Sony_Sports_Network_logo.svg/200px-Sony_Sports_Network_logo.svg.png",
    genre: "Sports",
    country: "India"
  },
  {
    id: "3",
    name: "Cricket World",
    slug: "cricket-world",
    description: "Dedicated cricket channel with live matches, highlights, and expert analysis. Coverage of IPL, BBL, ICC tournaments.",
    category: "Sports",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Cricket_World_Cup_2015_logo.svg/200px-Cricket_World_Cup_2015_logo.svg.png",
    genre: "Cricket",
    country: "International"
  },
  {
    id: "4",
    name: "DD National",
    slug: "dd-national",
    description: "India's oldest and most-watched TV channel. News, entertainment, sports, and cultural programming.",
    category: "General",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/DD_National_logo.svg/200px-DD_National_logo.svg.png",
    genre: "General Entertainment",
    country: "India"
  },
  {
    id: "5",
    name: "Star Plus",
    slug: "star-plus",
    description: "Leading Hindi entertainment channel with dramas, reality shows, and blockbuster movies.",
    category: "Entertainment",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/94/Star_Plus_logo.svg/200px-Star_Plus_logo.svg.png",
    genre: "Entertainment",
    country: "India"
  }
];

const LiveChannel: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  // `liveChannels` is a static list, so the match is derived during render.
  // Copying it into state through an effect cost an extra render pass and made
  // the page flash a spinner for a lookup that never touches the network.
  const channel = useMemo(
    () =>
      liveChannels.find(c => c.slug === slug) ??
      (slug === "cricket"
        ? liveChannels.find(c => c.genre.toLowerCase() === "cricket")
        : undefined) ??
      null,
    [slug]
  );

  if (!channel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl text-white">Channel not found</h1>
        <Button onClick={() => navigate("/live-tv")}>Browse Live TV</Button>
      </div>
    );
  }

  // SEO Keywords
  const keywords = `watch ${channel.name} live, ${channel.name} online, ${channel.category}, ${channel.genre}, live TV streaming, ${channel.country} TV channels, AuraScreen live TV`;

  // Schema.org structured data for TVBroadcastService
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "TVBroadcastService",
    "name": channel.name,
    "description": channel.description,
    "broadcastCoverage": {
      "@type": "Place",
      "name": channel.country
    },
    "genre": channel.genre,
    "category": channel.category,
    "url": `https://yourdomain.com/live/${slug}`,
    "provider": {
      "@type": "Organization",
      "name": "AuraScreen"
    }
  };

  return (
    <>
      <Helmet>
        <title>Watch {channel.name} Live | Live TV Streaming - AuraScreen</title>
        <meta name="description" content={channel.description} />
        <meta name="keywords" content={keywords} />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={`${channel.name} | Live TV - AuraScreen`} />
        <meta property="og:description" content={channel.description} />
        <meta property="og:url" content={`https://yourdomain.com/live/${slug}`} />
        <meta property="og:site_name" content="AuraScreen" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={`${channel.name} | Live TV - AuraScreen`} />
        <meta name="twitter:description" content={channel.description} />

        {/* Canonical */}
        <link rel="canonical" href={`https://yourdomain.com/live/${slug}`} />

        {/* SEO */}
        <meta name="robots" content="index, follow" />
      </Helmet>

      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>

      <div className="min-h-screen">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary via-primary to-gray-900 py-20">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto text-center"
            >
              <button
                onClick={() => navigate("/live-tv")}
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to Live TV</span>
              </button>

              <div className="w-32 h-32 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center p-4">
                {channel.logo ? (
                  <img src={channel.logo} alt={channel.name} className="w-full h-full object-contain" />
                ) : (
                  <Tv className="w-16 h-16 text-accent" />
                )}
              </div>

              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="px-3 py-1 bg-accent/20 text-accent rounded-full text-sm">
                  LIVE
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">{channel.category}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                {channel.name}
              </h1>

              <div className="flex items-center justify-center gap-4 text-gray-400 mb-6">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {channel.country}
                </span>
                <span>•</span>
                <span>{channel.genre}</span>
              </div>

              <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
                {channel.description}
              </p>

              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  onClick={() => window.open("https://onionclose.com/ec1332j82?key=802db9e0c75cda5eb230f240cd0ed19f", "_blank")}
                  className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Watch Live
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  className="gap-2"
                >
                  <Info className="w-5 h-5" />
                  Channel Info
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Channel Details */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6">About {channel.name}</h2>
            <div className="bg-white/5 rounded-xl p-6">
              <p className="text-gray-300 leading-relaxed">
                {channel.description}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-6 pt-6 border-t border-white/10">
                <div>
                  <span className="text-gray-500 text-sm">Category</span>
                  <p className="text-white font-medium">{channel.category}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Genre</span>
                  <p className="text-white font-medium">{channel.genre}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Country</span>
                  <p className="text-white font-medium">{channel.country}</p>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Type</span>
                  <p className="text-white font-medium">Live TV</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LiveChannel;
