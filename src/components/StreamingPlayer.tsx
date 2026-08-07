import React, { useState, useRef, useEffect } from "react";
import { Server, RefreshCw, Zap, Shield, Download, ChevronRight } from "lucide-react";
import DownloadModal from "./DownloadModal";
import { EMBED_ALLOW, EMBED_SANDBOX } from "../constants/embed";

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

const servers: ServerConfig[] = [
  {
    id: "zxcstream",
    name: "Zxc",
    label: "Fastest",
    icon: Zap,
    color: "text-cyan-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://zxcstream.xyz/player/movie/${id}`
        : `https://zxcstream.xyz/player/tv/${id}/${s}/${e}/en`,
  },
  {
    id: "cinesrc",
    name: "Pro 1",
    label: "Fast",
    icon: Zap,
    color: "text-green-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://cinesrc.st/embed/movie/${id}`
        : `https://cinesrc.st/embed/tv/${id}?s=${s}&e=${e}&color=FF1493&autoplay=true&autonext=true`,
  },
  {
    id: "1embed",
    name: "Pro 3",
    label: "HD",
    icon: Shield,
    color: "text-blue-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://1embed.cc/embed/movie/${id}`
        : `https://1embed.cc/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "movish",
    name: "Pro 2",
    label: "Reliable",
    icon: Shield,
    color: "text-purple-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://movish.net/moviebox-embed/movie/${id}`
        : `https://movish.net/moviebox-embed/tv/${id}/${s}/${e}`,
  },
  {
    id: "cinemaos",
    name: "Pro",
    label: "Multi",
    icon: Server,
    color: "text-yellow-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://cinemaos.tech/player/${id}`
        : `https://cinemaos.tech/tv/watch/${id}?season=${s}&episode=${e}`,
  },
  {
    id: "321movies",
    name: "Cinesrc",
    label: "Backup",
    icon: Server,
    color: "text-orange-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://321movies.xyz/movie/${id}/player`
        : `https://321movies.xyz/tv/${id}/${s}/${e}/player`,
  },
  {
    id: "vidlux",
    name: "Vlux",
    label: "Alt",
    icon: Server,
    color: "text-pink-400",
    getUrl: (type, id, s, e) =>
      type === "movie"
        ? `https://vidlux.xyz/embed/movie/${id}`
        : `https://vidlux.xyz/embed/tv/${id}/${s}/${e}`,
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
  const [currentServerIndex, setCurrentServerIndex] = useState(0);
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
    setCurrentServerIndex(0);
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
  // else to set here.
  const handleServerSwitch = (index: number) => {
    setCurrentServerIndex(index);
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
            // Sandboxed so the provider cannot open pop-under ads or redirect
            // the page. See EMBED_SANDBOX for what is granted and why.
            sandbox={EMBED_SANDBOX}
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
