import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, User } from "lucide-react";
import Button from "./Button";
import Input from "./Input";
import { APP_TITLE } from "../const";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors"
          >
            {APP_TITLE}
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive("/") ? "text-white" : "text-text-muted"
              }`}
            >
              Home
            </Link>
            <Link
              to="/movies"
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive("/movies") ? "text-white" : "text-text-muted"
              }`}
            >
              Movies
            </Link>
            <Link
              to="/tv"
              className={`text-sm font-medium transition-colors hover:text-white ${
                isActive("/tv") ? "text-white" : "text-text-muted"
              }`}
            >
              TV
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <form onSubmit={handleSearch} className="relative hidden sm:block">
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-secondary/50 border-white/10 focus:bg-secondary text-white placeholder:text-text-muted"
            />
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full text-text-muted hover:text-white"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <Link to="/login">
            <Button
              size="icon"
              variant="ghost"
              className="text-text-muted hover:text-white"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
