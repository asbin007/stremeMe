import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
// `Show` is v6's replacement for the old <SignedIn>/<SignedOut> pair.
import { Show, UserButton } from "@clerk/react";
import { Search, User, Menu, X, Home, Film, Tv, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import Logo from "./Logo";

const getActiveTab = (path: string) => {
  if (path === "/") return "home";
  if (path.startsWith("/hindi")) return "hindi";
  if (path.startsWith("/movies") || path.startsWith("/movie/")) return "movies";
  if (path.startsWith("/live-tv") || path.startsWith("/live/")) return "livetv";
  if (path.startsWith("/tv")) return "tv";
  if (path.startsWith("/anime")) return "anime";
  if (path.startsWith("/sports")) return "sports";
  return "";
};

const navItems = [
  { id: "home", label: "Home", path: "/" },
  { id: "livetv", label: "Live TV", path: "/live-tv" },
  { id: "movies", label: "Movies", path: "/movies" },
  { id: "tv", label: "TV Shows", path: "/tv" },
  { id: "hindi", label: "Hindi Movies", path: "/hindi-movies" },
  { id: "anime", label: "Anime", path: "/anime" },
  { id: "sports", label: "Sports", path: "/sports" },
];

const bottomNavItems = [
  { id: "home", label: "Home", path: "/", Icon: Home },
  { id: "movies", label: "Movies", path: "/movies", Icon: Film },
  { id: "tv", label: "TV", path: "/tv", Icon: Tv },
  { id: "livetv", label: "Live", path: "/live-tv", Icon: Radio },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);
  const activeTab = getActiveTab(location.pathname);
  const isProfileRoute =
    location.pathname === "/profile" || location.pathname.startsWith("/login");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    // Passive: this listener never calls preventDefault, and marking it so
    // keeps it off the scrolling critical path.
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Escape closes the drawer, and the page behind it must not scroll while it
  // is open — otherwise the body scrolls under the overlay on iOS.
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      aria-label="Main"
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "py-4 bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-2xl"
          : "py-6 bg-gradient-to-b from-black/80 to-transparent"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link
          to="/"
          aria-label="AuraScreen home"
          className="rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
        >
          <Logo size="md" />
        </Link>

        {/* Center navigation (desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-secondary/50 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10 shadow-lg">
          {navItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              aria-current={activeTab === item.id ? "page" : undefined}
              className="relative px-6 py-2 rounded-full text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {activeTab === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span
                className={clsx(
                  "relative z-10 transition-colors",
                  activeTab === item.id
                    ? "text-black"
                    : "text-text-muted hover:text-text"
                )}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            to="/search"
            aria-label="Search"
            className="p-2 text-text-muted hover:text-text transition-colors hover:bg-white/10 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Search className="size-5" aria-hidden="true" />
          </Link>

          {/* `UserButton` is itself a button, so it is rendered directly rather
              than nested inside a Link — nested interactive elements are
              invalid markup and swallow clicks. */}
          <Show
            when="signed-in"
            fallback={
              <Link
                to="/login"
                className="hidden md:inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-text ring-1 ring-white/10 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                <User className="size-4" aria-hidden="true" />
                Sign in
              </Link>
            }
          >
            <div className="hidden md:flex items-center">
              <UserButton
                userProfileMode="navigation"
                userProfileUrl="/profile"
              />
            </div>
          </Show>

          <button
            type="button"
            className="md:hidden p-2 text-text-muted hover:text-text rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            onClick={() => setMobileMenuOpen(open => !open)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="size-6" aria-hidden="true" />
            ) : (
              <Menu className="size-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />

            <motion.div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[80%] max-w-sm bg-background/95 backdrop-blur-xl border-l border-white/10 z-50 md:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <span className="text-xl font-bold text-gradient">Menu</span>
                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Close menu"
                    className="p-2 text-text-muted hover:text-text transition-colors rounded-full hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  >
                    <X className="size-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                  {navItems.map(item => (
                    <Link
                      key={item.id}
                      to={item.path}
                      // Closed here rather than in an effect on pathname, so
                      // navigating does not cost an extra render pass.
                      onClick={closeMobileMenu}
                      aria-current={activeTab === item.id ? "page" : undefined}
                      className={clsx(
                        "flex items-center px-4 py-4 rounded-xl text-lg font-medium transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                        activeTab === item.id
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : "text-text-muted hover:text-text hover:bg-white/5"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="p-6 border-t border-white/10 bg-black/20">
                  <Show
                    when="signed-in"
                    fallback={
                      <Link
                        to="/login"
                        onClick={closeMobileMenu}
                        className="flex items-center justify-center gap-3 w-full px-4 py-4 rounded-xl text-lg font-bold bg-accent text-primary transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <User className="size-5" aria-hidden="true" />
                        <span>Sign In</span>
                      </Link>
                    }
                  >
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 px-4 py-3">
                      <Link
                        to="/profile"
                        onClick={closeMobileMenu}
                        className="text-base font-semibold text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        My Profile
                      </Link>
                      <UserButton
                        userProfileMode="navigation"
                        userProfileUrl="/profile"
                      />
                    </div>
                  </Show>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile bottom bar. `pb-[env(safe-area-inset-bottom)]` keeps the row
          clear of the iOS home indicator — the previous `pb-safe` class is not
          a Tailwind utility and compiled to nothing. */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around p-3">
          {bottomNavItems.map(({ id, label, path, Icon }) => (
            <Link
              key={id}
              to={path}
              aria-current={activeTab === id ? "page" : undefined}
              className={clsx(
                "flex min-w-16 flex-col items-center gap-1 rounded-lg py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                activeTab === id
                  ? "text-text"
                  : "text-text-muted/70 hover:text-text-muted"
              )}
            >
              <Icon className="size-6" aria-hidden="true" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}

          <Link
            to="/profile"
            aria-current={isProfileRoute ? "page" : undefined}
            className={clsx(
              "flex min-w-16 flex-col items-center gap-1 rounded-lg py-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
              isProfileRoute
                ? "text-text"
                : "text-text-muted/70 hover:text-text-muted"
            )}
          >
            <User className="size-6" aria-hidden="true" />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
