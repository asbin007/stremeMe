import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'https://backend-streame.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Supplies the current Clerk session token.
 *
 * Clerk's token is short-lived and only retrievable through a hook, so the
 * provider registers a getter once at startup (see `ClerkApiBridge`) rather
 * than this module reading a long-lived token out of localStorage.
 */
type TokenGetter = () => Promise<string | null>;

let getSessionToken: TokenGetter = async () => null;

export function setSessionTokenGetter(getter: TokenGetter): void {
  getSessionToken = getter;
}

api.interceptors.request.use(
  async config => {
    try {
      const token = await getSessionToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // A missing token is not fatal here — the request proceeds unauthenticated
      // and the server answers 401, which callers already handle.
    }
    return config;
  },
  error => Promise.reject(error)
);

export default api;
