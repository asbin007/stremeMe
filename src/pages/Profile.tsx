import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/react";
import { motion } from "framer-motion";
import { LogOut, Clock, PlayCircle, Bookmark, Mail } from "lucide-react";
import { fetchHistory, fetchRecents } from "../store/userSlice";
import type { RootState, AppDispatch } from "../store/store";
import { getImageUrl } from "../services/tmdb";
import { Skeleton } from "../components/Skeleton";

/** Percentage watched, guarding the divide — `duration` is 0 for live items. */
const watchedPercent = (progress: number, duration: number): number => {
  if (!duration || duration <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((progress / duration) * 100)));
};

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { signOut } = useClerk();
  const {
    user,
    isAuthenticated,
    isLoading: isAuthLoading,
  } = useSelector((state: RootState) => state.auth);
  const { history, recents, watchLater, isLoading } = useSelector(
    (state: RootState) => state.user
  );

  const [emailStatus, setEmailStatus] = useState<string | null>(null);

  useEffect(() => {
    // Wait for Clerk to restore the session before deciding to redirect —
    // otherwise a signed-in user is bounced to /login on every hard refresh.
    if (isAuthLoading) return;

    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    dispatch(fetchHistory());
    dispatch(fetchRecents());
  }, [isAuthLoading, isAuthenticated, navigate, dispatch]);

  const handleLogout = () => {
    // Clerk owns the session; clearing it cascades into the Redux slice via
    // ClerkAuthSync, so there is nothing to dispatch here.
    signOut({ redirectUrl: "/" });
  };

  const handleItemClick = (item: {
    mediaType: string;
    mediaId?: string;
    id: string;
  }) => {
    navigate(`/${item.mediaType}/${item.mediaId || item.id}`);
  };

  const handleEmailList = async () => {
    if (watchLater.length === 0) {
      setEmailStatus("List is empty");
      return;
    }
    
    setEmailStatus("Sending...");
    try {
      const response = await fetch("http://localhost:3001/api/email/watch-later-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user?.email, watchLaterList: watchLater }),
      });
      
      if (response.ok) {
        setEmailStatus("Sent!");
      } else {
        setEmailStatus("Failed to send");
      }
    } catch (err) {
      console.error(err);
      setEmailStatus("Failed to send");
    }
    
    setTimeout(() => setEmailStatus(null), 3000);
  };

  // A blank screen while the profile loads reads as a broken page; show the
  // shape of the content instead.
  if (isAuthLoading || !user) {
    return (
      <div className="container mx-auto min-h-screen px-4 pt-8 pb-12">
        <div className="mx-auto max-w-6xl">
          <Skeleton className="mb-12 h-40 w-full rounded-2xl" />
          <Skeleton className="mb-6 h-8 w-56" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="aspect-video w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-8 px-4 container mx-auto pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        {/* Profile Header */}
        <div className="bg-secondary/30 backdrop-blur-xl border border-white/10 rounded-2xl p-8 mb-12 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-accent/50 shadow-lg shadow-accent/20">
              <img
                src={
                  user.avatarUrl ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`
                }
                alt={user.username}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center md:justify-start gap-3">
              {user.username}
              {user.isVerified && (
                <span className="bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full text-xs text-green-500 font-medium">
                  Verified
                </span>
              )}
            </h1>
            <p className="text-text-muted mb-4">{user.email}</p>
            <div className="flex flex-wrap gap-3 justify-center md:justify-start">
              <span className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-sm text-text-muted capitalize">
                {user.role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-6 py-3 rounded-xl transition-colors border border-red-500/20"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>

        {/* Continue Watching (Recents) */}
        {recents.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <PlayCircle className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold text-white">
                Continue Watching
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recents.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-secondary/20 rounded-xl overflow-hidden cursor-pointer group border border-white/5 hover:border-accent/50 transition-all"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={getImageUrl(item.posterPath)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-12 h-12 text-white" />
                    </div>
                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                      <div
                        className="h-full bg-accent"
                        style={{
                          width: `${watchedPercent(item.progress, item.duration)}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-muted mt-1 capitalize">
                      {item.mediaType}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Watch Later */}
        {watchLater.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Bookmark className="w-6 h-6 text-accent" />
                <h2 className="text-2xl font-bold text-white">Watch Later</h2>
              </div>
              <button 
                onClick={handleEmailList}
                className="flex items-center gap-2 bg-accent/20 hover:bg-accent/40 text-accent px-4 py-2 rounded-lg transition-colors border border-accent/20"
                disabled={emailStatus === "Sending..."}
              >
                <Mail className="w-4 h-4" />
                {emailStatus || "Email my List"}
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {watchLater.map((item) => (
                <motion.div
                  key={item.id}
                  whileHover={{ scale: 1.05 }}
                  className="bg-secondary/20 rounded-xl overflow-hidden cursor-pointer group border border-white/5 hover:border-accent/50 transition-all"
                  onClick={() => handleItemClick(item)}
                >
                  <div className="aspect-[2/3]">
                    <img
                      src={getImageUrl(item.posterPath)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-white text-sm font-medium truncate">
                      {item.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Watch History */}
        {history.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Clock className="w-6 h-6 text-accent" />
              <h2 className="text-2xl font-bold text-white">Watch History</h2>
            </div>
            <div className="bg-secondary/10 rounded-2xl overflow-hidden border border-white/5">
              {history.map((item, index) => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`flex items-center gap-4 p-4 hover:bg-white/5 transition-colors cursor-pointer ${
                    index !== history.length - 1
                      ? "border-b border-white/5"
                      : ""
                  }`}
                >
                  <img
                    src={getImageUrl(item.posterPath)}
                    alt={item.title}
                    className="w-16 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-medium truncate">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-muted capitalize">
                      {item.mediaType}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Watched on{" "}
                      {new Date(item.lastWatchedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right hidden sm:block">
                    <span className="text-accent text-sm">
                      {watchedPercent(item.progress, item.duration)}% Complete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recents.length === 0 && history.length === 0 && watchLater?.length === 0 && !isLoading && (
          <div className="text-center py-20 text-text-muted">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No watch history or watch later items</p>
            <p className="text-sm">
              Start watching movies and shows to see them here
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Profile;
