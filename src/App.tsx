import { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import WelcomeScreen from "./components/WelcomeScreen";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Skeleton } from "./components/Skeleton";
import useTrackVisit from "./hooks/useTrackVisit";
import { syncPushRegistration, onForegroundMessage } from "./services/firebasePush";
import InstallBanner from "./components/InstallBanner";
import BackToTop from "./components/BackToTop";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";

const Home = lazy(() => import("./pages/Home"));
const Watch = lazy(() => import("./pages/Watch"));
const LiveChannel = lazy(() => import("./pages/LiveChannel"));
const Anime = lazy(() => import("./pages/Anime"));
const MovieDetails = lazy(() => import("./pages/MovieDetails"));
const TVShowDetails = lazy(() => import("./pages/TVShowDetails"));
const Movies = lazy(() => import("./pages/Movies"));
const TVShows = lazy(() => import("./pages/TVShows"));
const Sports = lazy(() => import("./pages/Sports"));
const LiveTV = lazy(() => import("./pages/LiveTV"));
const HindiMovies = lazy(() => import("./pages/HindiMovies"));
const AdultMovies = lazy(() => import("./pages/AdultMovies"));
const Search = lazy(() => import("./pages/Search"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Profile = lazy(() => import("./pages/Profile"));
const Providers = lazy(() => import("./pages/Providers"));
const ProviderContent = lazy(() => import("./pages/ProviderContent"));
const BrowseAll = lazy(() => import("./pages/BrowseAll"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageLoader() {
  return (
    <div className="container mx-auto px-4 py-8 md:px-8">
      <Skeleton className="mb-6 h-8 w-48" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <Skeleton key={index} className="aspect-[2/3] w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

// Content wrapper component to use the tracking hook
function MainContent() {
  useTrackVisit();
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-primary text-text flex flex-col font-sans">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary"
      >
        Skip to content
      </a>
      <ScrollToTop />
      <Navbar />
      <main id="main-content" className="grow pt-16 pb-20 md:pb-0">
        {/* Keyed by pathname so navigating away from a crashed page recovers
            instead of leaving the error screen stuck in place. */}
        <ErrorBoundary key={pathname} boundaryName="page">
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/watch/:slug" element={<Watch />} />
              <Route path="/live/:slug" element={<LiveChannel />} />
              <Route path="/anime" element={<Anime />} />
              <Route path="/movie/:id" element={<MovieDetails />} />
              <Route path="/tv/:id" element={<TVShowDetails />} />
              <Route path="/search" element={<Search />} />
              <Route path="/live-tv" element={<LiveTV />} />
              <Route path="/movies" element={<Movies />} />
              <Route path="/hindi-movies" element={<HindiMovies />} />
              <Route path="/adult" element={<AdultMovies />} />
              <Route path="/tv" element={<TVShows />} />
              <Route path="/tv-shows" element={<TVShows />} />
              <Route path="/sports" element={<Sports />} />

              {/* Splat paths are required: Clerk drives its multi-step flows
                  (factor-one, verify-email-address, SSO callback) as nested
                  routes beneath these paths. An exact match 404s mid-sign-in. */}
              <Route path="/login/*" element={<Login />} />
              <Route path="/register/*" element={<Register />} />

              <Route path="/profile" element={<Profile />} />
              <Route path="/providers" element={<Providers />} />
              <Route path="/provider" element={<ProviderContent />} />
              <Route path="/browse/:category" element={<BrowseAll />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <BackToTop />
      <InstallBanner />
    </div>
  );
}

/**
 * Remembered across visits, not just the tab session.
 *
 * This was sessionStorage, so the splash screen replayed in every new tab and
 * every new browser session — a regular viewer sat through the intro daily,
 * between them and the thing they came to watch. It is an introduction; it
 * should play once.
 */
const WELCOME_SEEN_KEY = "aurascreen:welcomeSeen";

function hasSeenWelcome(): boolean {
  try {
    return localStorage.getItem(WELCOME_SEEN_KEY) === "true";
  } catch {
    // Private mode: skip the intro rather than replay it on every navigation.
    return true;
  }
}

function App() {
  const [showWelcome, setShowWelcome] = useState(() => !hasSeenWelcome());

  useEffect(() => {
    // Only refresh the token for users who already opted in — never prompt on
    // load. An unsolicited permission dialog on first paint gets dismissed by
    // most users, and a dismissal blocks the origin permanently.
    syncPushRegistration();

    let unsubscribe: (() => void) | undefined;
    onForegroundMessage().then(fn => {
      unsubscribe = fn;
    });

    return () => unsubscribe?.();
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, "true");
    } catch {
      // Nothing to do; the intro simply plays again next time.
    }
  };

  return (
    <Router>
      {showWelcome ? (
        <WelcomeScreen onComplete={handleWelcomeComplete} />
      ) : (
        <MainContent />
      )}
    </Router>
  );
}

export default App;
