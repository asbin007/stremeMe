import axios from 'axios';

// Use the backend API URL
// Use the direct TMDB API URL
const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_ACCESS_TOKEN = import.meta.env.VITE_TMDB_ACCESS_TOKEN ?? 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIwNWNhYTU4ZDEzOWIxNDlmZDM1NDMzYzNmZGU4ZTkyYyIsIm5iZiI6MTc1Mzg3NzQyNy42NjUsInN1YiI6IjY4OGEwYmIzZDVmNGY5ZTUyMTY5NDU5NSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.F_Aavt7ZKfn4-BQ4_pQYhv1GIu0hcCbNfeLXBy0Fltw';

const tmdbApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${API_ACCESS_TOKEN}`
  },
});

export interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: 'movie';
}

export interface TVShow {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  vote_average: number;
  genre_ids: number[];
  media_type?: 'tv';
}

export interface MovieDetails extends Movie {
  genres: { id: number; name: string }[];
  runtime: number;
  tagline: string;
  status: string;
  imdb_id?: string;
}

export interface TVShowDetails extends TVShow {
  genres: { id: number; name: string }[];
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: Season[];
  status: string;
  tagline: string;
}

export interface Season {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  episode_count: number;
  air_date: string;
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  vote_average: number;
  episode_number: number;
  season_number: number;
  air_date: string;
}

export interface SearchResults {
  page: number;
  results: (Movie | TVShow)[];
  total_pages: number;
  total_results: number;
}

export const getImageUrl = (path: string | null | undefined, size: string = 'w500') => {
  if (!path) return '';
  return `https://image.tmdb.org/t/p/${size}${path}`;
};

export const tmdbService = {
  getTrending: async (mediaType: 'movie' | 'tv' | 'all' = 'all', timeWindow: 'day' | 'week' = 'week', page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/trending/${mediaType}/${timeWindow}`, {
      params: { page },
    });
    return response.data;
  },

  getPopular: async (mediaType: 'movie' | 'tv', page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/${mediaType}/popular`, {
      params: { page },
    });
    return response.data;
  },

  getTopRated: async (mediaType: 'movie' | 'tv', page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/${mediaType}/top_rated`, {
      params: { page },
    });
    return response.data;
  },

  getUpcoming: async (mediaType: 'movie' | 'tv', page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/${mediaType}/upcoming`, {
      params: { page },
    });
    return response.data;
  },

  getNowPlaying: async (mediaType: 'movie' | 'tv', page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/${mediaType}/now_playing`, {
      params: { page },
    });
    return response.data;
  },

  getDetails: async (mediaType: 'movie' | 'tv', id: number) => {
    const response = await tmdbApi.get<MovieDetails | TVShowDetails>(`/${mediaType}/${id}`);
    return response.data;
  },

  getSeasonDetails: async (tvId: number, seasonNumber: number) => {
    const response = await tmdbApi.get<{ episodes: Episode[] }>(`/tv/${tvId}/season/${seasonNumber}`);
    return response.data;
  },

  searchMulti: async (query: string, page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/search/multi`, {
      params: { query, page },
    });
    return response.data;
  },
  
  getSimilar: async (mediaType: 'movie' | 'tv', id: number) => {
      const response = await tmdbApi.get<SearchResults>(`/${mediaType}/${id}/similar`);
      return response.data;
  },

  getRecommendations: async (mediaType: 'movie' | 'tv', id: number) => {
    const response = await tmdbApi.get<SearchResults>(`/${mediaType}/${id}/recommendations`);
    return response.data;
  },

  getVideos: async (mediaType: 'movie' | 'tv', id: number) => {
    const response = await tmdbApi.get<{ results: { key: string; site: string; type: string }[] }>(`/${mediaType}/${id}/videos`);
    return response.data;
  },

  getGenres: async (mediaType: 'movie' | 'tv') => {
    const response = await tmdbApi.get<{ genres: { id: number; name: string }[] }>(`/genre/${mediaType}/list`);
    return response.data;
  },

  discover: async (mediaType: 'movie' | 'tv', page: number = 1, genreId?: number | string) => {
    const params: Record<string, string | number> = { page };
    if (genreId) {
      params.with_genres = genreId;
    }
    const response = await tmdbApi.get<SearchResults>(`/discover/${mediaType}`, { params });
    return response.data;
  },

  getSeasonal: async (mediaType: 'movie' | 'tv') => {
    const response = await tmdbApi.get<SearchResults>(`/discover/${mediaType}`, {
      params: {
        with_keywords: '207317', // 'christmas' keyword ID
        sort_by: 'popularity.desc',
        page: 1
      }
    });
    return response.data;
  },

  getContents: async (mediaType: 'movie' | 'tv', filters: { page?: number; sortBy?: string; genreId?: number } = {}) => {
    const params: Record<string, string | number> = {
      page: filters.page || 1,
      sort_by: filters.sortBy || 'popularity.desc',
    };
    if (filters.genreId) {
      params.with_genres = filters.genreId;
    }
    const response = await tmdbApi.get<SearchResults>(`/discover/${mediaType}`, { params });
    return response.data;
  },
  getCredits: async (mediaType: 'movie' | 'tv', id: number) => {
    const response = await tmdbApi.get<{ cast: { id: number; name: string; character: string; profile_path: string | null }[] }>(`/${mediaType}/${id}/credits`);
    return response.data;
  },

  getReviews: async (mediaType: 'movie' | 'tv', id: number) => {
    const response = await tmdbApi.get<{ results: { id: string; author: string; content: string; created_at: string; author_details: { rating: number | null; avatar_path: string | null } }[] }>(`/${mediaType}/${id}/reviews`);
    return response.data;
  },

  getBollywoodMovies: async (page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/discover/movie`, {
      params: {
        page,
        with_original_language: 'hi',
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  },

  getHindiNewReleases: async (page: number = 1) => {
    const currentYear = new Date().getFullYear();
    const response = await tmdbApi.get<SearchResults>(`/discover/movie`, {
      params: {
        page,
        with_original_language: 'hi',
        primary_release_year: currentYear,
        sort_by: 'release_date.desc'
      }
    });
    return response.data;
  },

  getHindiActionMovies: async (page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/discover/movie`, {
      params: {
        page,
        with_original_language: 'hi',
        with_genres: '28', // Action
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  },

  getHindiRomanceMovies: async (page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/discover/movie`, {
      params: {
        page,
        with_original_language: 'hi',
        with_genres: '10749', // Romance
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  },

  getHindiComedyMovies: async (page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/discover/movie`, {
      params: {
        page,
        with_original_language: 'hi',
        with_genres: '35', // Comedy
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  },

  getSouthActionMovies: async (page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/discover/movie`, {
      params: {
        page,
        with_original_language: 'te|ta|ml|kn', // Telugu, Tamil, Malayalam, Kannada
        with_genres: '28', // Action
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  },

  getSouthMovies: async (page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/discover/movie`, {
      params: {
        page,
        with_original_language: 'te|ta|ml|kn', // Telugu, Tamil, Malayalam, Kannada
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  },

  // Anime Methods
  getAnimeMovies: async (page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/discover/movie`, {
      params: {
        page,
        with_genres: '16', // Animation
        with_original_language: 'ja',
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  },

  getAnimeSeries: async (page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/discover/tv`, {
      params: {
        page,
        with_genres: '16', // Animation
        with_original_language: 'ja',
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  },

  getAnimeAction: async (page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/discover/tv`, {
      params: {
        page,
        with_genres: '16,10759', // Animation + Action & Adventure
        with_original_language: 'ja',
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  },

  getAnimeRomance: async (page: number = 1) => {
    const response = await tmdbApi.get<SearchResults>(`/discover/tv`, {
      params: {
        page,
        with_genres: '16,18', // Animation + Drama (Romance often falls here or Comedy)
        with_original_language: 'ja',
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  },
  
  // Mature / Adult Section Methods
  getMatureMovies: async (page: number = 1) => {
     // Fetch R-rated or similar "Mature" content (usually Thriller/Romance/Crime)
    const response = await tmdbApi.get<SearchResults>(`/discover/movie`, {
      params: {
        page,
        with_genres: '53,80,10749', // Thriller, Crime, Romance
        certification_country: 'US',
        certification: 'R',
        sort_by: 'popularity.desc'
      }
    });
    return response.data;
  },
  
  getAdultRomance: async (page: number = 1) => {
      const response = await tmdbApi.get<SearchResults>(`/discover/movie`, {
        params: {
          page,
          with_genres: '10749', // Romance
          certification_country: 'US',
          certification: 'R', // Target R-rated romance
          sort_by: 'popularity.desc'
        }
      });
      return response.data;
  },
};

export default tmdbService;
