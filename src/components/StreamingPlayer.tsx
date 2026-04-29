import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Server, RefreshCw, Zap, Shield, Download } from "lucide-react";
import DownloadModal from "./DownloadModal";

interface StreamingPlayerProps {
  mediaType: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
  imdbId?: string;
  title?: string;
}

const StreamingPlayer: React.FC<StreamingPlayerProps> = ({
  mediaType,
  tmdbId,
  season = 1,
  episode = 1,
  imdbId,
  title = "",
}) => {
  const [server, setServer] = useState("vidfast");
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [showServerMenu, setShowServerMenu] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const servers = [
    {
      id: "vidfast",
      name: "VidFast",
      label: "Fastest",
      icon: Zap,
      color: "text-yellow-400",
    },
    {
      id: "godrive",
      name: "GoDrive",
      label: "HD",
      icon: Shield,
      color: "text-blue-400",
    },
    {
      id: "vsrc",
      name: "VidSrc",
      label: "Primary",
      icon: Server,
      color: "text-green-400",
    },
    {
      id: "vidsrc_to",
      name: "VidSrc.to",
      label: "Reliable",
      icon: Server,
      color: "text-purple-400",
    },
    {
      id: "vidlink",
      name: "VidLink",
      label: "Alternative",
      icon: Server,
      color: "text-orange-400",
    },
    {
      id: "superembed",
      name: "SuperEmbed",
      label: "Stable",
      icon: Server,
      color: "text-pink-400",
    },
    {
      id: "vidbinge",
      name: "VidBinge",
      label: "Backup",
      icon: Server,
      color: "text-cyan-400",
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowServerMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const getUrl = () => {
      let url = "";
      switch (server) {
        case "vidfast":
          if (mediaType === "movie") {
            url = `https://vidfast.pro/movie/${tmdbId}?theme=16A085`;
          } else {
            url = `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}?nextButton=true&autoNext=true`;
          }
          break;

        case "godrive":
          if (imdbId) {
            if (mediaType === "movie") {
              url = `https://godriveplayer.com/player.php?imdb=${imdbId}`;
            } else {
              url = `https://godriveplayer.com/player.php?imdb=${imdbId}&season=${season}&episode=${episode}`;
            }
          } else {
            url = `https://godriveplayer.com/player.php?tmdb=${tmdbId}`;
            if (mediaType === "tv") {
              url += `&season=${season}&episode=${episode}`;
            }
          }
          break;

        case "vsrc":
          if (mediaType === "movie") {
            url = `https://vsrc.su/embed/movie/${tmdbId}`;
          } else {
            url = `https://vsrc.su/embed/tv/${tmdbId}/${season}/${episode}`;
          }
          break;

        case "vidsrc_to":
          if (mediaType === "movie") {
            url = `https://vidsrc.to/embed/movie/${tmdbId}`;
          } else {
            url = `https://vidsrc.to/embed/tv/${tmdbId}/${season}/${episode}`;
          }
          break;

        case "vidlink":
          if (mediaType === "movie") {
            url = `https://vidlink.pro/movie/${tmdbId}`;
          } else {
            url = `https://vidlink.pro/tv/${tmdbId}/${season}/${episode}`;
          }
          break;

        case "superembed":
          if (mediaType === "movie") {
            url = `https://superembed.stream/e.php?id=${tmdbId}&tmdb=1`;
          } else {
            url = `https://superembed.stream/e.php?id=${tmdbId}&tmdb=1&season=${season}&episode=${episode}`;
          }
          break;

        case "vidbinge":
          if (mediaType === "movie") {
            url = `https://vidbinge.com/embed/movie/${tmdbId}`;
          } else {
            url = `https://vidbinge.com/embed/tv/${tmdbId}/${season}/${episode}`;
          }
          break;

        default:
          if (mediaType === "movie") {
            url = `https://vidfast.pro/movie/${tmdbId}?theme=16A085`;
          } else {
            url = `https://vidfast.pro/tv/${tmdbId}/${season}/${episode}?nextButton=true&autoNext=true`;
          }
          break;
      }
      setStreamUrl(url);
    };

    getUrl();
  }, [mediaType, tmdbId, season, episode, server, imdbId]);

  useEffect(() => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src =
      "https://pl28209844.profitablecpmratenetwork.com/b9/71/73/b9717300297046b402f79fb665d71da6.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleAutoSwitch = () => {
    const currentIndex = servers.findIndex((s) => s.id === server);
    const nextIndex = (currentIndex + 1) % servers.length;
    setServer(servers[nextIndex].id);
  };

  const currentServer = servers.find((s) => s.id === server) || servers[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-1 h-8 bg-red-600 rounded-full"></div>
          <h3 className="text-xl font-bold text-white tracking-wide">
            Streaming Server
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Download Button */}
          <button
            type="button"
            onClick={() => setShowDownload(true)}
            className="group flex items-center gap-2 px-4 py-2.5 bg-accent/20 hover:bg-accent/30 text-accent rounded-xl transition-all duration-300 border border-accent/30 hover:border-accent/50"
          >
            <Download className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-300" />
            <span className="text-sm font-medium">Download</span>
          </button>

          {/* Auto Switch Button */}
          <button
            type="button"
            onClick={handleAutoSwitch}
            className="group flex items-center gap-2 px-4 py-2.5 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl transition-all duration-300 border border-white/5 hover:border-white/10"
          >
            <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            <span className="text-sm font-medium">Auto Switch</span>
          </button>

          {/* Custom Server Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowServerMenu(!showServerMenu)}
              className="flex items-center gap-3 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-xl transition-all min-w-[200px] justify-between group"
            >
              <div className="flex items-center gap-2">
                <currentServer.icon
                  className={`w-4 h-4 ${currentServer.color}`}
                />
                <span className="font-medium text-sm">
                  {currentServer.name}
                </span>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">
                  {currentServer.label}
                </span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
                  showServerMenu ? "rotate-180" : ""
                }`}
              />
            </button>

            {showServerMenu && (
              <div className="absolute right-0 mt-2 w-[240px] bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200">
                <div className="space-y-0.5">
                  {servers.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setServer(s.id);
                        setShowServerMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all group ${
                        server === s.id
                          ? "bg-zinc-800 text-white"
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-white"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <s.icon className={`w-4 h-4 ${s.color}`} />
                        <span className="font-medium">{s.name}</span>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${
                          server === s.id
                            ? "bg-black/30 border-white/10 text-white"
                            : "bg-zinc-800/50 border-transparent text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-400"
                        }`}
                      >
                        {s.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative w-full pt-[56.25%] bg-black rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
        {streamUrl ? (
          <iframe
            src={streamUrl}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allowFullScreen
            allow="encrypted-media; autoplay; picture-in-picture; fullscreen"
            referrerPolicy="origin"
            title="Streaming Player"
          ></iframe>
        ) : (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-4 bg-zinc-900/50">
            <div className="w-12 h-12 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-sm font-medium animate-pulse">
              Initializing Secure Stream...
            </p>
          </div>
        )}
      </div>

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
