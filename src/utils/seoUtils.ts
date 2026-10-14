import { getImageUrl } from "../services/tmdb";
import type { MovieDetails, TVShowDetails } from "../services/tmdb";
import type { CastMember } from "../types/media";

const BASE_URL = "https://www.aurascreen.me";

export interface BreadcrumbItem {
  name: string;
  url: string;
}

/**
  Generates Schema.org WebSite JSON-LD with Sitelinks SearchBox support.
 */
export function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AuraScreen",
    "alternateName": ["AuraScreen TV", "Aura Screen", "aurascreen.me"],
    "url": `${BASE_URL}/`,
    "description": "AuraScreen is the official free streaming platform for movies, TV shows, anime, and live TV in HD.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${BASE_URL}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
}

/**
  Generates Schema.org Organization / Brand JSON-LD.
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AuraScreen",
    "alternateName": ["AuraScreen TV", "Aura Screen", "aurascreen.me"],
    "url": `${BASE_URL}/`,
    "logo": `${BASE_URL}/logo.png`,
    "sameAs": ["https://www.aurascreen.me"]
  };
}

/**
  Generates Schema.org SiteNavigationElement JSON-LD for Google Sitelinks.
 */
export function generateSiteNavigationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": [
      {
        "@type": "SiteNavigationElement",
        "position": 1,
        "name": "Free Movies",
        "url": `${BASE_URL}/movies`
      },
      {
        "@type": "SiteNavigationElement",
        "position": 2,
        "name": "TV Shows",
        "url": `${BASE_URL}/tv-shows`
      },
      {
        "@type": "SiteNavigationElement",
        "position": 3,
        "name": "Anime",
        "url": `${BASE_URL}/anime`
      },
      {
        "@type": "SiteNavigationElement",
        "position": 4,
        "name": "Live TV",
        "url": `${BASE_URL}/live-tv`
      },
      {
        "@type": "SiteNavigationElement",
        "position": 5,
        "name": "Hindi Movies",
        "url": `${BASE_URL}/hindi-movies`
      }
    ]
  };
}

/**
  Generates Schema.org Movie JSON-LD for rich snippets on Google.
 */
export function generateMovieSchema(movie: MovieDetails, cast: CastMember[] = []) {
  const imageUrl = getImageUrl(movie.poster_path || movie.backdrop_path, "w780");
  const movieUrl = `${BASE_URL}/movie/${movie.id}`;

  return {
    "@context": "https://schema.org",
    "@type": "Movie",
    "name": movie.title,
    "description": movie.overview || `Watch ${movie.title} free on AuraScreen.`,
    "image": imageUrl ? (imageUrl.startsWith("http") ? imageUrl : `${BASE_URL}${imageUrl}`) : `${BASE_URL}/logo.png`,
    "datePublished": movie.release_date || undefined,
    "duration": movie.runtime ? `PT${movie.runtime}M` : undefined,
    "aggregateRating": movie.vote_average ? {
      "@type": "AggregateRating",
      "ratingValue": movie.vote_average.toFixed(1),
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": movie.vote_count || 100
    } : undefined,
    "genre": movie.genres?.map(g => g.name),
    "actor": cast.slice(0, 5).map(actor => ({
      "@type": "Person",
      "name": actor.name
    })),
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "potentialAction": {
      "@type": "WatchAction",
      "target": movieUrl
    }
  };
}

/**
  Generates Schema.org TVSeries JSON-LD for rich snippets on Google.
 */
export function generateTVSeriesSchema(show: TVShowDetails, cast: CastMember[] = []) {
  const imageUrl = getImageUrl(show.poster_path || show.backdrop_path, "w780");
  const tvUrl = `${BASE_URL}/tv/${show.id}`;

  return {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    "name": show.name,
    "description": show.overview || `Watch ${show.name} free on AuraScreen.`,
    "image": imageUrl ? (imageUrl.startsWith("http") ? imageUrl : `${BASE_URL}${imageUrl}`) : `${BASE_URL}/logo.png`,
    "startDate": show.first_air_date || undefined,
    "numberOfSeasons": show.number_of_seasons || undefined,
    "numberOfEpisodes": show.number_of_episodes || undefined,
    "aggregateRating": show.vote_average ? {
      "@type": "AggregateRating",
      "ratingValue": show.vote_average.toFixed(1),
      "bestRating": "10",
      "worstRating": "1",
      "ratingCount": show.vote_count || 100
    } : undefined,
    "genre": show.genres?.map(g => g.name),
    "actor": cast.slice(0, 5).map(actor => ({
      "@type": "Person",
      "name": actor.name
    })),
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock"
    },
    "potentialAction": {
      "@type": "WatchAction",
      "target": tvUrl
    }
  };
}

/**
  Schema.org VideoObject for a movie/episode watch page.

  Google uses this for the Video rich result (a thumbnail + play affordance in
  SERP). Movie/TVSeries schema alone does not trigger that card — Google wants
  a VideoObject with contentUrl or embedUrl plus a thumbnail. Runs alongside,
  not instead of, the Movie/TVSeries blocks.
 */
export function generateMovieVideoObject(movie: MovieDetails) {
  const thumb = getImageUrl(movie.backdrop_path || movie.poster_path, "w780");
  const watchUrl = `${BASE_URL}/movie/${movie.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": movie.title,
    "description": movie.overview || `Watch ${movie.title} free on AuraScreen.`,
    "thumbnailUrl": thumb ? (thumb.startsWith("http") ? thumb : `${BASE_URL}${thumb}`) : `${BASE_URL}/logo.png`,
    "uploadDate": movie.release_date || undefined,
    "duration": movie.runtime ? `PT${movie.runtime}M` : undefined,
    "contentUrl": watchUrl,
    "embedUrl": watchUrl,
    "publisher": {
      "@type": "Organization",
      "name": "AuraScreen",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`
      }
    }
  };
}

export function generateTVVideoObject(show: TVShowDetails) {
  const thumb = getImageUrl(show.backdrop_path || show.poster_path, "w780");
  const watchUrl = `${BASE_URL}/tv/${show.id}`;
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": show.name,
    "description": show.overview || `Watch ${show.name} free on AuraScreen.`,
    "thumbnailUrl": thumb ? (thumb.startsWith("http") ? thumb : `${BASE_URL}${thumb}`) : `${BASE_URL}/logo.png`,
    "uploadDate": show.first_air_date || undefined,
    "contentUrl": watchUrl,
    "embedUrl": watchUrl,
    "publisher": {
      "@type": "Organization",
      "name": "AuraScreen",
      "logo": {
        "@type": "ImageObject",
        "url": `${BASE_URL}/logo.png`
      }
    }
  };
}

/**
  Schema.org ItemList — turns a category page's top items into a Google
  carousel rich result. Pass the first 10-20 items; name/url minimum, image
  if available. Position is 1-based.
 */
export function generateItemListSchema(
  listName: string,
  items: { name: string; url: string; image?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": listName,
    "itemListElement": items.slice(0, 20).map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "url": item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`,
      "name": item.name,
      ...(item.image ? { "image": item.image.startsWith("http") ? item.image : `${BASE_URL}${item.image}` } : {}),
    })),
  };
}

/**
  Generates Schema.org BreadcrumbList JSON-LD.
 */
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url.startsWith("http") ? item.url : `${BASE_URL}${item.url}`
    }))
  };
}
