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
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  history: [],
  recents: [],
  watchLater: [],
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
  },
});

export const { clearUserError, toggleWatchLater } = userSlice.actions;
export default userSlice.reducer;
