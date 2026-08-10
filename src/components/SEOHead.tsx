import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

export interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string | string[];
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: "website" | "video.movie" | "video.tv_show" | "video.other" | "article";
  noindex?: boolean;
  structuredData?: object | object[];
}

const DEFAULT_SITE_TITLE = "AuraScreen — Free Movies, TV Shows, Anime & Live TV Streaming";
const DEFAULT_DESCRIPTION =
  "Watch free movies, TV shows, anime, and live TV online in HD. Stream the latest releases, Bollywood, Hollywood, K-Drama, and more — no signup required.";
const DEFAULT_KEYWORDS =
  "AuraScreen, Aura Screen, AuraScreen TV, Aura Screen TV, aurascreen.me, AuraScreen website, watch AuraScreen, free movies, watch online, stream TV shows, anime streaming, live TV, HD movies";
const BASE_DOMAIN = "https://www.aurascreen.me";
const DEFAULT_IMAGE = `${BASE_DOMAIN}/logo.png`;

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  canonicalUrl,
  ogImage = DEFAULT_IMAGE,
  ogType = "website",
  noindex = false,
  structuredData,
}) => {
  const location = useLocation();

  // Compute canonical URL dynamically using path if not explicitly provided
  const currentCanonical =
    canonicalUrl || `${BASE_DOMAIN}${location.pathname}${location.search ? location.search : ""}`;

  // Ensure title includes brand name without duplication
  const fullTitle = title
    ? title.includes("AuraScreen")
      ? title
      : `${title} | AuraScreen`
    : DEFAULT_SITE_TITLE;

  const sanitizedDescription = description
    ? description.trim().slice(0, 160)
    : DEFAULT_DESCRIPTION;

  const keywordsString = Array.isArray(keywords)
    ? keywords.join(", ")
    : keywords;

  // Prepare structured data scripts array
  const structuredDataList = Array.isArray(structuredData)
    ? structuredData
    : structuredData
    ? [structuredData]
    : [];

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={sanitizedDescription} />
      {keywordsString && <meta name="keywords" content={keywordsString} />}
      <meta
        name="robots"
        content={noindex ? "noindex, nofollow" : "index, follow"}
      />
      <link rel="canonical" href={currentCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentCanonical} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={sanitizedDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="AuraScreen" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentCanonical} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={sanitizedDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data (JSON-LD) */}
      {structuredDataList.map((data, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(data)}
        </script>
      ))}
    </Helmet>
  );
};

export default SEOHead;
