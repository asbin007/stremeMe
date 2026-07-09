import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomeScreen from "./components/WelcomeScreen";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Skeleton } from "./components/Skeleton";
import useTrackVisit from "./hooks/useTrackVisit";
import { requestFirebaseToken, onForegroundMessage } from "./services/firebasePush";
import InstallBanner from "./components/InstallBanner";
import BackToTop from "./components/BackToTop";

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
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const OTPVerification = lazy(() => import("./pages/OTPVerification"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
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

  return (
    <div className="min-h-screen bg-primary text-text flex flex-col font-sans">
      <Navbar />
      <main className="grow pt-16 pb-20 md:pb-0">
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
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/providers" element={<Providers />} />
            <Route path="/provider" element={<ProviderContent />} />
            <Route path="/browse/:category" element={<BrowseAll />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
      <BackToTop />
      <InstallBanner />
    </div>
  );
}

function App() {
  const [showWelcome, setShowWelcome] = useState(() => {
    return !sessionStorage.getItem("hasSeenWelcome_v2");
  });

  useEffect(() => {
    // Request permission to send Push Notifications
    requestFirebaseToken();
    // Listen to foreground messages
    onForegroundMessage();
  }, []);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    sessionStorage.setItem("hasSeenWelcome_v2", "true");
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
