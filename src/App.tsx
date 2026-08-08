import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
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
      {/*
        Top padding clears the fixed navbar, which is 88px tall unscrolled
        (py-6) and shrinks to ~72px once scrolled (py-4). This was pt-16 —
        64px — so the top 24px of every page sat underneath the navbar.
        Padded for the taller state, since that is what a page loads with.
      */}
      <main id="main-content" className="grow pt-22 pb-20 md:pb-0">
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
 * The splash screen is gone.
 *
 * It held a black screen with the wordmark for 1.8s, and because it rendered
 * *instead of* the app rather than over it, the router never mounted and not a
 * single request went out until it finished. On the mobile connections most of
 * this audience is on, that was almost two seconds of dead time bolted onto an
 * already slow first load — and it replayed on every new tab, since it was
 * keyed on sessionStorage.
 *
 * It also broke deep links: opening a shared /movie/123 link showed the logo
 * before anything started loading. The navbar already carries the brand.
 */
function App() {
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

  return (
    <Router>
      <MainContent />
    </Router>
  );
}

export default App;
