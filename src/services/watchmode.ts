import axios from 'axios';

const WATCHMODE_API_KEY = import.meta.env.VITE_WATCHMODE_API_KEY;
const BASE_URL = 'https://api.watchmode.com/v1';

const watchmodeApi = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: WATCHMODE_API_KEY,
  },
});

// Streaming source/platform info
export interface StreamingSource {
  source_id: number;
  name: string;
  type: 'sub' | 'rent' | 'buy' | 'free' | 'addon';
  region: string;
  ios_url: string;
  android_url: string;
  web_url: string;
  format: string;
  price: number | null;
  seasons: number | null;
  episodes: number | null;
}

// Title search result
export interface WatchmodeTitle {
  id: number;
  name: string;
  type: 'movie' | 'tv_series' | 'tv_movie' | 'short_film';
  year: number;
  imdb_id: string;
  tmdb_id: number;
  tmdb_type: 'movie' | 'tv';
}

// Title details from Watchmode
export interface WatchmodeTitleDetails {
  id: number;
  title: string;
  type: string;
  year: number;
  imdb_id: string;
  tmdb_id: number;
  tmdb_type: string;
  genres: number[];
  genre_names: string[];
  user_rating: number;
  critic_score: number;
  runtime_minutes: number;
  poster: string;
  plot_overview: string;
  sources: StreamingSource[];
}

// Available source/platform
export interface SourceInfo {
  id: number;
  name: string;
  type: string;
  logo_100px: string;
  ios_appstore_url: string;
  android_playstore_url: string;
  regions: string[];
}

export const watchmodeService = {
  /**
   * Search for a title by name
   */
  searchTitles: async (query: string, type?: 'movie' | 'tv') => {
    const params: Record<string, string> = { search_field: 'name', search_value: query };
    if (type) {
      params.types = type === 'movie' ? 'movie' : 'tv_series';
    }
    const response = await watchmodeApi.get<{ title_results: WatchmodeTitle[] }>('/search/', { params });
    return response.data.title_results;
  },

  /**
   * Get streaming sources for a title using its Watchmode ID
   */
  getSourcesByWatchmodeId: async (watchmodeId: number) => {
    const response = await watchmodeApi.get<StreamingSource[]>(`/title/${watchmodeId}/sources/`);
    return response.data;
  },

  /**
   * Get streaming sources using TMDB ID directly
   * This is the most useful method — pass the TMDB ID you already have
   */
  getSourcesByTmdbId: async (tmdbId: number, _mediaType: 'movie' | 'tv') => {
    const response = await watchmodeApi.get<StreamingSource[]>(`/title/${tmdbId}/sources/`, {
      params: {
        source_type: 'sub,free,rent,buy',
        append_to_response: 'sources',
      },
    });
    return response.data;
  },

  /**
   * Get title details (includes sources) by TMDB ID
   */
  getTitleDetailsByTmdb: async (tmdbId: number, mediaType: 'movie' | 'tv') => {
    const tmdbType = mediaType === 'movie' ? 'movie' : 'tv';
    // First, search by TMDB ID
    const searchResponse = await watchmodeApi.get<{ title_results: WatchmodeTitle[] }>('/search/', {
      params: {
        search_field: 'tmdb_id',
        search_value: tmdbId.toString(),
      },
    });

    const results = searchResponse.data.title_results;
    if (!results || results.length === 0) {
      return null;
    }

    // Find the matching result by type
    const match = results.find(r => r.tmdb_type === tmdbType) || results[0];

    // Get sources for this title
    const sources = await watchmodeApi.get<StreamingSource[]>(`/title/${match.id}/sources/`);
    return {
      ...match,
      sources: sources.data,
    };
  },

  /**
   * Get all available streaming platforms/sources
   */
  listSources: async () => {
    const response = await watchmodeApi.get<SourceInfo[]>('/sources/');
    return response.data;
  },

  /**
   * Get streaming availability grouped by type (subscription, rent, buy, free)
   */
  getGroupedSources: async (tmdbId: number, mediaType: 'movie' | 'tv') => {
    const data = await watchmodeService.getTitleDetailsByTmdb(tmdbId, mediaType);
    if (!data || !data.sources) return null;

    const grouped = {
      subscription: data.sources.filter(s => s.type === 'sub'),
      free: data.sources.filter(s => s.type === 'free'),
      rent: data.sources.filter(s => s.type === 'rent'),
      buy: data.sources.filter(s => s.type === 'buy'),
      addon: data.sources.filter(s => s.type === 'addon'),
    };

    return grouped;
  },
};

export default watchmodeService;
