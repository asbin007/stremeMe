import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Resets scroll position on navigation.
 *
 * A client-side router keeps the document scrolled where it was, so following a
 * link from halfway down a long grid used to land the next page mid-content.
 * Back/forward navigations are left alone — the browser restores those itself.
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }

    // Instant, not smooth: animating to the top of a page the user has not
    // seen yet reads as a glitch rather than a transition.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

export default ScrollToTop;
