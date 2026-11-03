import React from "react";
import { Link } from "react-router-dom";
import Logo from "./Logo";

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-text-muted py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Logo size="sm" />
            </div>
            <p className="text-sm">
              Your ultimate destination for movies and TV shows. Watch anywhere,
              anytime.
            </p>
          </div>
          <div>
            <h4 className="text-white text-md font-semibold mb-4">Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-accent">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/movies" className="hover:text-accent">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/tv-shows" className="hover:text-accent">
                  TV Shows
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-md font-semibold mb-4">Explore</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/anime" className="hover:text-accent">
                  Anime
                </Link>
              </li>
              <li>
                <Link to="/hindi-movies" className="hover:text-accent">
                  Hindi Movies
                </Link>
              </li>
              <li>
                <Link to="/live-tv" className="hover:text-accent">
                  Live TV
                </Link>
              </li>
              <li>
                <Link to="/sports" className="hover:text-accent">
                  Sports
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-md font-semibold mb-4">More</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/providers" className="hover:text-accent">
                  Providers
                </Link>
              </li>
              <li>
                <Link to="/search" className="hover:text-accent">
                  Search
                </Link>
              </li>
              <li>
                <Link
                  to="/adult"
                  className="hover:text-accent opacity-50 text-xs"
                >
                  Mature
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm space-y-2">
          <p>
            &copy; {new Date().getFullYear()} AuraScreen. All rights reserved.
          </p>
          <p className="text-xs text-gray-600 max-w-2xl mx-auto">
            This site does not store any files on our server, we only linked to the media
            which is hosted on 3rd party services. All content is provided by free public APIs.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
