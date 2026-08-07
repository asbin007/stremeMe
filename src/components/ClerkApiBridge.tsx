import { useEffect } from "react";
import { useAuth } from "@clerk/react";
import { setSessionTokenGetter } from "../services/api";

/**
 * Hands the axios client a way to read the live Clerk session token.
 *
 * Clerk rotates tokens on a short expiry and only exposes them through
 * `useAuth`, so the token cannot be cached in a module or in localStorage —
 * the interceptor has to ask for a fresh one on every request.
 *
 * Renders nothing; it exists purely for the effect. Must sit inside
 * `<ClerkProvider>`.
 */
export function ClerkApiBridge() {
  const { getToken } = useAuth();

  useEffect(() => {
    setSessionTokenGetter(() => getToken());
  }, [getToken]);

  return null;
}

export default ClerkApiBridge;
