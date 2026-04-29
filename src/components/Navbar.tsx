import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Search, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import type { RootState } from "../store/store";
import Logo from "./Logo";

const getActiveTab = (path: string) => {
  if (path === "/") return "home";
  if (path.startsWith("/movies")) return "movies";
  if (path.startsWith("/tv")) return "tv";
  if (path.startsWith("/hindi")) return "hindi";
  if (path.startsWith("/anime")) return "anime";
  if (path.startsWith("/sports")) return "sports";
  if (path.startsWith("/live-tv")) return "livetv";
  return "";
};

const Navbar: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );
  const [scrolled, setScrolled] = useState(false);
  const activeTab = getActiveTab(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "home", label: "Home", path: "/" },
    { id: "livetv", label: "Live TV", path: "/live-tv" },
    { id: "movies", label: "Movies", path: "/movies" },
    { id: "tv", label: "TV Shows", path: "/tv" },
    { id: "hindi", label: "Hindi Movies", path: "/hindi-movies" },
    { id: "anime", label: "Anime", path: "/anime" },
    { id: "sports", label: "Sports", path: "/sports" },
  ];

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={clsx(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "py-4 bg-background/80 backdrop-blur-lg border-b border-white/5"
          : "py-6 bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <Logo size="md" />
        </Link>

        {/* Center Navigation (Desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-secondary/50 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className="relative px-6 py-2 rounded-full text-sm font-medium transition-colors"
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
                    : "text-gray-400 hover:text-white"
                )}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <a
            href="https://www.profitablecpmratenetwork.com/p1ti6fg46?key=02bddff71e147b8dcaa0db926c4dc7e9"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:block px-4 py-2 bg-gradient-to-r from-yellow-500 to-amber-600 text-white text-sm font-bold rounded-full hover:shadow-lg hover:scale-105 transition-all"
          >
            Premium
          </a>
          <Link
            to="/search"
            className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full"
          >
            <Search className="w-5 h-5" />
          </Link>
          <Link
            to={isAuthenticated ? "/profile" : "/login"}
            className="hidden md:block p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full"
          >
            {isAuthenticated ? (
              <div className="w-8 h-8 rounded-full overflow-hidden border border-accent/50">
                <img
                  src={
                    user?.avatarUrl ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`
                  }
                  alt={user?.username}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <User className="w-5 h-5" />
            )}
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />

            {/* Side Drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-[75%] max-w-sm bg-background/95 backdrop-blur-xl border-l border-white/10 z-50 md:hidden shadow-2xl"
            >
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                  <span className="text-xl font-bold text-gradient">Menu</span>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
                  {navItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={clsx(
                        "flex items-center px-4 py-4 rounded-xl text-lg font-medium transition-all duration-200",
                        activeTab === item.id
                          ? "bg-accent/10 text-accent border border-accent/20"
                          : "text-gray-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <a
                    href="https://www.profitablecpmratenetwork.com/p1ti6fg46?key=02bddff71e147b8dcaa0db926c4dc7e9"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center px-4 py-4 rounded-xl text-lg font-bold text-yellow-500 hover:text-yellow-400 hover:bg-white/5 transition-all"
                  >
                    Premium Access
                  </a>
                </div>

                <div className="p-6 border-t border-white/10 bg-black/20">
                  <Link
                    to={isAuthenticated ? "/profile" : "/login"}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 w-full px-4 py-4 rounded-xl text-lg font-bold bg-white/5 hover:bg-white/10 text-white transition-all border border-white/5"
                  >
                    {isAuthenticated ? (
                      <>
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-accent/50">
                          <img
                            src={
                              user?.avatarUrl ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`
                            }
                            alt={user?.username}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span>My Profile</span>
                      </>
                    ) : (
                      <>
                        <User className="w-5 h-5" />
                        <span>Sign In</span>
                      </>
                    )}
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
