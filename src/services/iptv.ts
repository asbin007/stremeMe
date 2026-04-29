export interface Channel {
  name: string;
  logo: string;
  group: string;
  url: string;
}

const parseM3U = (data: string): Channel[] => {
  const lines = data.split('\n');
  const channels: Channel[] = [];
  let currentChannel: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('#EXTINF:')) {
      const logoMatch = line.match(/tvg-logo="([^"]+)"/);
      if (logoMatch) currentChannel.logo = logoMatch[1];

      const groupMatch = line.match(/group-title="([^"]+)"/);
      if (groupMatch) currentChannel.group = groupMatch[1];

      const nameParts = line.split(',');
      if (nameParts.length > 1) {
        currentChannel.name = nameParts[nameParts.length - 1].trim();
      }
    } else if (line && !line.startsWith('#')) {
      currentChannel.url = line;
      
      if (currentChannel.name && currentChannel.url) {
        channels.push({
          name: currentChannel.name,
          logo: currentChannel.logo || "",
          group: currentChannel.group || "Uncategorized",
          url: currentChannel.url,
        });
      }
      currentChannel = {}; 
    }
  }

  // Remove duplicates and empty urls
  return Array.from(new Map(channels.map(c => [c.name, c])).values())
      .filter(c => c.url && c.url.trim() !== "");
};

const DEFAULT_API = (import.meta.env.VITE_IPTV_API || 'http://localhost:3001').replace(/\/$/, '');

export const iptvService = {
  getChannels: async (playlistUrl?: string): Promise<Channel[]> => {
    // Prefer backend API for fast responses
    try {
      const url = `${DEFAULT_API}/channels?limit=5000`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        // API returns { count, channels }
        if (json && Array.isArray(json.channels)) return json.channels as Channel[];
      }
    } catch (err) {
      // fall through to M3U parsing fallback
      console.warn('Failed to fetch from IPTV API, falling back to M3U fetch', err);
    }

    // Fallback: fetch raw M3U
    if (playlistUrl) {
      try {
        const response = await fetch(playlistUrl);
        const text = await response.text();
        return parseM3U(text);
      } catch (error) {
        console.error('Failed to fetch IPTV playlist fallback:', error);
        throw error;
      }
    }

    return [];
  }
};
