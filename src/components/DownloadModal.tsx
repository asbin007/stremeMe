import React, { useRef } from "react";
import {
  Download,
  X,
  ExternalLink,
  Tv,
  Film,
  Shield,
  Wifi,
} from "lucide-react";

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaType: "movie" | "tv";
  title: string;
  imdbId?: string;
  tmdbId: number;
  season?: number;
  episode?: number;
}

/* ─── helpers ─────────────────────────────────────────────── */
const enc = (s: string) => encodeURIComponent(s);

const episodeCode = (s: number, e: number) =>
  `S${String(s).padStart(2, "0")}E${String(e).padStart(2, "0")}`;

/* ─── site definitions ────────────────────────────────────── */
interface Site {
  name: string;
  url: string;
  badge: string;
  badgeColor: string;
  borderColor: string;
  bgColor: string;
}

const movieSites = (
  title: string,
  quality: string
): Site[] => {
  const q = quality === "4K" ? "2160p" : quality;
  const query = `${title} ${q}`;

  return [
    {
      name: "1337x",
      url: `https://1337x.to/search/${enc(query)}/1/`,
      badge: "Reliable",
      badgeColor: "text-orange-400",
      borderColor: "border-orange-500/30",
      bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
    },
    {
      name: "TorrentGalaxy",
      url: `https://torrentgalaxy.to/torrents.php?search=${enc(query)}`,
      badge: "Fast",
      badgeColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      bgColor: "bg-cyan-500/10 hover:bg-cyan-500/20",
    },
    {
      name: "KickassTorrents",
      url: `https://kickasstorrents.to/search.php?q=${enc(query)}`,
      badge: "Large DB",
      badgeColor: "text-green-400",
      borderColor: "border-green-500/30",
      bgColor: "bg-green-500/10 hover:bg-green-500/20",
    },
    {
      name: "The Pirate Bay",
      url: `https://thepiratebay.org/search.php?q=${enc(query)}`,
      badge: "Classic",
      badgeColor: "text-blue-400",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    },
    {
      name: "Nyaa (Anime)",
      url: `https://nyaa.si/?f=0&c=1_2&q=${enc(query)}`,
      badge: "Anime",
      badgeColor: "text-pink-400",
      borderColor: "border-pink-500/30",
      bgColor: "bg-pink-500/10 hover:bg-pink-500/20",
    },
  ];
};

const tvSites = (
  title: string,
  season: number,
  episode: number
): Site[] => {
  const ep = episodeCode(season, episode);
  const query = `${title} ${ep}`;

  return [
    {
      name: "EZTV",
      url: `https://eztv.re/search/${enc(title)}`,
      badge: "TV Only",
      badgeColor: "text-blue-400",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    },
    {
      name: "1337x",
      url: `https://1337x.to/search/${enc(query)}/1/`,
      badge: "Reliable",
      badgeColor: "text-orange-400",
      borderColor: "border-orange-500/30",
      bgColor: "bg-orange-500/10 hover:bg-orange-500/20",
    },
    {
      name: "TorrentGalaxy",
      url: `https://torrentgalaxy.to/torrents.php?search=${enc(query)}`,
      badge: "Fast",
      badgeColor: "text-cyan-400",
      borderColor: "border-cyan-500/30",
      bgColor: "bg-cyan-500/10 hover:bg-cyan-500/20",
    },
    {
      name: "KickassTorrents",
      url: `https://kickasstorrents.to/search.php?q=${enc(query)}`,
      badge: "Large DB",
      badgeColor: "text-green-400",
      borderColor: "border-green-500/30",
      bgColor: "bg-green-500/10 hover:bg-green-500/20",
    },
    {
      name: "The Pirate Bay",
      url: `https://thepiratebay.org/search.php?q=${enc(query)}`,
      badge: "Classic",
      badgeColor: "text-blue-400",
      borderColor: "border-blue-500/30",
      bgColor: "bg-blue-500/10 hover:bg-blue-500/20",
    },
  ];
};

/* ─── quality tiers ───────────────────────────────────────── */
const QUALITY_TIERS = [
  {
    label: "720p",
    description: "HD · ~1 GB",
    icon: "📺",
    color: "text-blue-400",
    ring: "ring-blue-400/40",
    bg: "bg-blue-400/10",
    border: "border-blue-400/30",
  },
  {
    label: "1080p",
    description: "Full HD · ~2–4 GB",
    icon: "🎬",
    color: "text-green-400",
    ring: "ring-green-400/40",
    bg: "bg-green-400/10",
    border: "border-green-400/30",
  },
  {
    label: "4K",
    description: "Ultra HD · 10–30 GB",
    icon: "✨",
    color: "text-purple-400",
    ring: "ring-purple-400/40",
    bg: "bg-purple-400/10",
    border: "border-purple-400/30",
  },
];

/* ─── SiteCard ────────────────────────────────────────────── */
const SiteCard: React.FC<{ site: Site }> = ({ site }) => (
  <a
    href={site.url}
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center justify-between px-4 py-3 rounded-xl border ${site.borderColor} ${site.bgColor} transition-all group`}
  >
    <div className="flex items-center gap-3">
      <span className={`font-semibold text-sm ${site.badgeColor}`}>
        {site.name}
      </span>
      <span className="text-gray-600 text-xs">{site.badge}</span>
    </div>
    <ExternalLink
      className={`w-4 h-4 ${site.badgeColor} opacity-50 group-hover:opacity-100 transition-opacity`}
    />
  </a>
);

/* ─── Main Component ──────────────────────────────────────── */
const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  mediaType,
  title,
  season = 1,
  episode = 1,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const [activeQuality, setActiveQuality] = React.useState("1080p");

  if (!isOpen) return null;

  const ep = episodeCode(season, episode);
  const sites =
    mediaType === "movie"
      ? movieSites(title, activeQuality)
      : tvSites(title, season, episode);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[999] flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0,0,0,0.88)",
        backdropFilter: "blur(10px)",
      }}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 shadow-2xl"
        style={{
          background:
            "linear-gradient(160deg, #111118 0%, #1a1a2e 60%, #16213e 100%)",
        }}
      >
        {/* ── Header ── */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between p-5 border-b border-white/10"
          style={{
            background: "rgba(17,17,24,0.97)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
              <Download className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-tight">
                Download
              </h2>
              <p className="text-gray-400 text-xs truncate max-w-[260px]">
                {title}
                {mediaType === "tv" && ` — ${ep}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* ── VPN Notice ── */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
            <Shield className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
            <p className="text-yellow-300/80 text-xs leading-relaxed">
              Some download sites may be blocked in your region. Use a{" "}
              <strong className="text-yellow-300">VPN</strong> (e.g. ProtonVPN,
              Windscribe) to access them.
            </p>
          </div>

          {/* ── Movie: Quality Selector ── */}
          {mediaType === "movie" && (
            <div className="space-y-3">
              <p className="text-gray-400 text-xs font-medium flex items-center gap-2">
                <Film className="w-3.5 h-3.5" /> Select quality
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {QUALITY_TIERS.map((q) => (
                  <button
                    key={q.label}
                    onClick={() => setActiveQuality(q.label)}
                    className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border transition-all ${
                      activeQuality === q.label
                        ? `${q.bg} ${q.border} ring-1 ${q.ring}`
                        : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                  >
                    <span className="text-xl">{q.icon}</span>
                    <span
                      className={`font-bold text-sm ${activeQuality === q.label ? q.color : "text-white"}`}
                    >
                      {q.label}
                    </span>
                    <span className="text-gray-500 text-[10px]">
                      {q.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── TV Show header ── */}
          {mediaType === "tv" && (
            <div className="flex items-center gap-2 py-2">
              <Tv className="w-4 h-4 text-accent" />
              <span className="text-gray-300 text-sm">
                Searching for{" "}
                <span className="text-white font-semibold">{title}</span>{" "}
                <span className="font-mono text-accent bg-accent/10 px-2 py-0.5 rounded-md text-xs">
                  {ep}
                </span>
              </span>
            </div>
          )}

          {/* ── Site List ── */}
          <div className="space-y-2">
            <p className="text-gray-500 text-xs font-medium mb-1">
              {mediaType === "movie"
                ? `${activeQuality} results from:`
                : "Search on:"}
            </p>
            <div className="space-y-2">
              {sites.map((site) => (
                <SiteCard key={site.name} site={site} />
              ))}
            </div>
          </div>

          {/* ── How to use ── */}
          <div className="space-y-2 pt-1 border-t border-white/5">
            <p className="text-gray-500 text-xs font-medium flex items-center gap-1.5">
              <Wifi className="w-3.5 h-3.5" /> How to download
            </p>
            <ol className="text-gray-500 text-xs space-y-1 pl-4 list-decimal leading-relaxed">
              <li>Click any site above (use VPN if blocked)</li>
              <li>
                Find your preferred release, click Download or Get Magnet
              </li>
              <li>
                Open with{" "}
                <a
                  href="https://www.qbittorrent.org/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  qBittorrent
                </a>{" "}
                or similar client
              </li>
            </ol>
          </div>

          {/* ── Disclaimer ── */}
          <p className="text-gray-700 text-[10px] text-center leading-relaxed">
            We do not host any content. All links are to third-party search
            engines. Ensure downloading is legal in your country.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DownloadModal;
