import React from "react";

interface StreamingPlayerProps {
  mediaType: "movie" | "tv";
  tmdbId: number;
  season?: number;
  episode?: number;
  imdbId?: string;
}

const StreamingPlayer: React.FC<StreamingPlayerProps> = ({
  mediaType,
  tmdbId,
  season = 1,
  episode = 1,
  imdbId,
}) => {
  const [server, setServer] = React.useState("vidfast");
  const [streamUrl, setStreamUrl] = React.useState<string | null>(null);

  const servers = [
    { id: "vidfast", name: "VidFast (Fastest)" },
    { id: "godrive", name: "GoDrive (HD)" },
    { id: "vsrc", name: "VidSrc (Primary)" },
    { id: "vidsrc_to", name: "VidSrc.to" },
    { id: "vidlink", name: "VidLink" },
    { id: "superembed", name: "SuperEmbed" },
    { id: "vidbinge", name: "VidBinge" },
  ];

  React.useEffect(() => {
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
            // Fallback if no IMDB ID (GoDrive might not work without it, or we could try TMDB if supported)
            // For now, let's try passing TMDB ID if they support it, or just show error/empty
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

  const handleAutoSwitch = () => {
    const currentIndex = servers.findIndex((s) => s.id === server);
    const nextIndex = (currentIndex + 1) % servers.length;
    setServer(servers[nextIndex].id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-white">Streaming Server</h3>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={handleAutoSwitch}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-500 rounded-lg transition-colors text-sm font-medium border border-red-600/20"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
              <path d="M16 16h5v5" />
            </svg>
            Not Working? Auto-Switch
          </button>
          <select
            value={server}
            onChange={(e) => setServer(e.target.value)}
            className="bg-white/10 border border-white/20 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            {servers.map((s) => (
              <option
                key={s.id}
                value={s.id}
                className="bg-gray-900 text-white"
              >
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="relative w-full pt-[56.25%] bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
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
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-white/50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StreamingPlayer;
