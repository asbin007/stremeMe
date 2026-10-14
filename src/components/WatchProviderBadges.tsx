import React, { useEffect, useState } from "react";
import { tmdbService } from "../services/tmdb";

type Provider = { provider_id: number; provider_name: string; logo_path: string };

interface Props {
  mediaType: "movie" | "tv";
  id: number;
  region?: string;
}

// Fetches TMDB /watch/providers for one title and renders the streamable
// provider logos. Covers flatrate (subscription) only — rent/buy skipped
// because this app's audience is "watch free online", not "where to buy".
// Fails silent: if TMDB returns no availability for the region, renders
// nothing instead of a layout gap.
const WatchProviderBadges: React.FC<Props> = ({ mediaType, id, region = "US" }) => {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [link, setLink] = useState<string | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    tmdbService
      .getWatchProviders(mediaType, id, region)
      .then((res) => {
        if (cancelled) return;
        setProviders(res.flatrate || []);
        setLink(res.link);
      })
      .catch(() => {});
    return () => { cancelled = true };
  }, [mediaType, id, region]);

  if (!providers.length) return null;

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-xs text-gray-400">Stream on:</span>
      <div className="flex items-center gap-1.5">
        {providers.slice(0, 6).map((p) => {
          const img = (
            <img
              src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
              alt={p.provider_name}
              title={p.provider_name}
              className="h-8 w-8 rounded-md border border-white/10 bg-white/5 object-cover"
              loading="lazy"
              decoding="async"
            />
          );
          return link ? (
            <a key={p.provider_id} href={link} target="_blank" rel="noopener noreferrer" aria-label={`Watch on ${p.provider_name}`}>
              {img}
            </a>
          ) : (
            <span key={p.provider_id}>{img}</span>
          );
        })}
      </div>
    </div>
  );
};

export default WatchProviderBadges;
