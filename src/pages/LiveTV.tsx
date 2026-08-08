import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import HlsPlayer from "../components/HlsPlayer";
import {
  Search, Tv, Play, Globe, MapPin, MonitorPlay, Film, Radio, Music, Baby,
  AlertTriangle, RotateCw, ShieldAlert,
} from "lucide-react";
import { iptvService, PLAYLISTS, type Channel } from "../services/iptv";
import { motion } from "framer-motion";
import { LiveTVSkeleton } from "../components/Skeleton";
import ShareButton from "../components/ShareButton";

const PLAYLIST_ICONS: Record<string, React.ElementType> = {
  in: MapPin, np: MapPin, us: MapPin, uk: MapPin,
  sports: MonitorPlay, movies: Film, news: Radio, music: Music, baby: Baby,
  kids: Baby, all: Globe,
};

/**
 * The Global playlist carries well over 10,000 channels. Rendering them all at
 * once — each an animated Framer Motion button with a remote logo — locked the
 * tab for several seconds. Rows are revealed in blocks as the user scrolls.
 */
const PAGE_SIZE = 60;

const LiveTV: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const playlistId = searchParams.get("list") ?? PLAYLISTS[0].id;
  const activePlaylist =
    PLAYLISTS.find(p => p.id === playlistId) ?? PLAYLISTS[0];
  const channelSlug = searchParams.get("ch");

  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Load the selected playlist. The previous version had no cancellation, so
  // switching tabs quickly let a slow earlier response land last and overwrite
  // the list with channels from a playlist no longer selected.
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await iptvService.getChannels(
          activePlaylist.url,
          controller.signal
        );
        if (controller.signal.aborted) return;

        setChannels(result);
        setVisibleCount(PAGE_SIZE);
      } catch (e) {
        if (controller.signal.aborted) return;
        console.error("Failed to load IPTV playlist:", e);
        setError(
          "Could not load this playlist. The channel source may be temporarily unavailable."
        );
        setChannels([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [activePlaylist.url]);

  // Pick up the channel named in the URL so links are shareable, falling back
  // to the first playable channel in the list.
  useEffect(() => {
    if (channels.length === 0) return;

    const fromUrl = channelSlug
      ? channels.find(c => c.slug === channelSlug)
      : undefined;

    if (fromUrl) {
      setSelectedChannel(fromUrl);
      return;
    }

    setSelectedChannel(prev => {
      if (prev && channels.some(c => c.slug === prev.slug)) return prev;
      return channels.find(c => !c.insecure) ?? channels[0];
    });
  }, [channels, channelSlug]);

  const filteredChannels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return channels;

    return channels.filter(
      c =>
        c.name.toLowerCase().includes(query) ||
        c.group.toLowerCase().includes(query)
    );
  }, [channels, searchQuery]);

  // Reset the window whenever the result set changes, or a search would start
  // scrolled into the middle of the previous list.
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    listRef.current?.scrollTo({ top: 0 });
  }, [searchQuery, activePlaylist.id]);

  const visibleChannels = useMemo(
    () => filteredChannels.slice(0, visibleCount),
    [filteredChannels, visibleCount]
  );

  const hasMore = visibleCount < filteredChannels.length;

  // Reveal the next block when the sentinel scrolls into the list viewport.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount(c => c + PAGE_SIZE);
        }
      },
      { root: listRef.current, rootMargin: "200px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, visibleChannels.length]);

  const selectChannel = useCallback(
    (channel: Channel) => {
      setSelectedChannel(channel);
      // Writing the channel into the URL makes the player state shareable and
      // survives a refresh.
      const next = new URLSearchParams(searchParams);
      next.set("list", activePlaylist.id);
      next.set("ch", channel.slug);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams, activePlaylist.id]
  );

  const selectPlaylist = useCallback(
    (id: string) => {
      const next = new URLSearchParams(searchParams);
      next.set("list", id);
      next.delete("ch");
      setSearchParams(next, { replace: true });
      setSearchQuery("");
    },
    [searchParams, setSearchParams]
  );

  return (
    <div className="container mx-auto px-4 py-8 pt-20 md:pt-8">
      <Helmet>
        <title>
          {selectedChannel
            ? `Watch ${selectedChannel.name} Live — AuraScreen`
            : "Live TV — Free IPTV Channels | AuraScreen"}
        </title>
        <meta
          name="description"
          content="Watch free live TV channels from around the world — news, sports, movies, music and kids channels streaming in your browser."
        />
      </Helmet>

      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Tv className="w-8 h-8 text-accent" />
            Live TV
          </h1>
          <p className="text-text-muted">Stream free IPTV channels from around the world.</p>
        </div>

        <div className="flex flex-col gap-4 w-full md:w-auto">
          {/* Playlist filters */}
          <div
            role="tablist"
            aria-label="Channel playlists"
            className="flex flex-nowrap md:flex-wrap gap-2 max-w-3xl justify-start md:justify-end overflow-x-auto pb-2 md:pb-0 scrollbar-hide items-center"
          >
            {PLAYLISTS.map(playlist => {
              const Icon = PLAYLIST_ICONS[playlist.id] ?? Globe;
              const isActive = activePlaylist.id === playlist.id;
              return (
                <button
                  key={playlist.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => selectPlaylist(playlist.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 shrink-0 ${
                    isActive
                      ? "bg-accent text-black shadow-[0_0_15px_rgba(6,182,212,0.4)] scale-105"
                      : "bg-secondary text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {playlist.label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <label htmlFor="channel-search" className="sr-only">
              Search channels
            </label>
            <input
              id="channel-search"
              type="search"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="relative w-full bg-black/50 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-gray-500 backdrop-blur-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent transition-colors pointer-events-none" />
          </div>
        </div>
      </div>

      {loading ? (
        <LiveTVSkeleton />
      ) : error ? (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-4 rounded-3xl border border-white/10 bg-secondary/30 py-20 text-center"
        >
          <AlertTriangle className="h-12 w-12 text-warning" />
          <p className="max-w-md text-text">{error}</p>
          <button
            onClick={() => selectPlaylist(activePlaylist.id)}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
          >
            <RotateCw className="h-4 w-4" />
            Retry
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 lg:h-[80vh] lg:min-h-[600px]">
          {/* Player */}
          <div className="w-full lg:w-2/3 flex flex-col">
            <div className="relative w-full pt-[56.25%] overflow-hidden rounded-2xl md:rounded-3xl bg-black shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10">
              <div className="absolute inset-0">
                {selectedChannel ? (
                  <HlsPlayer
                    key={selectedChannel.url}
                    src={selectedChannel.url}
                    poster={selectedChannel.logo}
                    label={selectedChannel.name}
                    autoPlay
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-linear-to-br from-black to-secondary/20">
                    <Tv className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg">Select a channel to start watching</p>
                  </div>
                )}
              </div>
            </div>

            {selectedChannel && (
              <div className="mt-6 p-6 rounded-3xl bg-linear-to-r from-secondary/80 to-secondary/40 backdrop-blur-xl border border-white/10 shadow-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full" />
                    {selectedChannel.logo ? (
                      <div className="relative w-20 h-20 bg-white/5 rounded-2xl p-3 border border-white/10 flex items-center justify-center overflow-hidden">
                        <img
                          src={selectedChannel.logo}
                          alt=""
                          loading="lazy"
                          className="max-w-full max-h-full object-contain drop-shadow-lg"
                          onError={e => (e.currentTarget.style.visibility = "hidden")}
                        />
                      </div>
                    ) : (
                      <div className="relative w-20 h-20 bg-linear-to-br from-accent/20 to-accent/5 rounded-2xl flex items-center justify-center border border-accent/20">
                        <Tv className="w-10 h-10 text-accent/50" />
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
                      </span>
                      <span className="text-red-500 font-bold text-xs tracking-widest uppercase">
                        Live
                      </span>
                    </div>

                    <h2 className="text-2xl font-black text-white tracking-tight">
                      {selectedChannel.name}
                    </h2>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="inline-block px-3 py-1 bg-white/10 text-gray-300 text-xs font-medium rounded-full backdrop-blur-md border border-white/5">
                        {selectedChannel.group}
                      </span>
                      {selectedChannel.insecure && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-warning/30 bg-warning/10 px-3 py-1 text-xs font-medium text-warning">
                          <ShieldAlert className="h-3 w-3" />
                          Insecure source
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ShareButton
                  title={`Watch ${selectedChannel.name} live on AuraScreen`}
                  url={`${window.location.origin}/live-tv?list=${activePlaylist.id}&ch=${selectedChannel.slug}`}
                />
              </div>
            )}
          </div>

          {/* Channel list */}
          <div className="w-full lg:w-1/3 flex flex-col bg-secondary/30 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/10 overflow-hidden shadow-2xl max-h-[60vh] lg:max-h-none lg:h-full relative">
            <div className="relative z-10 p-6 border-b border-white/10 bg-black/40 backdrop-blur-xl flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Channels</h3>
                <p className="text-sm text-text-muted mt-1">
                  {filteredChannels.length.toLocaleString()} available
                </p>
              </div>
              <div className="flex items-center gap-2 text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                <Radio className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Air</span>
              </div>
            </div>

            <div
              ref={listRef}
              className="relative z-10 flex-1 overflow-y-auto p-4 space-y-2"
            >
              {visibleChannels.map(channel => {
                const isActive = selectedChannel?.slug === channel.slug;
                return (
                  <button
                    key={channel.slug}
                    onClick={() => selectChannel(channel)}
                    aria-current={isActive ? "true" : undefined}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-colors duration-200 group text-left ${
                      isActive
                        ? "bg-linear-to-r from-accent/20 to-transparent border border-accent/30"
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div
                      className={`w-14 h-14 shrink-0 rounded-xl overflow-hidden p-2 flex items-center justify-center transition-colors duration-200 ${
                        isActive ? "bg-black/40" : "bg-black/30 group-hover:bg-black/50"
                      }`}
                    >
                      {channel.logo ? (
                        <img
                          src={channel.logo}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="max-w-full max-h-full object-contain"
                          onError={e => (e.currentTarget.style.visibility = "hidden")}
                        />
                      ) : (
                        <Tv className={`w-6 h-6 ${isActive ? "text-accent" : "text-gray-500"}`} />
                      )}
                    </div>

                    <div className="flex-1 overflow-hidden">
                      <p
                        className={`font-bold truncate text-base transition-colors ${
                          isActive ? "text-accent" : "text-gray-200 group-hover:text-white"
                        }`}
                      >
                        {channel.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">
                        {channel.group}
                      </p>
                    </div>

                    {isActive ? (
                      <div className="pr-2 flex items-end gap-1 h-4" aria-hidden="true">
                        {[1.2, 1.4, 1.1].map((duration, i) => (
                          <motion.div
                            key={i}
                            animate={{ height: [4, 16, 8, 16, 4] }}
                            transition={{ repeat: Infinity, duration }}
                            className="w-1 bg-accent rounded-t-sm"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="w-5 h-5 text-gray-400 fill-gray-400" />
                      </div>
                    )}
                  </button>
                );
              })}

              {hasMore && <div ref={sentinelRef} className="h-8" />}

              {filteredChannels.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-gray-500 text-sm space-y-3">
                  <MonitorPlay className="w-12 h-12 opacity-30 text-gray-400" />
                  <p>No channels match “{searchQuery}”.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveTV;
