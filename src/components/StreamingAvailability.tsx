import React, { useEffect, useState } from 'react';
import { watchmodeService } from '../services/watchmode';
import type { StreamingSource } from '../services/watchmode';
import { Tv, ExternalLink } from 'lucide-react';

interface StreamingAvailabilityProps {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
}

interface GroupedSources {
  subscription: StreamingSource[];
  free: StreamingSource[];
  rent: StreamingSource[];
  buy: StreamingSource[];
  addon: StreamingSource[];
}

const StreamingAvailability: React.FC<StreamingAvailabilityProps> = ({ tmdbId, mediaType }) => {
  const [sources, setSources] = useState<GroupedSources | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSources = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await watchmodeService.getGroupedSources(tmdbId, mediaType);
        setSources(data);
      } catch (err) {
        console.error('Failed to fetch streaming sources:', err);
        setError('Could not load streaming info');
      } finally {
        setLoading(false);
      }
    };

    fetchSources();
  }, [tmdbId, mediaType]);

  if (loading) {
    return (
      <div className="bg-secondary/20 p-4 rounded-xl border border-white/10 animate-pulse">
        <div className="h-5 w-40 bg-white/10 rounded mb-3" />
        <div className="flex gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 w-24 bg-white/10 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !sources) {
    return null; // Silently fail — don't break the page if Watchmode can't find the title
  }

  const hasAnySources = Object.values(sources).some(arr => arr.length > 0);

  if (!hasAnySources) {
    return null;
  }

  // Remove duplicates by source name within each group
  const dedupe = (arr: StreamingSource[]) => {
    const seen = new Set<string>();
    return arr.filter(s => {
      if (seen.has(s.name)) return false;
      seen.add(s.name);
      return true;
    });
  };

  const renderGroup = (title: string, items: StreamingSource[], color: string) => {
    const unique = dedupe(items);
    if (unique.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className={`text-sm font-semibold mb-2 ${color}`}>{title}</h4>
        <div className="flex flex-wrap gap-2">
          {unique.map((source, idx) => (
            <a
              key={`${source.source_id}-${idx}`}
              href={source.web_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg transition-colors group"
            >
              <span className="text-white text-sm">{source.name}</span>
              {source.price !== null && source.price > 0 && (
                <span className="text-xs text-gray-400">${source.price}</span>
              )}
              <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-accent transition-colors" />
            </a>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-secondary/20 p-5 rounded-xl border border-white/10">
      <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
        <Tv className="w-5 h-5 text-accent" />
        Where to Watch
      </h3>

      {renderGroup('🎬 Streaming (Subscription)', sources.subscription, 'text-green-400')}
      {renderGroup('🆓 Free', sources.free, 'text-blue-400')}
      {renderGroup('📀 Rent', sources.rent, 'text-yellow-400')}
      {renderGroup('🛒 Buy', sources.buy, 'text-orange-400')}
      {renderGroup('➕ Add-on', sources.addon, 'text-purple-400')}
    </div>
  );
};

export default StreamingAvailability;
