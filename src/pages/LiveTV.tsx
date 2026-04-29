import React, { useState, useEffect, useMemo } from "react";
import HlsPlayer from "../components/HlsPlayer";
import { Search, Tv, Play, Globe, MapPin, MonitorPlay, Film, Radio, Music, Baby } from "lucide-react";
import { iptvService, type Channel } from "../services/iptv";
import { motion, AnimatePresence } from "framer-motion";
import { LiveTVSkeleton } from "../components/Skeleton";

const PLAYLISTS = [
  { id: "all", label: "Global", icon: Globe, url: "https://iptv-org.github.io/iptv/index.m3u" },
  { id: "in", label: "India", icon: MapPin, url: "https://iptv-org.github.io/iptv/countries/in.m3u" },
  { id: "np", label: "Nepal", icon: MapPin, url: "https://iptv-org.github.io/iptv/countries/np.m3u" },
  { id: "us", label: "USA", icon: MapPin, url: "https://iptv-org.github.io/iptv/countries/us.m3u" },
  { id: "uk", label: "UK", icon: MapPin, url: "https://iptv-org.github.io/iptv/countries/uk.m3u" },
  { id: "sports", label: "Sports", icon: MonitorPlay, url: "https://iptv-org.github.io/iptv/categories/sports.m3u" },
  { id: "movies", label: "Movies", icon: Film, url: "https://iptv-org.github.io/iptv/categories/movies.m3u" },
  { id: "news", label: "News", icon: Radio, url: "https://iptv-org.github.io/iptv/categories/news.m3u" },
  { id: "music", label: "Music", icon: Music, url: "https://iptv-org.github.io/iptv/categories/music.m3u" },
  { id: "kids", label: "Kids", icon: Baby, url: "https://iptv-org.github.io/iptv/categories/kids.m3u" }
];

const LiveTV: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [activePlaylist, setActivePlaylist] = useState(PLAYLISTS[0]);

  useEffect(() => {
    const fetchPlaylist = async () => {
      setLoading(true);
      try {
        const uniqueChannels = await iptvService.getChannels(activePlaylist.url);
        setChannels(uniqueChannels);
        if (uniqueChannels.length > 0) {
          setSelectedChannel(uniqueChannels[0]);
        } else {
          setSelectedChannel(null);
        }
      } catch (error) {
        console.error("Failed to load IPTV playlist:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylist();
  }, [activePlaylist]);

  const filteredChannels = useMemo(() => {
    return channels.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.group.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [channels, searchQuery]);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Tv className="w-8 h-8 text-accent" />
            Live TV
          </h1>
          <p className="text-gray-400">Stream free IPTV channels from around the world.</p>
        </div>
        
        <div className="flex flex-col gap-4 w-full md:w-auto">
          {/* Quick Filters */}
          <div className="flex flex-nowrap md:flex-wrap gap-2 max-w-3xl justify-start md:justify-end overflow-x-auto pb-2 md:pb-0 hide-scrollbar items-center">
            {PLAYLISTS.map((playlist) => {
              const Icon = playlist.icon;
              return (
                <button
                  key={playlist.id}
                  onClick={() => setActivePlaylist(playlist)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex-shrink-0 ${
                    activePlaylist.id === playlist.id
                      ? "bg-accent text-black shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-105"
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
            <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
            <input
              type="text"
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full bg-black/50 border border-white/10 rounded-full py-3 pl-12 pr-4 text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all placeholder:text-gray-500 backdrop-blur-sm"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-accent transition-colors" />
          </div>
        </div>
      </div>

      {loading ? (
        <LiveTVSkeleton />
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 h-[80vh] min-h-[600px]">
          {/* Player Section */}
          <div className="w-full lg:w-2/3 flex flex-col h-full">
            <div className="relative w-full pt-[56.25%] overflow-hidden rounded-3xl bg-black shadow-[0_0_40px_rgba(0,0,0,0.8)] border border-white/10 group">
              <div className="absolute inset-0">
                {selectedChannel ? (
                  <HlsPlayer 
                    src={selectedChannel.url} 
                    poster={selectedChannel.logo}
                    autoPlay={true}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gradient-to-br from-black to-secondary/20">
                    <Tv className="w-16 h-16 mb-4 opacity-50" />
                    <p className="text-lg">Select a channel to start watching</p>
                  </div>
                )}
              </div>
            </div>
            
            <AnimatePresence mode="popLayout">
              {selectedChannel && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mt-6 p-6 rounded-3xl bg-gradient-to-r from-secondary/80 to-secondary/40 backdrop-blur-xl border border-white/10 shadow-2xl flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full"></div>
                      {selectedChannel.logo ? (
                        <div className="relative w-20 h-20 bg-white/5 rounded-2xl p-3 border border-white/10 flex items-center justify-center overflow-hidden">
                          <img 
                            src={selectedChannel.logo} 
                            alt={selectedChannel.name} 
                            className="max-w-full max-h-full object-contain drop-shadow-lg" 
                            onError={(e) => (e.currentTarget.style.display = 'none')}
                          />
                        </div>
                      ) : (
                        <div className="relative w-20 h-20 bg-gradient-to-br from-accent/20 to-accent/5 rounded-2xl flex items-center justify-center border border-accent/20">
                          <Tv className="w-10 h-10 text-accent/50" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
                        </span>
                        <span className="text-red-500 font-bold text-xs tracking-widest uppercase">Live</span>
                      </div>
                      <h2 className="text-2xl font-black text-white tracking-tight">{selectedChannel.name}</h2>
                      <span className="inline-block mt-2 px-3 py-1 bg-white/10 text-gray-300 text-xs font-medium rounded-full backdrop-blur-md border border-white/5">
                        {selectedChannel.group}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Channel List Section */}
          <div className="w-full lg:w-1/3 flex flex-col bg-secondary/30 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl h-full pb-0 relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-0"></div>
            
            <div className="relative z-10 p-6 border-b border-white/10 bg-black/40 backdrop-blur-xl flex justify-between items-end">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">Channels</h3>
                <p className="text-sm text-gray-400 mt-1">{filteredChannels.length} available networks</p>
              </div>
              <div className="flex items-center gap-2 text-accent bg-accent/10 px-3 py-1.5 rounded-full border border-accent/20">
                <Radio className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Air</span>
              </div>
            </div>
            
            <div className="relative z-10 flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
              {filteredChannels.map((channel, idx) => {
                const isActive = selectedChannel?.name === channel.name;
                return (
                  <motion.button
                    key={`${channel.name}-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                    onClick={() => setSelectedChannel(channel)}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 group ${
                      isActive 
                        ? "bg-gradient-to-r from-accent/20 to-transparent border border-accent/30 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]" 
                        : "hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <div className={`w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden p-2 flex items-center justify-center transition-colors duration-300 ${
                      isActive ? "bg-black/40" : "bg-black/30 group-hover:bg-black/50"
                    }`}>
                      {channel.logo ? (
                        <img 
                          src={channel.logo} 
                          alt="" 
                          className={`max-w-full max-h-full object-contain transition-transform duration-500 ${isActive ? "scale-110" : "group-hover:scale-110"}`}
                          onError={(e) => (e.currentTarget.style.display = 'none')} 
                        />
                      ) : (
                        <Tv className={`w-6 h-6 ${isActive ? "text-accent" : "text-gray-500"}`} />
                      )}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className={`font-bold truncate text-base transition-colors ${
                        isActive ? "text-accent" : "text-gray-200 group-hover:text-white"
                      }`}>
                        {channel.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-0.5 font-medium">{channel.group}</p>
                    </div>
                    
                    {isActive ? (
                      <div className="pr-2 flex items-center">
                        <div className="flex gap-1 items-end h-4">
                          <motion.div animate={{ height: [4, 16, 8, 16, 4] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 bg-accent rounded-t-sm"></motion.div>
                          <motion.div animate={{ height: [8, 12, 16, 8, 8] }} transition={{ repeat: Infinity, duration: 1.4 }} className="w-1 bg-accent rounded-t-sm"></motion.div>
                          <motion.div animate={{ height: [12, 6, 16, 12, 8] }} transition={{ repeat: Infinity, duration: 1.1 }} className="w-1 bg-accent rounded-t-sm"></motion.div>
                        </div>
                      </div>
                    ) : (
                      <div className="pr-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0">
                        <Play className="w-5 h-5 text-gray-400 fill-gray-400" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
              
              {filteredChannels.length === 0 && (
                <div className="relative z-10 flex flex-col items-center justify-center py-10 text-gray-500 text-sm space-y-3">
                  <MonitorPlay className="w-12 h-12 opacity-30 text-gray-400" />
                  <p>No channels found matching your search.</p>
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
