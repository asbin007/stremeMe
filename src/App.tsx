import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomeScreen from "./components/WelcomeScreen";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import useTrackVisit from "./hooks/useTrackVisit";

import Home from "./pages/Home";
import Watch from "./pages/Watch";
import LiveChannel from "./pages/LiveChannel";
import Anime from "./pages/Anime";
import MovieDetails from "./pages/MovieDetails";
import TVShowDetails from "./pages/TVShowDetails";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import Sports from "./pages/Sports";
import LiveTV from "./pages/LiveTV";
import HindiMovies from "./pages/HindiMovies";
import AdultMovies from "./pages/AdultMovies";
import Search from "./pages/Search";

import Login from "./pages/Login";
import Register from "./pages/Register";
import OTPVerification from "./pages/OTPVerification";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";

import { requestFirebaseToken, onForegroundMessage } from "./services/firebasePush";

// Content wrapper component to use the tracking hook
function MainContent() {
  useTrackVisit();

  return (
    <div className="min-h-screen bg-primary text-text flex flex-col font-sans">
      <Navbar />
      <main className="grow pt-16 pb-20 md:pb-0">
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
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/verify-otp" element={<OTPVerification />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
      <Footer />
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
