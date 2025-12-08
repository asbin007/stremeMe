import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogOut, Clock, PlayCircle } from "lucide-react";
import { logout } from "../store/authSlice";
import { fetchHistory, fetchRecents } from "../store/userSlice";
import type { RootState, AppDispatch } from "../store/store";
import { getImageUrl } from "../services/tmdb";

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { history, recents, isLoading } = useSelector(
    (state: RootState) => state.user
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    dispatch(fetchHistory());
    dispatch(fetchRecents());
  }, [isAuthenticated, navigate, dispatch]);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

  const handleItemClick = (item: any) => {
    navigate(`/${item.mediaType}/${item.mediaId}`);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 px-4 container mx-auto pb-12">
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
                          width: `${(item.progress / item.duration) * 100}%`,
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
                      {Math.round((item.progress / item.duration) * 100)}%
                      Complete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recents.length === 0 && history.length === 0 && !isLoading && (
          <div className="text-center py-20 text-text-muted">
            <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="text-lg">No watch history yet</p>
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
