import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { useDispatch } from "react-redux";
import api from "../services/api";
import {
  setAuthError,
  setAuthLoading,
  setAuthUser,
  type AuthUser,
} from "../store/authSlice";
import type { AppDispatch } from "../store/store";

/**
 * Keeps the Redux auth slice in step with the Clerk session.
 *
 * On sign-in it fetches the local user record, because everything the API
 * stores (watchlist, history, reminders) is keyed by the local `users.id`, not
 * by the Clerk id. On sign-out it clears the slice immediately.
 *
 * Renders nothing. Must sit inside both `<ClerkProvider>` and the Redux
 * `<Provider>`.
 */
export function ClerkAuthSync() {
  const { isLoaded, isSignedIn } = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (!isLoaded) {
      dispatch(setAuthLoading(true));
      return;
    }

    if (!isSignedIn) {
      dispatch(setAuthUser(null));
      return;
    }

    // Guards against a slow response landing after the user signed out again.
    let cancelled = false;

    dispatch(setAuthLoading(true));

    api
      .get<{ data: AuthUser }>("/auth/me")
      .then(response => {
        if (!cancelled) dispatch(setAuthUser(response.data.data));
      })
      .catch(() => {
        if (!cancelled) {
          dispatch(setAuthError("Could not load your profile."));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, dispatch]);

  return null;
}

export default ClerkAuthSync;
