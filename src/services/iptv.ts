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

export const iptvService = {
  getChannels: async (playlistUrl: string = "https://iptv-org.github.io/iptv/index.m3u"): Promise<Channel[]> => {
    try {
      const response = await fetch(playlistUrl);
      const text = await response.text();
      return parseM3U(text);
    } catch (error) {
      console.error("Failed to fetch IPTV playlist:", error);
      throw error;
    }
  }
};
