import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/**
 * Mirrors the signed-in Clerk user into Redux.
 *
 * Clerk is the source of truth for identity — the register/login/OTP thunks
 * that used to live here are gone along with the backend's password endpoints.
 * This slice exists only so components that already read `state.auth` keep
 * working without each one pulling in Clerk hooks; `ClerkAuthSync` keeps it in
 * step with the live session.
 *
 * Nothing is persisted to localStorage: Clerk owns session storage, and a stale
 * copy here was how the app used to believe it was signed in after a sign-out.
 */
export interface AuthUser {
  /** Local `users.id` from the API, not the Clerk id. */
  id: string;
  username: string;
  email: string;
  role: string;
  avatarUrl?: string;
  isVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True until Clerk has finished restoring the session on first load. */
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Called by `ClerkAuthSync` whenever the Clerk session changes. */
    setAuthUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = action.payload !== null;
      state.isLoading = false;
      state.error = null;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setAuthError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: state => {
      state.error = null;
    },
  },
});

export const { setAuthUser, setAuthLoading, setAuthError, clearError } =
  authSlice.actions;
export default authSlice.reducer;
