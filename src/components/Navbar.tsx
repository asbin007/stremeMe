import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, User } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

const Navbar: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(() => {
    if (location.pathname === "/") return "home";
    if (location.pathname.includes("movie")) return "movies";
    if (location.pathname.includes("tv")) return "tv";
    if (location.pathname.includes("sports")) return "sports";
    return "home";
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (location.pathname === "/") setActiveTab("home");
    else if (location.pathname.includes("movie")) setActiveTab("movies");
    else if (location.pathname.includes("tv")) setActiveTab("tv");
    else if (location.pathname.includes("sports")) setActiveTab("sports");
  }, [location]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { id: "home", label: "Home", path: "/" },
    { id: "movies", label: "Movies", path: "/movies" },
    { id: "tv", label: "TV Shows", path: "/tv" },
    { id: "sports", label: "Sports", path: "/sports" },
  ];

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
        <Link to="/" className="text-2xl font-bold text-gradient">
          StreamMe
        </Link>

        {/* Center Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-secondary/50 backdrop-blur-md rounded-full px-2 py-1.5 border border-white/10 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveTab(item.id)}
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
          <Link
            to="/search"
            className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full"
          >
            <Search className="w-5 h-5" />
          </Link>
          <Link
            to="/login"
            className="p-2 text-gray-400 hover:text-white transition-colors hover:bg-white/10 rounded-full"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
