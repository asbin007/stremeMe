import React, { useState, useRef, useEffect } from "react";
import { Server, RefreshCw, Zap, Shield, Download, ChevronRight } from "lucide-react";
import DownloadModal from "./DownloadModal";
import { EMBED_ALLOW } from "../constants/embed";
import { resolvePreferredServerIndex, setPreferredServerId } from "../utils/preferences";

/** How long to wait for a source to load before falling through to the next. */
const SERVER_TIMEOUT_MS = 3000;

interface StreamingPlayerProps {
  mediaType: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
  imdbId?: string;
  title?: string;
}

interface ServerConfig {
  id: string;
  name: string;
  label: string;
  /** A lucide-react icon; only `className` is ever passed. */
  icon: React.FC<{ className?: string }>;
  color: string;
  getUrl: (mediaType: "movie" | "tv", tmdbId: number, season: number, episode: number, imdbId?: string) => string;
}

// Provider pool, ordered by current community-reported reliability (2026).
// Every entry keys off TMDB id, so playback starts without a secondary lookup.
// These are unofficial aggregators and their domains rotate — audit this list
// periodically against each provider's own docs.
const servers: ServerConfig[] = [
  {
    id: "videasy",
    name: "Videasy",
    label: "Fastest",
    icon: Zap,
    color: "text-cyan-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://player.videasy.net/movie/${id}`
        : `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidsrc-cc",
    name: "VidSrc",
    label: "Fast",
    icon: Zap,
    color: "text-green-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.cc/v2/embed/movie/${id}`
        : `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidlink",
    name: "VidLink",
    label: "HD",
    icon: Shield,
    color: "text-blue-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://vidlink.pro/movie/${id}`
        : `https://vidlink.pro/tv/${id}/${s}/${e}`,
  },
  {
    id: "embedsu",
    name: "Embed.su",
    label: "Reliable",
    icon: Shield,
    color: "text-purple-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://embed.su/embed/movie/${id}`
        : `https://embed.su/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "vidfast",
    name: "VidFast",
    label: "4K",
    icon: Server,
    color: "text-yellow-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://vidfast.pro/movie/${id}`
        : `https://vidfast.pro/tv/${id}/${s}/${e}`,
  },
  {
    id: "autoembed",
    name: "AutoEmbed",
    label: "Backup",
    icon: Server,
    color: "text-orange-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://player.autoembed.cc/embed/movie/${id}`
        : `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "2embed",
    name: "2Embed",
    label: "Alt",
    icon: Server,
    color: "text-pink-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://www.2embed.cc/embed/${id}`
        : `https://www.2embed.cc/embedtv/${id}&s=${s}&e=${e}`,
  },
  {
    id: "vidsrc-to",
    name: "VidSrc.to",
    label: "Legacy",
    icon: Server,
    color: "text-slate-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://vidsrc.to/embed/movie/${id}`
        : `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
];

const StreamingPlayer: React.FC<StreamingPlayerProps> = ({
  mediaType,
  tmdbId,
  season = 1,
  episode = 1,
  imdbId,
  title = "",
}) => {
  // Start on whichever source this viewer last picked by hand. Which source
  // works is a property of the viewer's network and region, not of the title,
  // so re-deriving it from scratch every time made them re-pick constantly.
  const [currentServerIndex, setCurrentServerIndex] = useState(() =>
    resolvePreferredServerIndex(servers)
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showServers, setShowServers] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  /** Identifies the title being played; changing it restarts the fallback. */
  const mediaKey = `${mediaType}:${tmdbId}:${season}:${episode}:${imdbId ?? ""}`;
  const [renderedMediaKey, setRenderedMediaKey] = useState(mediaKey);

  // Reset during render when the title changes. React's documented pattern for
  // deriving state from props, and cheaper than the effect this replaces —
  // that one re-rendered the player twice on every episode change.
  if (mediaKey !== renderedMediaKey) {
    setRenderedMediaKey(mediaKey);
    // Return to the preferred source, not to index 0. Resetting to the first
    // source meant that after settling on one that works for a show, every
    // next episode threw you back to the top of the list.
    setCurrentServerIndex(resolvePreferredServerIndex(servers));
    setIsLoading(true);
  }

  // Derived, not stored: the URL is a pure function of the title and the
  // selected server, so keeping a second copy in state could only drift.
  const streamUrl = servers[currentServerIndex].getUrl(
    mediaType,
    tmdbId,
    season,
    episode,
    imdbId
  );

  /**
   * Falls through the source list while nothing has loaded.
   *
   * One timer per attempt, re-armed by the index change rather than by the
   * callback rescheduling itself. Once `isLoading` goes false — the iframe
   * fired `load`, or the list ran out — the effect stops arming entirely.
   */
  useEffect(() => {
    if (!isLoading) return;

    const isLastServer = currentServerIndex >= servers.length - 1;

    const timer = setTimeout(() => {
      if (isLastServer) {
        setIsLoading(false);
      } else {
        setCurrentServerIndex(index => index + 1);
      }
    }, SERVER_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [mediaKey, isLoading, currentServerIndex]);

  // The iframe loaded, so stop cycling through sources.
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Manual server switch. The URL follows from the index, so there is nothing
  // else to set here. Only a deliberate choice is remembered — the automatic
  // fallback below must not overwrite the viewer's pick with whatever source
  // happened to answer first.
  const handleServerSwitch = (index: number) => {
    setCurrentServerIndex(index);
    setPreferredServerId(servers[index].id);
    setIsLoading(true);
    setShowServers(false);
  };

  const currentServer = servers[currentServerIndex];

  return (
    <div className="space-y-3">
      {/* Player Container */}
      <div className="relative w-full pt-[56.25%] bg-black rounded-xl overflow-hidden ring-1 ring-white/10" id="player-container">
        {streamUrl && (
          <iframe
            ref={iframeRef}
            src={streamUrl}
            className="absolute top-0 left-0 w-full h-full border-0"
            style={{ border: 0 }}
            allowFullScreen={true}
            /*
             * No `sandbox` here, deliberately.
             *
             * Sandboxing this iframe is the only way to stop these providers
             * opening pop-under ads, and it was applied. Testing against the
             * live embeds showed they refuse to run at all under it: the player
             * replaces itself with "Sandbox Not Supported — contact the website
             * owner to remove the sandbox attribute". They check for the
             * attribute's presence, not for particular permissions, so every
             * token combination fails, including one granting allow-popups.
             *
             * That leaves a straight choice between blocking their ads and
             * playing video at all. Playback wins.
             *
             * `allow` is still trimmed to what playback needs — no
             * clipboard-write, no web-share — and referrerPolicy limits what
             * the provider learns about where the viewer came from. Neither
             * triggers the sandbox check.
             */
            allow={EMBED_ALLOW}
            referrerPolicy="origin"
            title="Streaming Player"
            onLoad={handleIframeLoad}
          />
        )}

        {/* Custom Fullscreen Button — bottom right like native players */}
        <button
          onClick={() => {
            const container = document.getElementById("player-container");
            if (container) {
              if (document.fullscreenElement) {
                document.exitFullscreen();
              } else {
                container.requestFullscreen();
              }
            }
          }}
          className="absolute bottom-3 right-3 z-30 p-2 bg-black/70 hover:bg-white/20 rounded text-white transition-all"
          title="Fullscreen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>
        </button>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
            <div className="w-10 h-10 border-3 border-white/20 border-t-white rounded-full animate-spin" />
            <p className="mt-3 text-white/60 text-xs">
              Loading {currentServer.name}...
            </p>
          </div>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-white/50 text-xs">
            {currentServer.name}
            <span className="text-white/30 ml-1.5">({currentServer.label})</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Download */}
          <button
            onClick={() => setShowDownload(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white text-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Switch Server */}
          <button
            onClick={() => setShowServers(!showServers)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/60 hover:text-white text-xs transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Servers</span>
            <ChevronRight className={`w-3 h-3 transition-transform ${showServers ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Server Grid */}
      {showServers && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-1.5 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
          {servers.map((srv, idx) => (
            <button
              key={srv.id}
              onClick={() => handleServerSwitch(idx)}
              className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs transition-all ${
                currentServerIndex === idx
                  ? "bg-white text-black font-medium"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <srv.icon className={`w-3.5 h-3.5 ${currentServerIndex === idx ? 'text-black' : srv.color}`} />
              <div className="text-left">
                <div className="font-medium">{srv.name}</div>
                <div className={`text-[10px] ${currentServerIndex === idx ? 'text-black/60' : 'text-white/30'}`}>
                  {srv.label}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Download Modal */}
      <DownloadModal
        isOpen={showDownload}
        onClose={() => setShowDownload(false)}
        mediaType={mediaType}
        title={title}
        imdbId={imdbId}
        tmdbId={tmdbId}
        season={season}
        episode={episode}
      />
    </div>
  );
};

export default StreamingPlayer;
