import React from "react";
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
                <a href="/" className="hover:text-accent">
                  Home
                </a>
              </li>
              <li>
                <a href="/movies" className="hover:text-accent">
                  Movies
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  TV Shows
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-md font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-accent">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/adult"
                  className="hover:text-accent opacity-50 text-xs"
                >
                  Mature
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-white text-md font-semibold mb-4">Connect</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-accent">
                  Twitter
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Facebook
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-accent">
                  Instagram
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Aura Screen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
