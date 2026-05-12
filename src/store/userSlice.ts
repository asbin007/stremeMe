import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';

interface WatchHistoryItem {
  id: string;
  mediaId: string;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath: string;
  progress: number;
  duration: number;
  lastWatchedAt: string;
}

interface WatchLaterItem {
  id: string; // we can use mediaId here
  title: string;
  posterPath: string;
  mediaType: 'movie' | 'tv';
}

interface UserState {
  history: WatchHistoryItem[];
  recents: WatchHistoryItem[];
  watchLater: WatchLaterItem[];
  favorites: WatchLaterItem[];
  isLoading: boolean;
  error: string | null;
}

const loadSavedList = (key: string): WatchLaterItem[] => {
  if (typeof window === 'undefined') return [];

  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

const saveList = (key: string, list: WatchLaterItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(list));
};

const initialState: UserState = {
  history: [],
  recents: [],
  watchLater: loadSavedList('aura_watchlist'),
  favorites: loadSavedList('aura_favorites'),
  isLoading: false,
  error: null,
};

export const fetchHistory = createAsyncThunk(
  'user/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/history');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

export const fetchRecents = createAsyncThunk(
  'user/fetchRecents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/recents');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch recents');
    }
  }
);

export const addToHistory = createAsyncThunk(
  'user/addToHistory',
  async (data: { mediaId: string; mediaType: string; title: string; posterPath: string; progress: number; duration: number }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/history', data);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update history');
    }
  }
);

export const fetchWatchlist = createAsyncThunk(
  'user/fetchWatchlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/watchlist');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch watchlist');
    }
  }
);

export const fetchFavorites = createAsyncThunk(
  'user/fetchFavorites',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/favorites');
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch favorites');
    }
  }
);

export const syncWatchLater = createAsyncThunk(
  'user/syncWatchLater',
  async (data: WatchLaterItem, { getState, rejectWithValue }) => {
    const state = getState() as { user: UserState };
    const exists = state.user.watchLater.some((item) => item.id === data.id);

    try {
      if (exists) {
        await api.delete(`/auth/watchlist/${data.mediaType}/${data.id}`);
        return { item: data, shouldAdd: false };
      }

      const response = await api.post('/auth/watchlist', {
        mediaId: data.id,
        mediaType: data.mediaType,
        title: data.title,
        posterPath: data.posterPath,
      });
      return { item: response.data.data, shouldAdd: true };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update watchlist');
    }
  }
);

export const syncFavorite = createAsyncThunk(
  'user/syncFavorite',
  async (data: WatchLaterItem, { getState, rejectWithValue }) => {
    const state = getState() as { user: UserState };
    const exists = state.user.favorites.some((item) => item.id === data.id);

    try {
      if (exists) {
        await api.delete(`/auth/favorites/${data.mediaType}/${data.id}`);
        return { item: data, shouldAdd: false };
      }

      const response = await api.post('/auth/favorites', {
        mediaId: data.id,
        mediaType: data.mediaType,
        title: data.title,
        posterPath: data.posterPath,
      });
      return { item: response.data.data, shouldAdd: true };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update favorites');
    }
  }
);

const normalizeListItem = (item: any): WatchLaterItem => ({
  id: item.mediaId || item.id,
  title: item.title,
  posterPath: item.posterPath,
  mediaType: item.mediaType,
});

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    toggleWatchLater: (state, action) => {
      const item = action.payload; // WatchLaterItem
      const existingIndex = state.watchLater.findIndex((w) => w.id === item.id);
      if (existingIndex >= 0) {
        state.watchLater.splice(existingIndex, 1);
      } else {
        state.watchLater.push(item);
      }
      saveList('aura_watchlist', state.watchLater);
    },
    toggleFavorite: (state, action) => {
      const item = action.payload; // WatchLaterItem
      const existingIndex = state.favorites.findIndex((w) => w.id === item.id);
      if (existingIndex >= 0) {
        state.favorites.splice(existingIndex, 1);
      } else {
        state.favorites.push(item);
      }
      saveList('aura_favorites', state.favorites);
    },
  },
  extraReducers: (builder) => {
    // Fetch History
    builder.addCase(fetchHistory.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchHistory.fulfilled, (state, action) => {
      state.isLoading = false;
      state.history = action.payload;
    });
    builder.addCase(fetchHistory.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Recents
    builder.addCase(fetchRecents.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(fetchRecents.fulfilled, (state, action) => {
      state.isLoading = false;
      state.recents = action.payload;
    });
    builder.addCase(fetchRecents.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Add to History
    builder.addCase(addToHistory.fulfilled, (state, action) => {
      // Optimistically update or just re-fetch
      // For now, we can push to recents if it's not there, or update it
      const index = state.recents.findIndex(item => item.mediaId === action.payload.mediaId);
      if (index !== -1) {
        state.recents[index] = action.payload;
      } else {
        state.recents.unshift(action.payload);
      }
    });

    // Backend Watchlist
    builder.addCase(fetchWatchlist.fulfilled, (state, action) => {
      state.watchLater = action.payload.map(normalizeListItem);
      saveList('aura_watchlist', state.watchLater);
    });
    builder.addCase(syncWatchLater.fulfilled, (state, action) => {
      const item = normalizeListItem(action.payload.item);
      const existingIndex = state.watchLater.findIndex((w) => w.id === item.id);

      if (action.payload.shouldAdd && existingIndex === -1) {
        state.watchLater.push(item);
      }

      if (!action.payload.shouldAdd && existingIndex >= 0) {
        state.watchLater.splice(existingIndex, 1);
      }

      saveList('aura_watchlist', state.watchLater);
    });

    // Backend Favorites
    builder.addCase(fetchFavorites.fulfilled, (state, action) => {
      state.favorites = action.payload.map(normalizeListItem);
      saveList('aura_favorites', state.favorites);
    });
    builder.addCase(syncFavorite.fulfilled, (state, action) => {
      const item = normalizeListItem(action.payload.item);
      const existingIndex = state.favorites.findIndex((w) => w.id === item.id);

      if (action.payload.shouldAdd && existingIndex === -1) {
        state.favorites.push(item);
      }

      if (!action.payload.shouldAdd && existingIndex >= 0) {
        state.favorites.splice(existingIndex, 1);
      }

      saveList('aura_favorites', state.favorites);
    });
  },
});

export const { clearUserError, toggleWatchLater, toggleFavorite } = userSlice.actions;
export default userSlice.reducer;
