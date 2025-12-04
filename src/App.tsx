import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import MovieDetails from "./pages/MovieDetails";
import TVShowDetails from "./pages/TVShowDetails";
import Movies from "./pages/Movies";
import TVShows from "./pages/TVShows";
import Sports from "./pages/Sports";
import Search from "./pages/Search";

import Login from "./pages/Login";
import Register from "./pages/Register";
import OTPVerification from "./pages/OTPVerification";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-primary text-text flex flex-col font-sans">
        <Navbar />
        <main className="flex-grow pt-16">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/tv/:id" element={<TVShowDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/movies" element={<Movies />} />
            <Route path="/tv" element={<TVShows />} />
            <Route path="/tv-shows" element={<TVShows />} />
            <Route path="/sports" element={<Sports />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<OTPVerification />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
