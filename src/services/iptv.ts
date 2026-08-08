export interface Channel {
  /** Stable, URL-safe id derived from the name — used for deep links. */
  slug: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  /** Language/country tag from the playlist, when present. */
  country?: string;
  /**
   * True when the stream is plain HTTP. The site is served over HTTPS, so the
   * browser blocks these as mixed content and the player would sit there
   * black forever. Surfaced in the UI instead of failing silently.
   */
  insecure: boolean;
}

export interface Playlist {
  id: string;
  label: string;
  url: string;
}

export const PLAYLISTS: Playlist[] = [
  { id: "in", label: "India", url: "https://iptv-org.github.io/iptv/countries/in.m3u" },
  { id: "np", label: "Nepal", url: "https://iptv-org.github.io/iptv/countries/np.m3u" },
  { id: "us", label: "USA", url: "https://iptv-org.github.io/iptv/countries/us.m3u" },
  { id: "uk", label: "UK", url: "https://iptv-org.github.io/iptv/countries/uk.m3u" },
  { id: "sports", label: "Sports", url: "https://iptv-org.github.io/iptv/categories/sports.m3u" },
  { id: "movies", label: "Movies", url: "https://iptv-org.github.io/iptv/categories/movies.m3u" },
  { id: "news", label: "News", url: "https://iptv-org.github.io/iptv/categories/news.m3u" },
  { id: "music", label: "Music", url: "https://iptv-org.github.io/iptv/categories/music.m3u" },
  { id: "kids", label: "Kids", url: "https://iptv-org.github.io/iptv/categories/kids.m3u" },
  { id: "all", label: "Global", url: "https://iptv-org.github.io/iptv/index.m3u" },
];

export function slugifyChannel(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function attr(line: string, key: string): string | undefined {
  const match = line.match(new RegExp(`${key}="([^"]*)"`));
  return match?.[1] || undefined;
}

/**
 * Parses an M3U playlist.
 *
 * The previous parser de-duplicated on channel name alone, which silently
 * dropped every regional variant and backup feed that shares a name with
 * another entry — a meaningful slice of the larger playlists. Identity is now
 * the stream URL, so distinct feeds survive and only true repeats collapse.
 */
export function parseM3U(data: string): Channel[] {
  const lines = data.split("\n");
  const channels: Channel[] = [];
  const seenUrls = new Set<string>();
  const usedSlugs = new Set<string>();

  let pending: Partial<Channel> | null = null;

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      const name = line.slice(line.lastIndexOf(",") + 1).trim();
      pending = {
        name,
        logo: attr(line, "tvg-logo") ?? "",
        group: attr(line, "group-title") ?? "Uncategorized",
        country: attr(line, "tvg-country") ?? attr(line, "tvg-language"),
      };
      continue;
    }

    // Directives other than #EXTINF carry no data we use.
    if (line.startsWith("#")) continue;

    if (!pending?.name) {
      pending = null;
      continue;
    }

    const url = line;
    if (!seenUrls.has(url)) {
      seenUrls.add(url);

      // Slugs must be unique to stay addressable; duplicates get a suffix.
      const base = slugifyChannel(pending.name) || "channel";
      let slug = base;
      let n = 2;
      while (usedSlugs.has(slug)) slug = `${base}-${n++}`;
      usedSlugs.add(slug);

      channels.push({
        slug,
        name: pending.name,
        logo: pending.logo ?? "",
        group: pending.group ?? "Uncategorized",
        country: pending.country,
        url,
        insecure: url.startsWith("http://"),
      });
    }

    pending = null;
  }

  return channels;
}

/**
 * Playlists are several megabytes and change rarely, so a fetched playlist is
 * reused for the rest of the session. Switching tabs back and forth used to
 * re-download the whole file every time.
 */
const cache = new Map<string, Channel[]>();

export const iptvService = {
  async getChannels(playlistUrl?: string, signal?: AbortSignal): Promise<Channel[]> {
    if (!playlistUrl) return [];

    const cached = cache.get(playlistUrl);
    if (cached) return cached;

    const response = await fetch(playlistUrl, { signal });
    if (!response.ok) {
      throw new Error(`Playlist request failed (${response.status})`);
    }

    const channels = parseM3U(await response.text());
    cache.set(playlistUrl, channels);
    return channels;
  },

  /** Looks a channel up by slug across every playlist already in cache. */
  findCachedBySlug(slug: string): Channel | null {
    for (const channels of cache.values()) {
      const hit = channels.find(c => c.slug === slug);
      if (hit) return hit;
    }
    return null;
  },

  /**
   * Resolves a slug to a channel, searching cached playlists first and only
   * then going to the network. Used by the shareable /live/:slug route.
   */
  async resolveSlug(slug: string, signal?: AbortSignal): Promise<Channel | null> {
    const cached = this.findCachedBySlug(slug);
    if (cached) return cached;

    for (const playlist of PLAYLISTS) {
      if (signal?.aborted) return null;
      try {
        const channels = await this.getChannels(playlist.url, signal);
        const hit = channels.find(c => c.slug === slug);
        if (hit) return hit;
      } catch {
        // A single unreachable playlist should not end the search.
      }
    }

    return null;
  },
};
